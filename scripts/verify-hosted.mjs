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
  assert(!/<script[\s>]/i.test(html), `${route}: no application scripts`);
  assert(
    !/\u2014|&mdash;|&#8212;|&#x2014;/i.test(html),
    `${route}: no em dashes`,
  );
  const css = html.match(/href="([^"]+\.css)"/)?.[1];
  assert(css, `${route}: stylesheet present`);
  assert.equal(
    (await fetch(new URL(css, base), { signal: AbortSignal.timeout(15000) }))
      .status,
    200,
  );
}
for (const asset of [
  "github-heatmap.svg",
  "github-contributions.csv",
  "sitemap.xml",
  "robots.txt",
  "favicon.svg",
  "social.jpg",
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
  `Hosted verification passed for ${expected}: all pages, canonical URLs, CSS, CSP, calendar, CSV, sitemap, images, and custom 404 at ${base}`,
);
