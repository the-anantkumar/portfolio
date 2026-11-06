import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat, mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { EMBEDDING } from "../src/lib/embedding-config.mjs";

const release = JSON.parse(await readFile("dist/release.json", "utf8"));
const root = path.resolve("dist");
const mime = {
  ".html": "text/html",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".json": "application/json",
  ".csv": "text/csv",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".wasm": "application/wasm",
};
let server;
let base = process.env.TEST_URL;
if (!base) {
  server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
      assert(pathname.startsWith(release.base));
      let file = path.resolve(root, pathname.slice(release.base.length));
      assert(file === root || file.startsWith(`${root}${path.sep}`));
      if ((await stat(file)).isDirectory())
        file = path.join(file, "index.html");
      response.setHeader(
        "Content-Type",
        mime[path.extname(file)] || "application/octet-stream",
      );
      response.end(await readFile(file));
    } catch {
      response.writeHead(404, { "Content-Type": "text/html" });
      response.end(await readFile(path.join(root, "404.html")));
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}${release.base}`;
}
base = `${base.replace(/\/+$/, "")}/`;
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
    : {}),
});
const routes = [
  "",
  "projects/trlr/",
  "projects/codeforces-potd/",
  "projects/nielsen-data-systems/",
  "projects/portfolio/",
  "ask/",
];
const askURL = new URL("ask/", base).href;
const isModelAsset = (url) =>
  /embedding-worker|search-vectors\.json|\.wasm(?:\?|$)|\.onnx(?:\?|$)|transformers|ort-wasm/i.test(url);
async function assertNoOverflow(page, label) {
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    `${label}: horizontal overflow`,
  );
}
async function assertAccessible(page, label) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  assert.deepEqual(
    result.violations.map(({ id, nodes }) => ({
      id,
      elements: nodes.map((node) => node.target),
    })),
    [],
    `Accessibility violations at ${label}`,
  );
}
async function submitQuestion(page, question) {
  await page.locator("#ask-question").fill(question);
  await page.getByRole("button", { name: "Find relevant passages", exact: true }).click();
  await page.locator("#ask-results").waitFor({ state: "visible" });
  await page.waitForFunction(() =>
    document.querySelector("#ask-results")?.getAttribute("aria-busy") !== "true",
  );
}
async function assertSourceLinks(page) {
  const links = await page.locator(".ask-source-link").evaluateAll((elements) =>
    elements.map((element) => element.href),
  );
  assert(links.length > 0, "A supported result must link to its evidence");
  for (const link of links) {
    const url = new URL(link);
    assert.equal(url.origin, new URL(base).origin, "Evidence stays on this portfolio");
    assert(url.pathname.startsWith(new URL(base).pathname), "Evidence uses the hosting base");
    const response = await page.request.get(url.href);
    assert.equal(response.status(), 200, `Evidence must exist: ${url.href}`);
    if (url.hash)
      assert((await response.text()).includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `Evidence anchor must exist: ${url.href}`);
  }
}
async function screenshot(page, filename) {
  if (!process.env.TEST_SCREENSHOT_DIR) return;
  await mkdir(process.env.TEST_SCREENSHOT_DIR, { recursive: true });
  await page.screenshot({
    path: path.join(process.env.TEST_SCREENSHOT_DIR, filename),
    fullPage: true,
  });
}
async function verifyAsk() {
  for (const width of [1440, 390, 320]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const errors = [];
    const requests = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (/content security policy|refused to/i.test(message.text()))
        errors.push(message.text());
    });
    page.on("dialog", async (dialog) => {
      errors.push(`Unexpected script dialog: ${dialog.type()}`);
      await dialog.dismiss();
    });
    page.on("request", (request) => requests.push({
      url: request.url(),
      body: request.postData(),
    }));
    await page.goto(askURL);
    await page.locator("#ask-form").waitFor({ state: "visible" });
    await assertNoOverflow(page, `${width}px Ask form`);
    assert.equal(await page.locator("#ask-question").getAttribute("maxlength"), "500");

    // Keyboard visitors can submit the same form without a pointer.
    await page.locator("#ask-question").fill("What did Anant validate at Nielsen?");
    await page.keyboard.press("Tab");
    assert(await page.locator('#ask-form button[type="submit"]').evaluate((element) => element === document.activeElement));
    await page.keyboard.press("Enter");
    await page.locator("#ask-results").waitFor({ state: "visible" });
    assert(await page.locator('.ask-source-link[href*="nielsen-data-systems"]').count() > 0);
    assert(await page.locator("#ask-result-heading").evaluate((element) => element === document.activeElement), "Keyboard search must lead to the results heading");
    await assertSourceLinks(page);
    await assertNoOverflow(page, `${width}px Ask results`);
    await assertAccessible(page, `${width}px Ask results`);
    await screenshot(page, `ask-results-${width}.png`);
    await page.getByRole("button", { name: "Ask another question", exact: true }).click();
    assert(await page.locator("#ask-question").evaluate((element) => element === document.activeElement), "Ask another question must return focus to the input");

    await submitQuestion(page, "What is Anant's private phone number?");
    assert.match(await page.locator("#ask-result-summary").innerText(), /No supported match/i);
    assert.equal(await page.locator(".ask-source-link").count(), 0);
    await assertAccessible(page, `${width}px Ask unsupported question`);

    await submitQuestion(page, 'Nielsen <img src=x onerror="alert(1)">');
    assert.equal(await page.locator("#ask-results img, #ask-results script").count(), 0);
    // Keep the long-query check in the browser, where maxlength is enforced.
    await page.locator("#ask-question").fill("x".repeat(700));
    assert.equal((await page.locator("#ask-question").inputValue()).length, 500);
    const examples = page.locator("[data-ask-example]");
    for (let index = 0; index < await examples.count(); index++) {
      const example = examples.nth(index);
      await example.click();
      await page.locator("#ask-results").waitFor({ state: "visible" });
      assert(await page.locator(".ask-source-link").count() > 0, `Suggested question must retrieve evidence: ${await example.innerText()}`);
    }

    assert.equal(page.url(), askURL, "Questions must not enter browser history or URLs");
    assert.deepEqual(
      await page.evaluate(() => [localStorage.length, sessionStorage.length]),
      [0, 0],
      "Search must not persist visitors' questions",
    );
    assert(requests.every(({ url }) => new URL(url).origin === new URL(base).origin), "Word matching must not contact third parties");
    assert(requests.every(({ url }) => !isModelAsset(url)), "AI assets must remain unloaded before explicit opt-in");
    assert(requests.every(({ body }) => body === null), "Search must not post questions to a server");
    assert(requests.every(({ url }) => !decodeURIComponent(url).includes("private phone number")), "Question text must not enter requests");
    assert.deepEqual(errors, []);
    await context.close();
  }

  // Offline CI tests only the controller lifecycle. The opt-in smoke below
  // exercises the real model and runtime separately when explicitly requested.
  for (const scenario of ["cancel", "failure"]) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 900 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const errors = [];
    const remoteRequests = [];
    let workerRequests = 0;
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      if (new URL(request.url()).origin !== new URL(base).origin)
        remoteRequests.push(request.url());
    });
    await context.route(/embedding-worker[^/]*\.m?js(?:\?.*)?$/, async (route) => {
      workerRequests++;
      await route.fulfill({
        contentType: "text/javascript",
        body: `self.onmessage = ({data}) => {
          if (data.type !== "load") return;
          self.postMessage({ type: "progress", message: "Preparing local model" });
          ${scenario === "failure" ? 'self.postMessage({type:"error",message:"The model could not be downloaded."});' : ""}
        };`,
      });
    });
    await page.goto(askURL);
    await page.locator("#ask-form").waitFor({ state: "visible" });
    await page.locator("#semantic-enable").click();
    if (scenario === "cancel") {
      await page.locator("#semantic-cancel").waitFor({ state: "visible" });
      await page.waitForFunction(() => document.querySelector("#semantic-status")?.textContent === "Preparing local model");
      await page.locator("#semantic-cancel").click();
    }
    await page.locator("#semantic-enable").waitFor({ state: "visible" });
    await page.waitForFunction(() => !document.querySelector("#semantic-enable")?.disabled);
    assert(await page.locator("#semantic-cancel").isHidden());
    assert.match(await page.locator("#semantic-status").innerText(), /word matching|unavailable|could not|cancel/i);
    await submitQuestion(page, "What did Anant validate at Nielsen?");
    assert(await page.locator('.ask-source-link[href*="nielsen-data-systems"]').count() > 0, "Text search survives model cancellation or failure");
    await assertAccessible(page, `Ask ${scenario} fallback`);
    assert.equal(workerRequests, 1, "Lifecycle fixture must exercise a worker load");
    assert.deepEqual(remoteRequests, [], "Lifecycle fixtures must not download a real model");
    assert.deepEqual(errors, []);
    await context.close();
  }
  const unavailable = await browser.newContext();
  const unavailablePage = await unavailable.newPage();
  const blockCorpus = async (route) => route.fulfill({ status: 503, body: "Unavailable" });
  await unavailable.route("**/knowledge.json", blockCorpus);
  await unavailablePage.goto(askURL);
  await unavailablePage.locator("#ask-form").waitFor({ state: "visible" });
  await unavailablePage.locator("#ask-question").fill("What did Anant validate at Nielsen?");
  await unavailablePage.getByRole("button", { name: "Find relevant passages", exact: true }).click();
  await unavailablePage.waitForFunction(() => /could not be loaded/i.test(document.querySelector("#ask-status")?.textContent || ""));
  assert(await unavailablePage.locator("#ask-browse").isVisible());
  await unavailable.unroute("**/knowledge.json", blockCorpus);
  await submitQuestion(unavailablePage, "What did Anant validate at Nielsen?");
  assert(await unavailablePage.locator('.ask-source-link[href*="nielsen-data-systems"]').count() > 0, "Search can recover after its corpus becomes available");
  await unavailable.close();
  if (process.env.TEST_AI_MODEL === "1") await verifyRealModel();
}
async function verifyRealModel() {
  const context = await browser.newContext({
    viewport: { width: 390, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [];
  const transfers = [];
  const requests = [];
  let phase = "cold";
  context.on("request", (request) => requests.push({
    url: request.url(),
    body: request.postData(),
  }));
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (/content security policy|refused to/i.test(message.text())) errors.push(message.text());
  });
  context.on("requestfinished", (request) => {
    if (isModelAsset(request.url()) || new URL(request.url()).origin !== new URL(base).origin)
      transfers.push(request.sizes().then((sizes) => ({
        url: request.url().split("?")[0],
        bytes: sizes.responseBodySize,
        phase,
      })).catch(() => ({ url: request.url().split("?")[0], bytes: 0 })));
  });
  try {
    await page.goto(askURL);
    await page.locator("#ask-form").waitFor({ state: "visible" });
    const start = performance.now();
    await page.locator("#semantic-enable").click();
    await page.getByRole("button", { name: "Use word matching", exact: true }).waitFor({ state: "visible", timeout: 180_000 });
    const loadMilliseconds = Math.round(performance.now() - start);
    const question = "How does Anant make sure a replacement data pipeline produces the same results?";
    const queryStart = performance.now();
    await submitQuestion(page, question);
    await page.waitForFunction(() => /meaning/i.test(document.querySelector("#ask-status")?.textContent || ""));
    const queryMilliseconds = Math.round(performance.now() - queryStart);
    assert(await page.locator('.ask-source-link[href*="nielsen-data-systems"]').count() > 0);
    await assertSourceLinks(page);
    await assertNoOverflow(page, "Real model mobile viewport");
    await assertAccessible(page, "Real model results");
    await screenshot(page, "ask-real-model-390.png");
    const warmQueryStart = performance.now();
    await submitQuestion(page, "What did Anant validate at Nielsen?");
    const warmQueryMilliseconds = Math.round(performance.now() - warmQueryStart);
    assert(await page.locator('.ask-source-link[href*="nielsen-data-systems"]').count() > 0);
    const coldAssets = await Promise.all(transfers);
    phase = "warm";
    await page.getByRole("button", { name: "Use word matching", exact: true }).click();
    const reloadStart = performance.now();
    await page.locator("#semantic-enable").click();
    await page.getByRole("button", { name: "Use word matching", exact: true }).waitFor({ state: "visible", timeout: 180_000 });
    const cachedModelLoadMilliseconds = Math.round(performance.now() - reloadStart);
    assert.deepEqual(errors, []);
    const pinnedPrefix = `https://huggingface.co/${EMBEDDING.model}/resolve/${EMBEDDING.revision}/`;
    // HF redirects small files to a cache route that retains the same immutable
    // repository and revision. This is not a request for the mutable main ref.
    const pinnedCachePrefix = `https://huggingface.co/api/resolve-cache/models/${EMBEDDING.model}/${EMBEDDING.revision}/`;
    const modelRequests = requests.filter(({ url }) => new URL(url).origin === "https://huggingface.co");
    assert(modelRequests.length > 0, "Real smoke must request the pinned model");
    const unpinnedRequests = modelRequests.filter(({ url }) => !url.startsWith(pinnedPrefix) && !url.startsWith(pinnedCachePrefix));
    assert.deepEqual(unpinnedRequests.map(({ url }) => url.split("?")[0]), [], "All Hugging Face assets must use the fixed model and revision");
    assert(requests.every(({ url }) => !url.includes("/resolve/main/")), "No model request may resolve mutable main");
    assert(requests.every(({ body }) => body === null), "Local inference must not post visitor questions");
    assert(requests.every(({ url }) => !decodeURIComponent(url).includes(question)), "Question text must not enter model requests");
    const assets = await Promise.all(transfers);
    console.log(JSON.stringify({
      aiSmoke: "passed",
      device: "Chromium desktop, 390px mobile viewport (not a physical phone)",
      loadMilliseconds,
      queryMilliseconds,
      warmQueryMilliseconds,
      cachedModelLoadMilliseconds,
      coldModelTransferBytes: coldAssets.reduce((total, asset) => total + asset.bytes, 0),
      allModelTransferBytes: assets.reduce((total, asset) => total + asset.bytes, 0),
      assets,
    }, null, 2));
  } finally {
    await context.close();
  }
}
try {
  for (const width of [1440, 390, 320]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      javaScriptEnabled: false,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const failures = [];
    page.on("pageerror", (error) => failures.push(error.message));
    page.on("request", (request) => {
      if (
        /^https?:/.test(request.url()) &&
        new URL(request.url()).origin !== new URL(base).origin
      )
        failures.push(`Third-party request: ${request.url()}`);
    });
    page.on("response", (response) => {
      if (response.status() >= 400)
        failures.push(`${response.status()}: ${response.url()}`);
    });
    for (const route of routes) {
      assert.equal((await page.goto(new URL(route, base).href)).status(), 200);
      assert.equal(await page.locator("h1").count(), 1);
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${width}px overflow at ${route}`,
      );
      assert.equal(await page.locator("script").count(), route === "ask/" ? 1 : 0);
      assert(!/\u2014/.test(await page.locator("body").innerText()));
      assert(
        await page
          .locator(".ambient-glow")
          .evaluateAll((elements) =>
            elements.every(
              (element) => getComputedStyle(element).animationName === "none",
            ),
          ),
      );
      if (route === "ask/") {
        assert(await page.locator("#ask-form").isHidden(), "No-JS visitors must not see an unusable form");
        assert(await page.locator("#ask-browse").isVisible(), "No-JS visitors can browse the evidence");
        assert(await page.locator("#ask-browse a").count() >= 3);
        await screenshot(page, `ask-nojs-${width}.png`);
      } else if (route) {
        await page.locator(".back-link").click();
        assert.equal(new URL(page.url()).hash, "#work");
        assert.equal(new URL(page.url()).pathname, new URL(base).pathname);
      }
    }
    await page.goto(`${base}#github`);
    await page.locator(".heatmap").scrollIntoViewIfNeeded();
    await page.waitForFunction(
      () => document.querySelector(".heatmap")?.complete,
    );
    assert(
      await page
        .locator(".heatmap")
        .evaluate((element) => element.naturalWidth > 0),
    );
    assert.equal(await page.locator(".repository-card").count(), 0);
    assert.equal(await page.locator(".github-metrics > div").count(), 2);
    assert.deepEqual(failures, []);
    await screenshot(page, `portfolio-${width}.png`);
    await context.close();
  }
  const context = await browser.newContext({
    viewport: { width: 390, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  for (const route of routes) {
    await page.goto(new URL(route, base).href);
    await assertAccessible(page, route);
  }
  await page.goto(base);
  await page.keyboard.press("Tab");
  assert.equal(await page.locator(":focus").getAttribute("class"), "skip");
  await page.keyboard.press("Enter");
  assert.equal(await page.locator(":focus").getAttribute("id"), "main");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.locator("#pause-motion").check();
  const animations = await page
    .locator(".ambient-glow, .prism-ring")
    .evaluateAll((elements) =>
      elements
        .map((element) => ({
          name: getComputedStyle(element).animationName,
          state: getComputedStyle(element).animationPlayState,
        }))
        .filter((animation) => animation.name !== "none"),
    );
  assert(animations.length > 0, "Motion check must inspect animated elements");
  assert(
    animations.every((animation) => animation.state === "paused"),
    JSON.stringify(animations),
  );
  assert.equal(
    (await page.goto(new URL("missing-page-check/", base).href)).status(),
    404,
  );
  assert((await page.locator("h1").innerText()).includes("isn’t here"));
  await page.getByRole("link", { name: "Back to the portfolio" }).click();
  assert.equal(page.url(), base);
  await context.close();
  await verifyAsk();
  console.log(
    "Browser checks passed: all routes, 3 viewport sizes, no-JS navigation, reduced motion, keyboard access, pause control, heatmap, 404, axe accessibility, sourced search, privacy, lazy AI loading and recovery.",
  );
} finally {
  await browser.close();
  if (server) await new Promise((resolve) => server.close(resolve));
}
