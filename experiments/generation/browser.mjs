import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, writeFile, stat } from "node:fs/promises";
import { resolve, sep, extname, join } from "node:path";
import { chromium } from "playwright";
import { GENERATION } from "./config.mjs";
const root = resolve("artifacts/generation/browser");
const corpus = JSON.parse(await readFile("dist/knowledge.json", "utf8"));
const { cases } = JSON.parse(await readFile(new URL("./cases.json", import.meta.url), "utf8"));
const data = { cases: cases.map((test) => ({ ...test, sources: test.passages.map((id) => {
  const source = corpus.passages.find((passage) => passage.id === id);
  assert(source, `Unknown public source: ${id}`);
  return source;
}) })) };
await writeFile(join(root, "lab-data.json"), JSON.stringify(data));
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, "http://127.0.0.1").pathname;
    let file = resolve(root, `.${decodeURIComponent(pathname)}`);
    assert(file === root || file.startsWith(`${root}${sep}`));
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    response.setHeader("Content-Type", ({ ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".wasm": "application/wasm", ".json": "application/json" })[extname(file)] ?? "application/octet-stream");
    response.end(await readFile(file));
  } catch { response.writeHead(404); response.end("Not found"); }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) });
const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
const requests = [];
const transfers = [];
page.context().on("request", (request) => requests.push({ url: request.url(), body: request.postData() }));
page.context().on("requestfinished", (request) => transfers.push(request.sizes().then((sizes) => sizes.responseBodySize).catch(() => 0)));
try {
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.locator("#run").click();
  await page.waitForFunction(() => Boolean(window.generationReport), undefined, { timeout: 180_000 });
  const report = await page.evaluate(() => window.generationReport);
  report.device = "Chromium desktop, 390px viewport; not a physical phone";
  report.reportedResponseBodyBytes = (await Promise.all(transfers)).reduce((a, b) => a + b, 0);
  report.questionsSentToNetwork = requests.some(({ body, url }) => body !== null || cases.some((test) => decodeURIComponent(url).includes(test.question)));
  await writeFile("artifacts/generation/browser-results.json", `${JSON.stringify(report, null, 2)}\n`);
  assert.equal(report.questionsSentToNetwork, false);
  const prefixes = [`https://huggingface.co/${GENERATION.model}/resolve/${GENERATION.revision}/`, `https://huggingface.co/api/resolve-cache/models/${GENERATION.model}/${GENERATION.revision}/`];
  assert(requests.filter(({ url }) => new URL(url).hostname === "huggingface.co").every(({ url }) => prefixes.some((prefix) => url.startsWith(prefix))), "Reject mutable model metadata paths");
  assert(!report.error, report.error);
  assert.equal(report.cases.length, cases.length);
  for (const row of report.cases) console.log(`${row.id}: ${row.milliseconds} ms, ${row.flags.join(", ") || "automated checks passed; human review required"}`);
  console.log(`Browser screening: ${report.automatedPasses}/${cases.length} automated checks; human review pending. Reported bodies: ${report.reportedResponseBodyBytes} bytes. No visitor feature enabled.`);
} finally { await browser.close(); await new Promise((done) => server.close(done)); }
