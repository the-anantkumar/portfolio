import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat, mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

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
];
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
      assert.equal(await page.locator("script").count(), 0);
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
      if (route) {
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
    if (process.env.TEST_SCREENSHOT_DIR) {
      await mkdir(process.env.TEST_SCREENSHOT_DIR, { recursive: true });
      await page.screenshot({
        path: path.join(
          process.env.TEST_SCREENSHOT_DIR,
          `portfolio-${width}.png`,
        ),
        fullPage: true,
      });
    }
    await context.close();
  }
  const context = await browser.newContext({
    viewport: { width: 390, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  for (const route of routes) {
    await page.goto(new URL(route, base).href);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    assert.deepEqual(
      result.violations.map(({ id, nodes }) => ({
        id,
        elements: nodes.map((node) => node.target),
      })),
      [],
      `Accessibility violations at ${route}`,
    );
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
  console.log(
    "Browser checks passed: all routes, 3 viewport sizes, no-JS navigation, reduced motion, keyboard access, pause control, heatmap, 404, and axe accessibility.",
  );
} finally {
  await browser.close();
  if (server) await new Promise((resolve) => server.close(resolve));
}
