import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

// Capture the same visitor journey before and after a presentation change.
// Run a production preview first. This script never enables model downloads.
const phase = process.argv[2] || "after";
assert(/^[a-z0-9-]+$/i.test(phase), "Use a simple capture phase such as before or after");
const directory = process.env.TEST_SCREENSHOT_DIR || `artifacts/design-polish/${phase}`;
const base = `${(process.env.TEST_URL || "http://localhost:4321/portfolio/").replace(/\/+$/, "")}/`;
const widths = (process.env.CAPTURE_WIDTHS || "1440,390").split(",").map(Number);
assert(widths.every((width) => Number.isInteger(width) && width >= 320 && width <= 2560), "Capture widths must be integers between 320 and 2560");
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
    : {}),
});
const records = [];
const routes = [
  ["01-home", ""],
  ["02-nielsen", "projects/nielsen-data-systems/"],
  ["03-trlr", "projects/trlr/"],
  ["04-codeforces", "projects/codeforces-potd/"],
  ["05-portfolio", "projects/portfolio/"],
  ["06-ask-entry", "ask/"],
];
try {
  for (const width of widths) {
    const viewport = { width, height: width >= 1000 ? 1000 : 844 };
    const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
    const page = await context.newPage();
    const requests = [];
    page.on("request", (request) => requests.push(request.url()));
    async function capture(name, fromTop = true) {
      // A full-page screenshot does not reliably trigger lazy image loading.
      // Visit each image first, then restore the intended first-screen position.
      for (const image of await page.locator('img[loading="lazy"]').all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((element) => element.decode());
        assert(await image.evaluate((element) => element.complete && element.naturalWidth > 0), "Reject blank or unloaded images");
      }
      if (fromTop) await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({ path: path.join(directory, `${name}-${viewport.width}-viewport.png`) });
      await page.screenshot({ path: path.join(directory, `${name}-${viewport.width}-full.png`), fullPage: true });
      const landmarks = await page.evaluate(() => {
        const bounds = (selector) => {
          const element = document.querySelector(selector);
          if (!element || !element.getClientRects().length) return null;
          const rect = element.getBoundingClientRect();
          return { top: Math.round(rect.top + scrollY), height: Math.round(rect.height) };
        };
        return { scrollY, heading: bounds("main h1"), question: bounds("#ask-question"), results: bounds("#ask-results") };
      });
      records.push({ name, viewport, url: page.url(), title: await page.title(), landmarks });
    }
    for (const [name, route] of routes) {
      const response = await page.goto(new URL(route, base).href);
      assert.equal(response.status(), 200, route || "Homepage must load");
      await page.locator("main h1").waitFor({ state: "visible" });
      await page.evaluate(() => document.fonts.ready);
      if (route === "ask/") await page.locator("#ask-form").waitFor({ state: "visible" });
      await capture(name);
    }
    await page.locator("#ask-question").fill("What did Anant validate at Nielsen?");
    await page.getByRole("button", { name: "Find relevant passages", exact: true }).click();
    await page.locator("#ask-results").waitFor({ state: "visible" });
    await page.waitForFunction(() => document.querySelector("#ask-results")?.getAttribute("aria-busy") !== "true");
    await capture("07-ask-evidence", false);

    await page.locator("#ask-question").fill("What is Anant's private phone number?");
    await page.getByRole("button", { name: "Find relevant passages", exact: true }).click();
    await page.locator("#ask-results").waitFor({ state: "visible" });
    await page.waitForFunction(() => document.querySelector("#ask-results")?.getAttribute("aria-busy") !== "true");
    await capture("08-ask-no-match", false);

    await page.goto(new URL("ask/", base).href);
    await page.locator("#ask-form").waitFor({ state: "visible" });
    await page.locator("#ask-enhancement > summary").click();
    await page.locator("#rag-enhancement > summary").click();
    await page.locator("#ask-enhancement").scrollIntoViewIfNeeded();
    await capture("09-ask-options", false);
    await page.goto(new URL("ask/", base).href);
    await page.locator("#ask-form").waitFor({ state: "visible" });
    await page.locator("#ask-question").focus();
    await capture("10-ask-focus");
    assert(!requests.some((url) => /\.onnx|\.wasm|embedding-worker|rag-worker/.test(url)), "Capture must not enable either model");
    await context.close();
  }
  await writeFile(path.join(directory, "capture.json"), `${JSON.stringify({ phase, capturedAt: new Date().toISOString(), base, records }, null, 2)}\n`);
  console.log(`Captured ${records.length} desktop/mobile states with viewport and full-page images in ${directory}`);
} finally {
  await browser.close();
}
