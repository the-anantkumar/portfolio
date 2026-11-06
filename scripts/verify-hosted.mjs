import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { setTimeout } from "node:timers/promises";
const base = process.env.TEST_URL;
const expected = process.env.EXPECTED_COMMIT;
assert(
  base?.startsWith("https://"),
  "TEST_URL must be the deployed HTTPS site URL with a trailing slash",
);
assert(
  expected && /^[a-f0-9]{40}$/.test(expected),
  "EXPECTED_COMMIT must be the full deployed commit SHA",
);
async function get(route) {
  const url = new URL(route, base);
  url.searchParams.set("release", expected);
  return fetch(url, { cache: "no-store", signal: AbortSignal.timeout(15000) });
}
let ready = false;
for (let attempt = 1; attempt <= 24; attempt++) {
  try {
    const response = await get("release.json");
    if (response.ok && (await response.json()).commit === expected) {
      ready = true;
      break;
    }
  } catch {
    /* Publication may take time to propagate through the CDN. */
  }
  if (attempt % 6 === 0)
    console.log(`Waiting for release ${expected.slice(0, 7)} (${attempt}/24).`);
  await setTimeout(5000);
}
assert(
  ready,
  "The expected commit is not publicly available; deployment verification failed",
);
const routes = [
  "",
  "projects/trlr/",
  "projects/codeforces-potd/",
  "projects/nielsen-data-systems/",
  "projects/portfolio/",
  "ask/",
];
for (const route of routes) {
  const response = await get(route);
  assert.equal(response.status, 200, `${route}: HTTP status`);
  assert.match(response.headers.get("content-type"), /text\/html/);
  const html = await response.text();
  assert(
    html.includes(`href="${new URL(route, base).href}"`),
    `${route}: canonical URL`,
  );
  assert(
    html.includes('http-equiv="Content-Security-Policy"'),
    `${route}: document CSP`,
  );
  if (route === "ask/") {
    const policy = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1].replace(/&#39;/g, "'");
    const scriptPolicy = policy?.match(/(?:^|;)\s*script-src\s+([^;]+)/)?.[1].trim().split(/\s+/);
    assert(scriptPolicy?.includes("'self'"), `${route}: scripts must remain self-hosted`);
    assert(scriptPolicy.every((source) => ["'self'", "'wasm-unsafe-eval'"].includes(source)), `${route}: no inline scripts, eval or third-party scripts`);
    const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
    assert(scripts.length > 0, `${route}: interactive bootstrap present`);
    for (const [, attributes, body] of scripts) {
      assert(/\btype="module"/.test(attributes), `${route}: external module required`);
      assert.equal(body.trim(), "", `${route}: inline executable content forbidden`);
      const src = attributes.match(/\bsrc="([^"]+)"/)?.[1];
      assert(src, `${route}: script source required`);
      const url = new URL(src, base);
      assert.equal(url.origin, new URL(base).origin, `${route}: script hosted with the portfolio`);
      assert(url.pathname.startsWith(new URL(base).pathname), `${route}: script uses deployment base`);
      const scriptResponse = await fetch(url, { signal: AbortSignal.timeout(15000) });
      assert.equal(scriptResponse.status, 200, `${route}: script reachable`);
      assert.match(scriptResponse.headers.get("content-type"), /(?:java|ecma)script/, `${route}: executable module content type`);
      assert.deepEqual(Buffer.from(await scriptResponse.arrayBuffer()), await readFile(`dist/${url.pathname.slice(new URL(base).pathname.length)}`), `${route}: bootstrap bytes match the verified build`);
    }
  } else {
    assert(!/<script[\s>]/i.test(html), `${route}: no application scripts`);
    assert(/script-src (?:'|&#39;)none(?:'|&#39;)/.test(html), `${route}: script-src none remains enforced by document metadata`);
  }
  assert(
    !/\u2014|&mdash;|&#8212;|&#x2014;/i.test(html),
    `${route}: no em dashes`,
  );
  const styles = [...html.matchAll(/href="([^"]+\.css)"/g)].map((match) => match[1]);
  assert(styles.length > 0, `${route}: stylesheet present`);
  for (const css of new Set(styles)) {
    assert.equal(
      (await fetch(new URL(css, base), { signal: AbortSignal.timeout(15000) }))
        .status,
      200,
      `${route}: stylesheet reachable`,
    );
  }
}
for (const asset of [
  "github-heatmap.svg",
  "github-contributions.csv",
  "sitemap.xml",
  "robots.txt",
  "favicon.svg",
  "social.jpg",
  "knowledge.json",
  "search-vectors.json",
  "ai-notices/README.txt",
  "ai-notices/Apache-2.0.txt",
  "ai-notices/ONNX-Runtime-LICENSE.txt",
  "ai-notices/ONNX-Runtime-ThirdPartyNotices.txt",
]) {
  const response = await get(asset);
  assert.equal(response.status, 200, asset);
  assert.deepEqual(
    Buffer.from(await response.arrayBuffer()),
    await readFile(`dist/${asset}`),
    `${asset}: hosted bytes match the verified build`,
  );
}
const missing = await get("missing-page-check/");
assert.equal(missing.status, 404);
assert(
  (await missing.text()).includes("isn’t here"),
  "Custom 404 must be deployed",
);
console.log(
  `Hosted verification passed for ${expected}: all pages, canonical URLs, CSS, document CSP, calendar, CSV, search corpus/vectors/bootstrap, sitemap, images, and custom 404 at ${base}`,
);
