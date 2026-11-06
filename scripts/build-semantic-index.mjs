import assert from "node:assert/strict";
import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { env, AutoModel, AutoTokenizer, FeatureExtractionPipeline } from "@huggingface/transformers";
import { EMBEDDING, corpusHash, embeddingText, verifyVectors } from "../src/lib/embedding-config.mjs";

// This is an explicit maintainer command, never a scheduled/ordinary build.
// The only inputs are the public Astro corpus and public evaluation questions.
const corpus = JSON.parse(await readFile("dist/knowledge.json", "utf8"));
const { cases } = JSON.parse(await readFile("scripts/search-cases.json", "utf8"));
env.allowLocalModels = false;
env.remotePathTemplate = `{model}/resolve/${EMBEDDING.revision}/`;
env.cacheDir = "artifacts/model-cache";
await mkdir(env.cacheDir, { recursive: true });
console.log(`Loading ${EMBEDDING.model} at ${EMBEDDING.revision} (${EMBEDDING.dtype}).`);
const options = {
  revision: EMBEDDING.revision,
  dtype: EMBEDDING.dtype,
  device: "cpu",
};
const [encoder, tokenizer] = await Promise.all([
  AutoModel.from_pretrained(EMBEDDING.model, options),
  AutoTokenizer.from_pretrained(EMBEDDING.model, options),
]);
const model = new FeatureExtractionPipeline({ task: "feature-extraction", model: encoder, tokenizer });
const vectors = {};
let maximumTokens = 0;
for (const passage of corpus.passages) {
  const input = embeddingText(passage);
  const tokens = model.tokenizer(input, { truncation: false });
  const length = tokens.input_ids.data.length;
  maximumTokens = Math.max(maximumTokens, length);
  assert(length <= 256, `${passage.id}: ${length} tokens exceeds MiniLM's 256-token training window. Split this passage with its qualifications intact.`);
  const tensor = await model(input, { pooling: EMBEDDING.pooling, normalize: EMBEDDING.normalize });
  vectors[passage.id] = Array.from(tensor.data, (value) => Number(value.toFixed(6)));
}
const index = { version: 1, ...EMBEDDING, corpusHash: await corpusHash(corpus.passages), vectors };
await verifyVectors(index, corpus.passages);

const queryVectors = {};
for (const test of cases) {
  const tensor = await model(test.question, { pooling: EMBEDDING.pooling, normalize: EMBEDDING.normalize });
  queryVectors[test.id] = Array.from(tensor.data, (value) => Number(value.toFixed(6)));
}
// No timestamps: identical inputs do not create a spurious source change.
const queryIndex = { version: 1, ...EMBEDDING, casesHash: await corpusHash(cases.map((test) => ({ id: test.id, text: test.question }))), vectors: queryVectors };
async function atomicJSON(file, data) {
  await writeFile(`${file}.tmp`, `${JSON.stringify(data)}\n`);
  await rename(`${file}.tmp`, file);
}
await atomicJSON("src/data/search-vectors.json", index);
await atomicJSON("scripts/search-query-vectors.json", queryIndex);
console.log(`Embedded ${corpus.passages.length} public passages, ${cases.length} evaluation questions; longest passage ${maximumTokens} tokens.`);
await model.dispose();
