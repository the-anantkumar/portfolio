import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, writeFile, stat, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { RAG_MODEL } from "../src/lib/rag-config.mjs";
import { validateRagSelection } from "../src/lib/rag.mjs";

const release = JSON.parse(await readFile("dist/release.json", "utf8"));
const corpus = JSON.parse(await readFile("dist/knowledge.json", "utf8"));
const root = path.resolve("dist");
const mime = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".wasm": "application/wasm", ".json": "application/json", ".svg": "image/svg+xml", ".txt": "text/plain" };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    assert(pathname.startsWith(release.base));
    let file = path.resolve(root, pathname.slice(release.base.length));
    assert(file === root || file.startsWith(`${root}${path.sep}`));
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    response.setHeader("Content-Type", mime[path.extname(file)] ?? "application/octet-stream");
    response.end(await readFile(file));
  } catch { response.writeHead(404); response.end("Not found"); }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}${release.base}`;
const askURL = new URL("ask/", base).href;
const browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) });
await mkdir("artifacts/rag/screenshots", { recursive: true });

async function submit(page, text) {
  await page.locator("#ask-question").fill(text);
  await page.getByRole("button", { name: "Find relevant passages", exact: true }).click();
  await page.locator("#ask-results").waitFor({ state: "visible" });
  await page.waitForFunction(() => document.querySelector("#ask-results").getAttribute("aria-busy") === "false");
}
async function enable(page, timeout = 30_000) {
  if (!await page.locator("#rag-enhancement").evaluate((el) => el.open)) await page.locator("#rag-enhancement > summary").click();
  await page.locator("#rag-enable").click();
  await page.waitForFunction(() => document.querySelector("#rag-status").textContent.includes("Local answers ready"), undefined, { timeout });
}
async function assertQuotes(page) {
  const quotes = await page.locator("#rag-answer-content article").evaluateAll((nodes) => nodes.map((node) => ({ id: node.dataset.passageId, text: node.querySelector("blockquote").textContent, attribution: node.querySelector("p").textContent, url: node.querySelector("a").getAttribute("href") })));
  assert(quotes.length > 0);
  for (const quote of quotes) {
    const source = corpus.passages.find((entry) => entry.id === quote.id);
    assert(source, "Every rendered answer must use a public corpus ID");
    assert.equal(quote.text, source.text);
    assert.equal(quote.attribution, source.context);
    assert.equal(quote.url, source.url);
  }
}
const mockWorker = `let mode='valid';self.onmessage=({data})=>{
 if(data.type==='test-mode'){mode=data.mode;return;}
 if(data.type==='load'){setTimeout(()=>postMessage({type:'ready'}),150);return;}
 if(data.type==='generate'){const current=mode;setTimeout(()=>{
  if(current==='error'){postMessage({type:'error',id:data.id,message:'fixture failure'});return;}
  postMessage({type:'answer',id:data.id,raw:current==='malformed'?'{"sources":[99],"html":"<script>bad</script>"}':current==='abstain'?'{"sources":[]}':'{"sources":[1]}'});
 },current==='slow'?700:60);}
};`;
try {
  for (const width of [1440, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 950 }, reducedMotion: "reduce" });
    const requests = [], errors = [];
    context.on("request", (request) => requests.push({ url: request.url(), body: request.postData() }));
    await context.addInitScript(() => {
      const Original = window.Worker;
      window.__ragWorkers = []; window.__ragGenerations = 0;
      window.Worker = class extends Original {
        constructor(url, options) { super(url, options); if (String(url).includes("rag-worker")) window.__ragWorkers.push(this); }
        postMessage(message, ...rest) { if (message?.type === "generate") window.__ragGenerations++; return super.postMessage(message, ...rest); }
      };
    });
    await context.route(/rag-worker[^/]*\.js$/, (route) => route.fulfill({ contentType: "text/javascript", body: mockWorker }));
    const page = await context.newPage(); page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(askURL);
    await submit(page, "What remains pending in the Nielsen classification design?");
    assert.equal(requests.filter(({ url }) => /rag-worker|\.onnx|\.wasm|huggingface/.test(url)).length, 0, "Search must not download the answer model");
    await page.locator("#rag-enhancement > summary").focus(); await page.keyboard.press("Enter");
    assert(await page.locator("#rag-enable").isVisible());
    await enable(page);
    await page.locator("#rag-generate").click();
    await page.locator("#rag-answer-content blockquote").first().waitFor();
    await assertQuotes(page);
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    assert.deepEqual(axe.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) })), [], `${width}px RAG accessibility`);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px overflow`);
    await page.screenshot({ path: `artifacts/rag/screenshots/answer-${width}.png`, fullPage: true });

    await page.evaluate(() => window.__ragWorkers.at(-1).postMessage({ type: "test-mode", mode: "malformed" }));
    await page.locator("#rag-generate").click();
    await page.waitForFunction(() => document.querySelector("#rag-answer-status").textContent.includes("did not pass source checks"));
    assert.equal(await page.locator("#rag-answer-content article").count(), 0, "Malformed answers cannot render even partial prose");
    await page.evaluate(() => window.__ragWorkers.at(-1).postMessage({ type: "test-mode", mode: "abstain" }));
    await page.locator("#rag-generate").click();
    await page.waitForFunction(() => document.querySelector("#rag-answer-status").textContent.includes("could not select"));
    assert.equal(await page.locator("#rag-answer-content article").count(), 0);
    await page.evaluate(() => window.__ragWorkers.at(-1).postMessage({ type: "test-mode", mode: "error" }));
    await page.locator("#rag-generate").click();
    await page.waitForFunction(() => document.querySelector("#rag-status").textContent.includes("model stopped"));
    assert(await page.locator("#rag-enable").isVisible(), "Worker errors must offer an explicit retry");
    await enable(page);
    const generationCount = await page.evaluate(() => window.__ragGenerations);
    await submit(page, "What is Anant's phone number?");
    assert(await page.locator("#rag-answer-panel").isHidden());
    assert.equal(await page.evaluate(() => window.__ragGenerations), generationCount, "Private questions never invoke generation");

    await submit(page, "What remains pending in the Nielsen classification design?");
    await page.evaluate(() => window.__ragWorkers.at(-1).postMessage({ type: "test-mode", mode: "slow" }));
    await page.locator("#rag-generate").click();
    await page.locator("#ask-question").fill("A newer question");
    await page.waitForTimeout(800);
    assert.equal(await page.locator("#rag-answer-content article").count(), 0);
    assert(await page.locator("#rag-answer-panel").isHidden(), "An edited question invalidates the previous answer");
    assert(await page.locator("#rag-enable").isVisible());

    await enable(page); await submit(page, "What remains pending in the Nielsen classification design?");
    await page.evaluate(() => window.__ragWorkers.at(-1).postMessage({ type: "test-mode", mode: "slow" }));
    await page.locator("#rag-generate").click();
    await page.locator('[data-ask-topic="founder"]').click();
    await page.waitForTimeout(800);
    assert.equal(await page.locator("#rag-answer-content article").count(), 0, "A late generation cannot overwrite a topic");

    await enable(page); await page.locator("#rag-generate").click();
    await page.locator("#rag-stop").click();
    await page.waitForTimeout(100);
    assert.equal(await page.locator("#rag-answer-content article").count(), 0);
    assert(await page.locator("#rag-enable").isVisible());
    await page.evaluate(async (key) => { await caches.open(key); await caches.open("unrelated-cache-fixture"); }, RAG_MODEL.cacheKey);
    await page.locator("#rag-clear").click();
    await page.waitForFunction(() => document.querySelector("#rag-status").textContent.includes("cache removed"));
    const keys = await page.evaluate(() => caches.keys());
    assert(!keys.includes(RAG_MODEL.cacheKey)); assert(keys.includes("unrelated-cache-fixture"));
    assert.deepEqual(errors, []);
    assert.deepEqual(await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage), search: location.search })), { local: [], session: [], search: "" }, "Visitor questions are not persisted or put in the page URL");
    assert(requests.every(({ url, body }) => new URL(url).origin === new URL(base).origin && body === null), "Default RAG tests make only same-origin GET requests");
    await context.close();
  }
  const context = await browser.newContext();
  await context.route(/rag-worker[^/]*\.js$/, (route) => route.fulfill({ contentType: "text/javascript", body: "self.onmessage=()=>setTimeout(()=>postMessage({type:'ready'}),1500)" }));
  const page = await context.newPage(); await page.goto(askURL);
  await page.locator("#rag-enhancement > summary").click(); await page.locator("#rag-enable").click(); await page.locator("#rag-stop").click();
  await page.waitForTimeout(1600);
  assert(await page.locator("#rag-enable").isVisible(), "Cancellation during download must ignore late ready messages");
  assert.match(await page.locator("#rag-status").innerText(), /off/);
  await context.close();
  console.log("RAG interface checks passed: opt-in, exact source text/citations, malformed fallback, private preflight, stale edits/topics, cancellation, scoped cache removal, keyboard, mobile, and axe.");

  if (process.env.TEST_RAG_MODEL === "1") {
    const context = await browser.newContext({ viewport: { width: 390, height: 950 } });
    const page = await context.newPage();
    const requests = [], bodySizes = [];
    context.on("request", (request) => requests.push({ url: request.url(), body: request.postData() }));
    context.on("requestfinished", (request) => bodySizes.push(request.sizes().then((value) => value.responseBodySize).catch(() => 0)));
    await page.goto(askURL);
    const uiQuestion = "What did the Nielsen parallel validation run establish?";
    await submit(page, uiQuestion);
    const uiStart = performance.now();
    await enable(page, 240_000);
    const uiReadyMilliseconds = Math.round(performance.now() - uiStart);
    await page.locator("#rag-generate").click();
    await page.waitForFunction(() => !document.querySelector("#rag-answer-status").textContent.includes("Composing"), undefined, { timeout: 90_000 });
    const uiResult = {
      question: uiQuestion, modelReadyMilliseconds: uiReadyMilliseconds,
      cachedModelReadyMilliseconds: 0, reportedColdResponseBodyBytes: 0, reportedReloadResponseBodyBytes: 0, cachedAssets: [],
      totalMilliseconds: Math.round(performance.now() - uiStart),
      retrievedIds: await page.locator(".ask-evidence-passage").evaluateAll((nodes) => nodes.map((node) => node.dataset.passageId)),
      answerIds: await page.locator("#rag-answer-content article").evaluateAll((nodes) => nodes.map((node) => node.dataset.passageId)),
      status: await page.locator("#rag-answer-status").innerText(),
    };
    uiResult.reportedColdResponseBodyBytes = (await Promise.all(bodySizes)).reduce((sum, bytes) => sum + bytes, 0);
    uiResult.cachedAssets = await page.evaluate(async (key) => {
      const cache = await caches.open(key);
      return Promise.all((await cache.keys()).map(async (request) => {
        const response = await cache.match(request);
        const contentLength = response?.headers.get("content-length");
        return { url: request.url, contentLengthBytes: contentLength === null || contentLength === undefined ? null : Number(contentLength) };
      }));
    }, RAG_MODEL.cacheKey);
    if (uiResult.answerIds.length) await assertQuotes(page);
    await page.screenshot({ path: "artifacts/rag/screenshots/actual-model-answer.png", fullPage: true });
    if (await page.locator("#rag-stop").isVisible()) await page.locator("#rag-stop").click();
    const cachedStart = performance.now();
    await enable(page, 240_000);
    uiResult.cachedModelReadyMilliseconds = Math.round(performance.now() - cachedStart);
    uiResult.reportedReloadResponseBodyBytes = (await Promise.all(bodySizes)).reduce((sum, bytes) => sum + bytes, 0) - uiResult.reportedColdResponseBodyBytes;
    await page.locator("#rag-generate").click();
    await page.locator("#rag-stop").click();
    await page.waitForTimeout(1000);
    assert.equal(await page.locator("#rag-answer-content article").count(), 0, "Actual inference cancellation must discard pending output");
    assert(await page.locator("#rag-enable").isVisible());
    uiResult.actualInferenceCancellation = "passed";
    const workerFile = (await readdir("dist/_astro")).find((name) => /^rag-worker.*\.js$/.test(name));
    assert(workerFile);
    const cases = [
      ...JSON.parse(await readFile("experiments/rag/cases.json", "utf8")).cases.map((test) => ({ ...test, cohort: "screening" })),
      ...JSON.parse(await readFile("experiments/rag/holdout.json", "utf8")).cases.map((test) => ({ ...test, cohort: "holdout" })),
    ];
    const samples = cases.map((test) => ({ ...test, sources: test.passages.map((id) => corpus.passages.find((source) => source.id === id)) }));
    const progressRows = [];
    await page.exposeFunction("recordRagCase", async (row) => {
      progressRows.push(row);
      await writeFile("artifacts/rag/browser-progress.json", `${JSON.stringify({ candidate: RAG_MODEL, cases: progressRows }, null, 2)}\n`);
      console.log(`Actual worker completed ${row.id}: ${row.milliseconds} ms${row.error ? ", rejected output or runtime error" : ""}`);
    });
    const report = await page.evaluate(async ({ workerURL, samples }) => {
      const instance = new Worker(workerURL, { type: "module" });
      const started = performance.now();
      const wait = (predicate, timeout = 240_000) => new Promise((resolve, reject) => {
        const timer = setTimeout(() => { instance.removeEventListener("message", listener); reject(new Error("Real RAG worker timed out")); }, timeout);
        const listener = ({ data }) => { if (predicate(data)) { clearTimeout(timer); instance.removeEventListener("message", listener); resolve(data); } };
        instance.addEventListener("message", listener);
      });
      try {
        const ready = wait((data) => data.type === "ready" || data.type === "error"); instance.postMessage({ type: "load" });
        const loaded = await ready; if (loaded.type === "error") throw new Error(loaded.message);
        const report = { loadMilliseconds: Math.round(performance.now() - started), cases: [] };
        for (let index = 0; index < samples.length; index++) {
          const test = samples[index], begin = performance.now();
          const answer = wait((data) => data.id === index && (data.type === "answer" || data.type === "error"));
          instance.postMessage({ type: "generate", id: index, question: test.question, passages: test.sources });
          const data = await answer;
          const row = { id: test.id, cohort: test.cohort, raw: data.raw, error: data.type === "error", milliseconds: Math.round(performance.now() - begin) };
          report.cases.push(row);
          await window.recordRagCase(row);
        }
        return report;
      } finally { instance.terminate(); }
    }, { workerURL: new URL(`_astro/${workerFile}`, base).href, samples });
    for (const row of report.cases) {
      const test = samples.find((entry) => entry.id === row.id);
      let result = { passages: [] };
      try { if (test.sources.length && row.raw) result = validateRagSelection(row.raw, test.sources, test.question); } catch { row.invalid = true; }
      row.ids = result.passages.map(({ id }) => id);
      row.repaired = result.repaired ?? false;
      row.pass = !row.error && !row.invalid && row.ids.length === test.expected.length && test.expected.every((id) => row.ids.includes(id));
      console.log(`${row.id}: ${row.pass ? "expected selection" : "selection mismatch"}, ${row.milliseconds} ms`);
    }
    report.retrievalToAnswer = uiResult;
    report.candidate = RAG_MODEL; report.browser = browser.version();
    report.device = "Desktop Chromium CPU WASM at 390px; not a physical phone";
    report.reportedResponseBodyBytes = (await Promise.all(bodySizes)).reduce((sum, bytes) => sum + bytes, 0);
    report.passes = report.cases.filter((row) => row.pass).length;
    report.cohorts = Object.fromEntries(["screening", "holdout"].map((name) => {
      const rows = report.cases.filter((row) => row.cohort === name);
      return [name, { passes: rows.filter((row) => row.pass).length, cases: rows.length }];
    }));
    report.questionsSentToNetwork = requests.some(({ url, body }) => body !== null || [...samples.map(({ question }) => question), uiQuestion].some((question) => decodeURIComponent(url).includes(question)));
    const prefixes = [`https://huggingface.co/${RAG_MODEL.model}/resolve/${RAG_MODEL.revision}/`, `https://huggingface.co/api/resolve-cache/models/${RAG_MODEL.model}/${RAG_MODEL.revision}/`];
    assert(requests.filter(({ url }) => new URL(url).hostname === "huggingface.co").every(({ url }) => prefixes.some((prefix) => url.startsWith(prefix))));
    assert.equal(report.questionsSentToNetwork, false);
    await writeFile("artifacts/rag/browser.json", `${JSON.stringify(report, null, 2)}\n`);
    assert.equal(report.cases.length, samples.length);
    console.log(`Actual browser RAG screening completed: ${report.passes}/${samples.length} expected selections. This completion is not a promotion gate.`);
    await context.close();
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
