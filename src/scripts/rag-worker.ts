/// <reference lib="webworker" />
import { env, AutoModelForCausalLM, AutoTokenizer, TextGenerationPipeline } from "@huggingface/transformers";
import wasmURL from "onnxruntime-web/ort-wasm-simd-threaded.wasm?url";
import factoryURL from "onnxruntime-web/ort-wasm-simd-threaded.mjs?url";
import { RAG_MODEL } from "../lib/rag-config.mjs";
import { prepareRag, validateRagSelection } from "../lib/rag.mjs";
const scope = self as unknown as DedicatedWorkerGlobalScope;
env.allowLocalModels = false;
env.remotePathTemplate = `{model}/resolve/${RAG_MODEL.revision}/`;
env.useBrowserCache = true;
env.cacheKey = RAG_MODEL.cacheKey;
env.useWasmCache = false;
env.backends.onnx.wasm!.numThreads = 1;
env.backends.onnx.wasm!.proxy = false;
env.backends.onnx.wasm!.wasmPaths = { wasm: new URL(wasmURL, scope.location.href).href, mjs: new URL(factoryURL, scope.location.href).href };
const prefix = `https://huggingface.co/${RAG_MODEL.model}/resolve/${RAG_MODEL.revision}/`;
env.fetch = (input, init = {}) => {
  if (!String(input).startsWith(prefix)) throw new Error("Unpinned model asset");
  const headers = new Headers(init.headers); headers.delete("Authorization");
  return fetch(input, { ...init, headers, credentials: "omit", referrerPolicy: "no-referrer" });
};
let generator: TextGenerationPipeline | undefined;
let busy = false;
let progressAt = 0;
scope.addEventListener("message", async ({ data }) => {
  if (busy) return;
  busy = true;
  try {
    if (data.type === "load") {
      const options = { revision: RAG_MODEL.revision, dtype: "q8" as const, device: "wasm" as const,
        progress_callback: (p: { status: string; progress?: number }) => {
          if (Date.now() - progressAt < 500) return;
          progressAt = Date.now();
          scope.postMessage({ type: "progress", percent: Number.isFinite(p.progress) ? Math.round(p.progress!) : undefined });
        } };
      const [model, tokenizer] = await Promise.all([AutoModelForCausalLM.from_pretrained(RAG_MODEL.model, options), AutoTokenizer.from_pretrained(RAG_MODEL.model, options)]);
      generator = new TextGenerationPipeline({ task: "text-generation", model, tokenizer });
      scope.postMessage({ type: "ready" });
    } else if (data.type === "generate" && Number.isSafeInteger(data.id)) {
      if (!generator) throw new Error("Model unavailable");
      const prepared = prepareRag(data.question, data.passages);
      if (prepared.kind !== "ready") { scope.postMessage({ type: "answer", id: data.id, raw: '{"sources":[]}' }); return; }
      const prompt = generator.tokenizer.apply_chat_template(prepared.messages, { tokenize: false, add_generation_prompt: true }) as string;
      const tokens = generator.tokenizer(prompt, { add_special_tokens: false, truncation: false }).input_ids.data.length;
      if (tokens > RAG_MODEL.maxPromptTokens) throw new Error("Evidence exceeds context budget");
      const output = await generator(prepared.messages, { max_new_tokens: RAG_MODEL.maxNewTokens, do_sample: false });
      const raw = (output[0] as { generated_text: { content: string }[] }).generated_text.at(-1)!.content.trim();
      validateRagSelection(raw, prepared.passages);
      scope.postMessage({ type: "answer", id: data.id, raw });
    }
  } catch { scope.postMessage({ type: "error", id: data.id, message: "The local answer could not be completed. Original evidence is available." }); }
  finally { busy = false; }
});
