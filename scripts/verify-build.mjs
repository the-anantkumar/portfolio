import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import assert from "node:assert/strict";
const root = path.resolve("dist");
const release = JSON.parse(
  await readFile(path.join(root, "release.json"), "utf8"),
);
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory() ? walk(path.join(dir, e.name)) : path.join(dir, e.name),
      ),
    )
  ).flat();
}
const files = await walk(root);
const pages = files.filter((f) => f.endsWith(".html"));
assert.equal(pages.length, 6, "Expected home, four case studies and 404");
let total = 0;
for (const file of files) total += (await stat(file)).size;
for (const file of pages) {
  const html = await readFile(file, "utf8");
  assert(
    html.includes('http-equiv="Content-Security-Policy"'),
    `${file}: document CSP required`,
  );
  assert(
    html.includes("script-src &#39;none&#39;") ||
      html.includes("script-src 'none'"),
    `${file}: script restriction required`,
  );
  if (release.site) {
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    assert(
      canonical?.startsWith(new URL(release.base, release.site).href),
      `${file}: canonical must use the deployed base`,
    );
    assert(
      html.includes(new URL(`${release.base}social.jpg`, release.site).href),
      `${file}: social image must use the deployed base`,
    );
  }
  assert(
    !/\u2014|&mdash;|&#0*8212;|&#x0*2014;/i.test(html),
    `${file}: use ordinary punctuation instead of em dashes`,
  );
  assert.equal(
    (html.match(/<h1(?: |>)/g) || []).length,
    1,
    `${file}: one h1 required`,
  );
  assert(
    !/<script[\s>]/i.test(html),
    `${file}: application scripts are forbidden in v1`,
  );
  assert(
    !/your-username|your-profile|MESSAGE_TRANSMITTED|ENCRYPTION_PROTOCOLS|localhost|127\.0\.0\.1/.test(
      html,
    ),
    `${file}: placeholder or simulated functionality`,
  );
  assert(
    !/\.codex|trlr-soul-engine|CONTACT_EMAIL_PASS|OPENAI_API_KEY|150M/.test(
      html,
    ),
    `${file}: private or unapproved content`,
  );
  for (const match of html.matchAll(/(?:href|src)="([^"\s]+)"/g)) {
    const href = match[1];
    if (!href.startsWith("/") && !href.startsWith("#")) continue;
    const [rawRoute, anchor] = href.split("#");
    if (rawRoute)
      assert(
        rawRoute.startsWith(release.base),
        `${file}: link escapes hosting base: ${href}`,
      );
    const route = rawRoute
      ? new URL(rawRoute, "https://example.invalid").pathname.slice(
          release.base.length - 1,
        )
      : "";
    let target = route ? path.join(root, route) : file;
    if (route.endsWith("/")) target = path.join(target, "index.html");
    else if (route && !path.extname(route))
      target = path.join(target, "index.html");
    const targetText = await readFile(target, "utf8");
    if (anchor)
      assert(
        targetText.includes(`id="${anchor}"`),
        `${file}: broken anchor ${href}`,
      );
  }
}
const calendar = JSON.parse(await readFile("src/data/github.json", "utf8"));
assert.equal(
  calendar.total,
  calendar.days.reduce((sum, day) => sum + day.count, 0),
  "Calendar total must match dated cells",
);
assert.equal(
  new Set(calendar.days.map((day) => day.date)).size,
  calendar.days.length,
  "Calendar dates must be unique",
);
const svg = await readFile(path.join(root, "github-heatmap.svg"), "utf8");
const csv = await readFile(path.join(root, "github-contributions.csv"), "utf8");
assert.equal(
  (svg.match(/<rect /g) || []).length,
  calendar.days.length,
  "Every calendar day must be rendered",
);
assert.equal(
  csv.trim().split("\n").length,
  calendar.days.length + 1,
  "CSV must include every date and its header",
);
const home = await readFile(path.join(root, "index.html"));
if (release.site) {
  const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  );
  assert.equal(locations.length, 5, "Sitemap includes home and four projects");
  assert(
    locations.every((url) =>
      url.startsWith(new URL(release.base, release.site).href),
    ),
    "Sitemap URLs must use the hosting base",
  );
}
assert(
  home.toString().includes('id="github"'),
  "GitHub section must have an in-page destination",
);
assert(
  !/href="https:\/\/github\.com/.test(home.toString()),
  "Homepage GitHub browsing must stay in the portfolio",
);
const css = files.filter((f) => f.endsWith(".css"));
const cssSize = (
  await Promise.all(css.map(async (f) => gzipSync(await readFile(f)).length))
).reduce((a, b) => a + b, 0);
const jsSize = (
  await Promise.all(
    files
      .filter((f) => f.endsWith(".js"))
      .map(async (f) => gzipSync(await readFile(f)).length),
  )
).reduce((a, b) => a + b, 0);
assert(jsSize <= 20_000, "JavaScript exceeds 20 KB gzip budget");
assert(
  gzipSync(home).length + cssSize <= 300_000,
  "Initial HTML/CSS exceeds homepage transfer budget",
);
assert(
  total < 300_000,
  "Entire static output exceeds the conservative 300 KB site budget",
);
console.log(
  JSON.stringify(
    {
      pages: pages.length,
      totalBytes: total,
      homeGzipBytes: gzipSync(home).length,
      cssGzipBytes: cssSize,
      jsGzipBytes: jsSize,
      links: "passed",
      publicationChecks: "passed",
    },
    null,
    2,
  ),
);
