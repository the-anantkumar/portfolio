import assert from "node:assert/strict";
import { createServer } from "node:http";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { corpusHash, verifyVectors } from "../src/lib/embedding-config.mjs";
import { searchPassages } from "../src/lib/retrieval.mjs";

const readJSON = async (file) => JSON.parse(await readFile(file, "utf8"));
const tracker = await readJSON("docs/learning-tracker.json");
assert.equal(tracker.version, 1);
assert.equal(new Set(tracker.components.map(({ id }) => id)).size, tracker.components.length);
for (const component of tracker.components) {
  assert(["built", "experiment", "planned"].includes(component.status));
  for (const key of ["id", "name", "lane", "purpose", "input", "output", "exercise", "explain", "pitfall"]) assert(component[key]?.length, `Missing learning field: ${component.id}/${key}`);
  for (const file of component.files) {
    assert((file === "astro.config.mjs" || /^(?:src|scripts|docs|experiments|\.github)\/[a-zA-Z0-9_./[\]-]+$/.test(file)) && !file.includes("..") && !file.includes(".codex"), `Nonpublic learning reference: ${file}`);
    await access(file);
  }
}
const corpus = await readJSON("dist/knowledge.json");
const index = await readJSON("src/data/search-vectors.json");
const queries = await readJSON("scripts/search-query-vectors.json");
const { cases } = await readJSON("scripts/search-cases.json");
await verifyVectors(index, corpus.passages);
assert.equal(queries.casesHash, await corpusHash(cases.map(({ id, question }) => ({ id, text: question }))), "Learning traces need current public question vectors");
await verifyVectors({ ...queries, corpusHash: queries.casesHash }, cases.map(({ id, question }) => ({ id, text: question })));
const traces = tracker.examples.map((id) => {
  const test = cases.find((entry) => entry.id === id);
  assert(test && queries.vectors[id], `Unknown saved learning example: ${id}`);
  const summarize = ({ kind, reason, results }) => ({ kind, reason, passages: results.map(({ passage }) => passage) });
  return { id, question: test.question, expected: test.expected ?? [],
    word: summarize(searchPassages(test.question, corpus.passages)),
    hybrid: summarize(searchPassages(test.question, corpus.passages, { queryVector: queries.vectors[id], vectors: index.vectors })),
  };
});
const screening = await readJSON("experiments/generation/results-summary.json");
assert.equal(screening.promoted, false, "Revisit the learning lab before promoting a generation candidate");
const ragSummary = await readJSON("experiments/rag/results-summary.json");
assert.equal(ragSummary.version, 1);
// Historical model results must replay the public text actually evaluated.
// Current retrieval traces above still validate against the current index.
const ragCorpus = await readJSON("experiments/rag/corpus-2026-11-17.json");
assert.equal(ragCorpus.version, 1);
assert.equal(ragSummary.corpusHash, await corpusHash(ragCorpus.passages), "Recorded RAG examples must match their frozen public corpus");
assert.equal(new Set(ragCorpus.passages.map(({ id }) => id)).size, ragCorpus.passages.length, "Frozen RAG sources must be unique");
for (const passage of ragCorpus.passages) {
  assert(["id", "title", "context", "text", "url"].every((key) => typeof passage[key] === "string" && passage[key].length > 0), "Incomplete frozen public source");
  assert(/^\/portfolio\/(?:projects\/[a-z0-9-]+\/)?(?:#[a-z0-9-]+)?$/.test(passage.url), "Frozen source links must stay within the public portfolio");
}
const fixtures = [
  ...(await readJSON("experiments/rag/cases.json")).cases.map((entry) => ({ ...entry, cohort: "screening" })),
  ...(await readJSON("experiments/rag/holdout.json")).cases.map((entry) => ({ ...entry, cohort: "holdout" })),
];
assert.equal(new Set(fixtures.map(({ id }) => id)).size, fixtures.length);
assert.equal(ragSummary.cases.length, fixtures.length, "Show every recorded RAG case");
assert.equal(new Set(ragSummary.cases.map(({ id }) => id)).size, fixtures.length, "Do not duplicate a recorded RAG case");
const publicPassages = new Map(ragCorpus.passages.map((passage) => [passage.id, passage]));
const safeIds = (ids) => {
  assert(Array.isArray(ids) && ids.length <= 3 && new Set(ids).size === ids.length, "Invalid saved RAG source set");
  ids.forEach((id) => assert(publicPassages.has(id), `Nonpublic saved RAG source: ${id}`));
  return ids;
};
const sameIds = (left, right) => JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
const ragCases = ragSummary.cases.map((row) => {
  const fixture = fixtures.find(({ id }) => id === row.id);
  assert(fixture && row.question === fixture.question && row.cohort === fixture.cohort, "RAG case identity changed");
  const supplied = safeIds(fixture.passages), expected = safeIds(row.expected), selected = safeIds(row.selected);
  assert(sameIds(expected, fixture.expected), "Saved RAG expectation differs from its frozen case");
  assert(selected.every((id) => supplied.includes(id)) && expected.every((id) => supplied.includes(id)), "RAG source is outside the saved request");
  assert.equal(row.pass, sameIds(expected, selected), "RAG match label must describe the exact source set");
  assert.equal(row.abstained, selected.length === 0);
  assert(typeof row.repaired === "boolean" && typeof row.error === "boolean" && Number.isFinite(row.milliseconds));
  return { id: row.id, question: row.question, cohort: row.cohort, supplied, expected, selected,
    pass: row.pass, abstained: row.abstained, repaired: row.repaired, error: row.error, milliseconds: row.milliseconds };
});
const ui = ragSummary.browser.ui;
assert(typeof ui.question === "string" && ui.question.length <= 500);
assert(ui.answerIds.every((id) => ui.retrievedIds.includes(id)), "Recorded interface selection must come from retrieved sources");
const rag = {
  date: ragSummary.date, model: ragSummary.candidate.model, revision: ragSummary.candidate.revision,
  native: ragSummary.native, browser: { screen: ragSummary.browser.screen, holdout: ragSummary.browser.holdout, device: ragSummary.browser.device },
  cases: ragCases,
  // Only canonical public text and safe reviewed fields enter this offline lab.
  // Raw model prose, caches, request logs, and private files are never embedded.
  passages: Object.fromEntries(publicPassages),
  ui: { question: ui.question, retrieved: safeIds(ui.retrievedIds), selected: safeIds(ui.answerIds),
    modelReadyMilliseconds: ui.modelReadyMilliseconds, totalMilliseconds: ui.totalMilliseconds,
    reportedColdResponseBodyBytes: ui.reportedColdResponseBodyBytes },
};
const data = { ...tracker, screening, rag, traces, corpusPassages: corpus.passages.length, dimensions: index.dimensions };
const template = await readFile("scripts/learning-lab.template.html", "utf8");
const serialized = JSON.stringify(data).replaceAll("<", "\\u003c");
assert.equal(template.split("__LEARNING_DATA__").length, 2, "One data injection point is required");
const html = template.replace("__LEARNING_DATA__", serialized);
assert(Buffer.byteLength(html) < 300_000, "Keep the standalone learning lab small");
await mkdir("artifacts/learning", { recursive: true });
await writeFile("artifacts/learning/index.html", html);
console.log(`Learning lab generated: ${resolve("artifacts/learning/index.html")} (${tracker.components.length} components, ${traces.length} saved traces).`);
if (process.argv.includes("--serve")) {
  const portFlag = process.argv.indexOf("--port");
  const port = portFlag < 0 ? 4382 : Number(process.argv[portFlag + 1]);
  assert(Number.isInteger(port) && port >= 0 && port <= 65535, "Invalid loopback port");
  const server = createServer((request, response) => {
    const pathname = new URL(request.url, "http://127.0.0.1").pathname;
    if (request.method !== "GET") { response.writeHead(405); response.end(); return; }
    if (pathname === "/favicon.ico") { response.writeHead(204); response.end(); return; }
    if (pathname !== "/" && pathname !== "/index.html") { response.writeHead(404); response.end("Not found"); return; }
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    response.end(html);
  });
  await new Promise((done) => server.listen(port, "127.0.0.1", done));
  console.log(`Learning lab: http://127.0.0.1:${server.address().port}/`);
}
