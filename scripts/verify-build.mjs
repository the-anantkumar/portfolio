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
const askFile = path.join(root, "ask", "index.html");
const privateMarkers = /\.codex|trlr-soul-engine|CONTACT_EMAIL_PASS|OPENAI_API_KEY|150M/;
const emDash = /\u2014|\\u2014|&mdash;|&#0*8212;|&#x0*2014;/i;
const ordinaryStyles = new Set();
const askStyles = new Set();
const initialScripts = new Set();
const localAsset = (href) => {
  assert(href.startsWith(release.base), `Asset escapes hosting base: ${href}`);
  const route = new URL(href, "https://example.invalid").pathname.slice(release.base.length);
  const target = path.resolve(root, route);
  assert(target === root || target.startsWith(`${root}${path.sep}`), `Asset escapes build output: ${href}`);
  return target;
};
assert.equal(pages.length, 7, "Expected home, four case studies, Ask and 404");
let total = 0;
for (const file of files) total += (await stat(file)).size;
for (const file of pages) {
  const html = await readFile(file, "utf8");
  const interactive = file === askFile;
  assert(
    html.includes('http-equiv="Content-Security-Policy"'),
    `${file}: document CSP required`,
  );
  const policy = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1].replace(/&#39;/g, "'");
  assert(policy, `${file}: readable document CSP required`);
  const scriptPolicy = policy.match(/(?:^|;)\s*script-src\s+([^;]+)/)?.[1].trim().split(/\s+/);
  if (interactive) {
    assert(scriptPolicy?.includes("'self'"), `${file}: scripts must be self-hosted`);
    assert(scriptPolicy.every((source) => ["'self'", "'wasm-unsafe-eval'"].includes(source)), `${file}: inline scripts, eval and third-party scripts are forbidden`);
    const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
    assert(scripts.length > 0, `${file}: interactive page must have its external bootstrap`);
    for (const [, attributes, body] of scripts) {
      assert(/\btype="module"/.test(attributes), `${file}: script must be a module`);
      assert.equal(body.trim(), "", `${file}: inline executable content is forbidden`);
      const src = attributes.match(/\bsrc="([^"]+)"/)?.[1];
      assert(src, `${file}: script must have an external source`);
      initialScripts.add(localAsset(src));
    }
    assert(!/\son[a-z]+\s*=|(?:href|src)="javascript:/i.test(html), `${file}: inline event handlers are forbidden`);
  } else {
    assert.deepEqual(scriptPolicy, ["'none'"], `${file}: ordinary pages must keep script-src none`);
    assert(!/<script[\s>]/i.test(html), `${file}: ordinary pages must remain script-free`);
  }
  for (const [, attributes] of html.matchAll(/<link\b([^>]*)>/gi)) {
    const rel = attributes.match(/\brel="([^"]+)"/)?.[1];
    const href = attributes.match(/\bhref="([^"]+)"/)?.[1];
    if (rel === "stylesheet") {
      assert(href, `${file}: stylesheet source required`);
      (interactive ? askStyles : ordinaryStyles).add(localAsset(href));
    }
    if (["modulepreload", "prefetch", "preload"].includes(rel)) {
      assert(href?.startsWith(release.base), `${file}: no external resource preload`);
      assert(!["modulepreload", "prefetch"].includes(rel), `${file}: no speculative scripts or model downloads`);
      assert(!/\bas="(?:script|worker|fetch)"|embedding-worker|search-vectors|\.wasm|\.onnx/i.test(attributes), `${file}: AI assets must load only after opt-in`);
    }
  }
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
    !emDash.test(html),
    `${file}: use ordinary punctuation instead of em dashes`,
  );
  assert.equal(
    (html.match(/<h1(?: |>)/g) || []).length,
    1,
    `${file}: one h1 required`,
  );
  assert(
    !/your-username|your-profile|MESSAGE_TRANSMITTED|ENCRYPTION_PROTOCOLS|localhost|127\.0\.0\.1/.test(
      html,
    ),
    `${file}: placeholder or simulated functionality`,
  );
  assert(
    !privateMarkers.test(html),
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
  assert.equal(locations.length, 6, "Sitemap includes home, four projects and Ask");
  assert(locations.includes(new URL(`${release.base}ask/`, release.site).href), "Ask must be in the sitemap");
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
const corpusFile = path.join(root, "knowledge.json");
const vectorsFile = path.join(root, "search-vectors.json");
const corpusText = await readFile(corpusFile, "utf8");
assert(!privateMarkers.test(corpusText), "The search corpus contains private or unapproved content");
assert(!emDash.test(corpusText), "The search corpus must not contain em dashes");
const corpus = JSON.parse(corpusText);
assert.equal(corpus.version, 1);
assert(corpus.passages.length > 0, "Search corpus must contain public evidence");
for (const passage of corpus.passages) {
  const url = new URL(passage.url, "https://example.invalid");
  assert.equal(url.origin, "https://example.invalid", `Evidence must link to this portfolio: ${passage.id}`);
  let target = localAsset(url.pathname);
  if (url.pathname.endsWith("/")) target = path.join(target, "index.html");
  const html = await readFile(target, "utf8");
  if (url.hash)
    assert(html.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `Broken search evidence anchor: ${passage.url}`);
}

async function sumBytes(paths, gzip = false) {
  const sizes = await Promise.all([...paths].map(async (file) => {
    const bytes = await readFile(file);
    return gzip ? gzipSync(bytes).length : bytes.length;
  }));
  return sizes.reduce((sum, size) => sum + size, 0);
}
const css = files.filter((file) => file.endsWith(".css"));
const js = files.filter((file) => /\.m?js$/.test(file));
const wasm = files.filter((file) => file.endsWith(".wasm"));
const askOnlyStyles = new Set([...askStyles].filter((file) => !ordinaryStyles.has(file)));
const notices = files.filter((file) => file.startsWith(path.join(root, "ai-notices") + path.sep));
assert.equal(notices.length, 4, "Keep the model and runtime license notices with the optional assets");
assert(await sumBytes(notices) < 400_000, "Optional AI notices exceed their 400 KB budget");
const optionalAssets = new Set([askFile, corpusFile, vectorsFile, ...js, ...wasm, ...askOnlyStyles, ...notices]);
const ordinaryOutputBytes = await sumBytes(files.filter((file) => !optionalAssets.has(file)));
const homeStyles = [...home.toString().matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map((match) => localAsset(match[1]));
assert(homeStyles.length > 0, "Homepage must reference its own stylesheets");
const homeInitialGzipBytes = gzipSync(home).length + await sumBytes(new Set(homeStyles), true);
const bootstrapGzipBytes = await sumBytes(initialScripts, true);
assert.equal(initialScripts.size, 1, "Ask must use one self-contained lightweight bootstrap");
for (const file of initialScripts) {
  const script = await readFile(file, "utf8");
  assert(!/\bimport\s*(?:["'{*]|[A-Za-z_$][\w$]*\s*(?:,|from))/.test(script), "Ask bootstrap cannot eagerly import more JavaScript; keep the model behind its worker");
}
const askInitialGzipBytes = gzipSync(await readFile(askFile)).length
  + await sumBytes(askStyles, true)
  + bootstrapGzipBytes
  + gzipSync(corpusText).length;
const optionalRuntimeGzipBytes = await sumBytes(js.filter((file) => !initialScripts.has(file)), true);
const wasmBytes = await sumBytes(wasm);
const vectorsBytes = (await stat(vectorsFile)).size;
assert(ordinaryOutputBytes < 300_000, `Ordinary site output exceeds its 300 KB budget: ${ordinaryOutputBytes}`);
assert(homeInitialGzipBytes <= 300_000, "Initial homepage HTML/CSS exceeds its 300 KB transfer budget");
assert(bootstrapGzipBytes <= 20_000, `Ask bootstrap exceeds its 20 KB gzip budget: ${bootstrapGzipBytes}`);
assert(askInitialGzipBytes <= 60_000, `Ask HTML/CSS/bootstrap/corpus exceeds its 60 KB gzip budget: ${askInitialGzipBytes}`);
assert(optionalRuntimeGzipBytes <= 250_000, `Optional AI JavaScript exceeds its 250 KB gzip budget: ${optionalRuntimeGzipBytes}`);
assert(wasmBytes <= 16_000_000, `Optional WASM exceeds its 16 MB budget: ${wasmBytes}`);
assert(vectorsBytes <= 200_000, `Search vectors exceed their 200 KB budget: ${vectorsBytes}`);
assert(total <= 17_000_000, `Complete output exceeds its 17 MB budget: ${total}`);
console.log(
  JSON.stringify(
    {
      pages: pages.length,
      totalBytes: total,
      ordinaryOutputBytes,
      homeGzipBytes: gzipSync(home).length,
      homeInitialGzipBytes,
      cssGzipBytes: await sumBytes(css, true),
      bootstrapGzipBytes,
      askInitialGzipBytes,
      optionalRuntimeGzipBytes,
      wasmBytes,
      vectorsBytes,
      evidencePassages: corpus.passages.length,
      links: "passed",
      publicationChecks: "passed",
    },
    null,
    2,
  ),
);
