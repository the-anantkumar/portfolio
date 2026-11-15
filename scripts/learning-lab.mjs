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
const data = { ...tracker, screening, traces, corpusPassages: corpus.passages.length, dimensions: index.dimensions };
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
