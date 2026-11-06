import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { corpusHash, verifyVectors } from "../src/lib/embedding-config.mjs";
import { searchPassages } from "../src/lib/retrieval.mjs";

const args = process.argv.slice(2);
const corpusPath = args[0] && !args[0].startsWith("--") ? args.shift() : "dist/knowledge.json";
const flags = new Map();
while (args.length) {
  const key = args.shift();
  const value = args.shift();
  assert(["--vectors", "--query-vectors", "--min-similarity", "--minimum-recall"].includes(key) && value, `Unknown or incomplete option: ${key}`);
  flags.set(key, value);
}
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const corpus = await readJson(resolve(corpusPath));
const fixturePath = fileURLToPath(new URL("./search-cases.json", import.meta.url));
const { cases } = await readJson(fixturePath);
assert.equal(corpus.version, 1);
assert(Array.isArray(corpus.passages) && corpus.passages.length > 0, "The public knowledge corpus is empty");
const passageIds = new Set();
for (const passage of corpus.passages) {
  for (const field of ["id", "title", "text", "context", "url"]) assert(typeof passage[field] === "string" && passage[field].length > 0, `Missing passage ${field}`);
  assert(!passageIds.has(passage.id), `Duplicate passage ID: ${passage.id}`);
  passageIds.add(passage.id);
  assert(passage.url.startsWith("/") && !passage.url.startsWith("//"), "Evidence links must stay on the portfolio");
  assert(!/[<>]/.test(passage.text), `Evidence is not plain text: ${passage.id}`);
}
const introduction = corpus.passages.find((passage) => passage.id === "page/home/intro");
assert(introduction, "The corpus needs a public introduction source");
const basePath = new URL(introduction.url, "https://portfolio.invalid").pathname;
const renderedPages = new Map();
for (const passage of corpus.passages) {
  const url = new URL(passage.url, "https://portfolio.invalid");
  assert(url.pathname.startsWith(basePath), `Evidence bypasses the site base: ${passage.id}`);
  const route = url.pathname.slice(basePath.length);
  const file = join(dirname(resolve(corpusPath)), route, "index.html");
  if (!renderedPages.has(file)) renderedPages.set(file, await readFile(file, "utf8"));
  if (url.hash) {
    const anchor = decodeURIComponent(url.hash.slice(1));
    assert(renderedPages.get(file).includes(`id="${anchor}"`), `Missing rendered source anchor: ${passage.url}`);
  }
}
for (const test of cases) {
  assert(["development", "challenge"].includes(test.cohort ?? "development"), `Unknown evaluation cohort: ${test.id}`);
  if (test.kind !== "unsupported") {
    assert(test.expected?.length > 0, `Missing expected evidence: ${test.id}`);
    for (const id of test.expected) assert(passageIds.has(id), `Fixture references missing evidence: ${id}`);
  }
}
assert(cases.filter((test) => test.kind === "answerable" && test.cohort !== "challenge").length >= 30);
assert(cases.filter((test) => test.kind === "unsupported").length >= 10);
assert.equal(new Set(cases.map((test) => test.id)).size, cases.length);
const options = {};
let queryVectors;
if (flags.has("--vectors") || flags.has("--query-vectors")) {
  assert(flags.has("--vectors") && flags.has("--query-vectors"), "Semantic evaluation requires both passage and question vectors");
  const vectorFile = await readJson(resolve(flags.get("--vectors")));
  const queryFile = await readJson(resolve(flags.get("--query-vectors")));
  await verifyVectors(vectorFile, corpus.passages);
  const questionInputs = cases.map((test) => ({ id: test.id, text: test.question }));
  assert.equal(queryFile.casesHash, await corpusHash(questionInputs), "Evaluation questions changed. Run npm run index:search to regenerate query embeddings.");
  await verifyVectors({ ...queryFile, corpusHash: queryFile.casesHash }, questionInputs);
  options.vectors = vectorFile.vectors;
  queryVectors = queryFile.vectors;
  if (flags.has("--min-similarity")) {
    options.minSimilarity = Number(flags.get("--min-similarity"));
    assert(Number.isFinite(options.minSimilarity) && options.minSimilarity >= -1 && options.minSimilarity <= 1, "Invalid cosine threshold");
  }
}
const minimumRecall = Number(flags.get("--minimum-recall") ?? 0.9);
assert(minimumRecall >= 0 && minimumRecall <= 1, "Minimum recall must be between zero and one");
let failed = false;
for (const mode of queryVectors ? ["lexical", "hybrid"] : ["lexical"]) {
  const counts = () => ({ answerable: { passed: 0, total: 0 }, scope: { passed: 0, total: 0 }, unsupported: { passed: 0, total: 0 }, misses: [] });
  const cohorts = { development: counts(), challenge: counts() };
  for (const test of cases) {
    const groups = cohorts[test.cohort ?? "development"];
    const result = searchPassages(test.question, corpus.passages, mode === "hybrid" ? { ...options, queryVector: queryVectors[test.id] } : {});
    const ids = result.results.map(({ passage }) => passage.id);
    const withinScope = !test.onlyPrefixes || ids.every((id) => test.onlyPrefixes.some((prefix) => id.startsWith(prefix)));
    const passed = withinScope && (test.kind === "unsupported"
      ? result.kind === "unsupported"
      : test.expected.some((id) => ids.includes(id)));
    groups[test.kind].total++;
    if (passed) groups[test.kind].passed++;
    else groups.misses.push({ id: test.id, expected: test.expected ?? "unsupported", actual: ids.length ? ids : result.reason });
    if (!withinScope) failed = true;
    // Returned evidence must be the original complete passage, including scope
    // qualifications. This assertion does not evaluate generated text.
    for (const { passage } of result.results) assert.deepEqual(passage, corpus.passages.find((source) => source.id === passage.id));
  }
  const summaries = Object.fromEntries(Object.entries(cohorts).map(([name, groups]) => [name, {
    top3Recall: groups.answerable.total ? Number((groups.answerable.passed / groups.answerable.total).toFixed(4)) : null,
    ...groups,
  }]));
  console.log(JSON.stringify({ mode, passages: corpus.passages.length, ...summaries }, null, 2));
  if (summaries.development.top3Recall < minimumRecall) failed = true;
  for (const groups of Object.values(cohorts)) {
    if (groups.scope.passed !== groups.scope.total || groups.unsupported.passed !== groups.unsupported.total) failed = true;
  }
}
console.log("The recall gate applies to development questions. Challenge recall is reported separately; all scope and unsupported checks in both cohorts must pass.");
if (!queryVectors) console.log("Semantic retrieval has not been evaluated. This run measures the lexical fallback only.");
if (failed) process.exitCode = 1;
