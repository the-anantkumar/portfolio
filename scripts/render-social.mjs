import { chromium } from "playwright";
import { fileURLToPath } from "node:url";

// Maintainer-only rendering of the authored typography. No network or model.
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
    : {}),
});
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto(new URL("../public/social.svg", import.meta.url).href);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: fileURLToPath(new URL("../public/social.jpg", import.meta.url)),
    type: "jpeg",
    quality: 90,
  });
} finally {
  await browser.close();
}
