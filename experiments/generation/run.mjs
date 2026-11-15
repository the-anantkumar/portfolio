import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { env, AutoModelForCausalLM, AutoTokenizer, TextGenerationPipeline } from "@huggingface/transformers";
import { GENERATION, buildMessages, inspectAnswer } from "./config.mjs";

const corpus = JSON.parse(await readFile("dist/knowledge.json", "utf8"));
const { cases } = JSON.parse(await readFile(new URL("./cases.json", import.meta.url), "utf8"));
env.allowLocalModels = false;
env.cacheDir = "artifacts/generation/cache";
env.remotePathTemplate = `{model}/resolve/${GENERATION.revision}/`;
const prefix = `https://huggingface.co/${GENERATION.model}/resolve/${GENERATION.revision}/`;
env.fetch = (input, init = {}) => {
  const url = String(input);
  assert(url.startsWith(prefix), "Model assets must use the reviewed public revision");
  const headers = new Headers(init.headers);
  headers.delete("Authorization");
  return fetch(url, { ...init, headers, credentials: "omit", referrerPolicy: "no-referrer" });
};
await mkdir("artifacts/generation", { recursive: true });
console.log(`Local screening: ${GENERATION.model} q8, ${(GENERATION.weightBytes / 1e6).toFixed(1)} MB weights. No inference API.`);
const loading = performance.now();
const options = { revision: GENERATION.revision, dtype: GENERATION.dtype, device: "cpu", session_options: { intraOpNumThreads: 2, interOpNumThreads: 1 } };
const [model, tokenizer] = await Promise.all([
  AutoModelForCausalLM.from_pretrained(GENERATION.model, options),
  AutoTokenizer.from_pretrained(GENERATION.model, options),
]);
const generator = new TextGenerationPipeline({ task: "text-generation", model, tokenizer });
const report = { candidate: GENERATION, backend: "native CPU, two intra-op threads", loadMilliseconds: Math.round(performance.now() - loading), cases: [] };
try {
  for (const test of cases) {
    const passages = test.passages.map((id) => {
      const passage = corpus.passages.find((entry) => entry.id === id);
      assert(passage, `Unknown public source: ${id}`);
      return passage;
    });
    const messages = buildMessages(test.question, passages);
    const prompt = tokenizer.apply_chat_template(messages, { tokenize: false, add_generation_prompt: true });
    const tokens = tokenizer(prompt, { add_special_tokens: false, truncation: false }).input_ids.data.length;
    assert(tokens <= GENERATION.maxPromptTokens, `${test.id}: reject oversized prompt; never silently truncate qualifications`);
    const started = performance.now();
    const result = await generator(messages, { max_new_tokens: GENERATION.maxNewTokens, do_sample: false });
    const answer = result[0].generated_text.at(-1).content.trim();
    const row = { id: test.id, question: test.question, sourceIds: test.passages, promptTokens: tokens, milliseconds: Math.round(performance.now() - started), answer, ...inspectAnswer(answer, passages, test) };
    report.cases.push(row);
    // Raw output stays in ignored artifacts and is never printed into CI logs.
    console.log(`${test.id}: ${row.milliseconds} ms, ${row.flags.length ? row.flags.join(", ") : "automated checks passed; human review required"}`);
    await writeFile("artifacts/generation/native-results.json", `${JSON.stringify(report, null, 2)}\n`);
  }
  report.automatedPasses = report.cases.filter((row) => row.flags.length === 0).length;
  report.humanReview = "pending";
  report.promoted = false;
  report.rssBytesAfterRun = process.memoryUsage().rss;
  await writeFile("artifacts/generation/native-results.json", `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Screening complete: ${report.automatedPasses}/${cases.length} automated checks. Raw public-test outputs: artifacts/generation/native-results.json. No visitor feature enabled.`);
} finally { await generator.dispose(); }
