import { env, AutoModelForCausalLM, AutoTokenizer, TextGenerationPipeline } from "@huggingface/transformers";
import wasmURL from "onnxruntime-web/ort-wasm-simd-threaded.wasm?url";
import factoryURL from "onnxruntime-web/ort-wasm-simd-threaded.mjs?url";
import { GENERATION, buildMessages, inspectAnswer } from "../config.mjs";
env.allowLocalModels = false;
env.remotePathTemplate = `{model}/resolve/${GENERATION.revision}/`;
env.cacheKey = "portfolio-generation-screening-v1";
env.useWasmCache = false;
env.backends.onnx.wasm.numThreads = 1;
env.backends.onnx.wasm.proxy = false;
env.backends.onnx.wasm.wasmPaths = { wasm: new URL(wasmURL, self.location.href).href, mjs: new URL(factoryURL, self.location.href).href };
const prefix = `https://huggingface.co/${GENERATION.model}/resolve/${GENERATION.revision}/`;
env.fetch = (input, init = {}) => {
  const url = String(input);
  if (!url.startsWith(prefix)) throw new Error("Unreviewed model asset");
  const headers = new Headers(init.headers);
  headers.delete("Authorization");
  return fetch(url, { ...init, headers, credentials: "omit", referrerPolicy: "no-referrer" });
};
self.addEventListener("message", async ({ data }) => {
  if (data.type !== "run") return;
  let generator;
  try {
    const options = { revision: GENERATION.revision, dtype: GENERATION.dtype, device: "wasm" };
    const [model, tokenizer] = await Promise.all([
      AutoModelForCausalLM.from_pretrained(GENERATION.model, options),
      AutoTokenizer.from_pretrained(GENERATION.model, options),
    ]);
    generator = new TextGenerationPipeline({ task: "text-generation", model, tokenizer });
    self.postMessage({ type: "loaded" });
    for (const test of data.cases) {
      const messages = buildMessages(test.question, test.sources);
      const prompt = tokenizer.apply_chat_template(messages, { tokenize: false, add_generation_prompt: true });
      const promptTokens = tokenizer(prompt, { add_special_tokens: false, truncation: false }).input_ids.data.length;
      if (promptTokens > GENERATION.maxPromptTokens) throw new Error("Oversized prompt: do not truncate source qualifications");
      const started = performance.now();
      const result = await generator(messages, { max_new_tokens: GENERATION.maxNewTokens, do_sample: false });
      const answer = result[0].generated_text.at(-1).content.trim();
      self.postMessage({ type: "case", row: { id: test.id, question: test.question, sourceIds: test.passages, promptTokens, milliseconds: Math.round(performance.now() - started), answer, ...inspectAnswer(answer, test.sources, test) } });
    }
    self.postMessage({ type: "done" });
  } catch (error) { self.postMessage({ type: "error", message: String(error) }); }
  finally { await generator?.dispose(); }
});
