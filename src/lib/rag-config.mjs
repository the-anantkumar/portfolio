// Public immutable model. Selection requires its own explicit download opt-in.
// Hashes identify the pinned upstream files; runtime downloads are revision-pinned.
export const RAG_MODEL = Object.freeze({
  model: "Xenova/flan-t5-base",
  revision: "c6a1b98a4a35e1063d88edaceef4dc52cf3b2784",
  dtype: "q8",
  weightBytes: 275241990,
  weights: Object.freeze([
    Object.freeze({
      file: "onnx/encoder_model_quantized.onnx",
      bytes: 110502358,
      sha256: "ea3f6bf594f5e4133311a59d54d3471ae2440bbe613bca398248c2bd32a5b6ec",
    }),
    Object.freeze({
      file: "onnx/decoder_model_merged_quantized.onnx",
      bytes: 164739632,
      sha256: "92efb296407104c5723ff0719fbcee97eb980b4e9e9b6d04fba7ef35f67f408c",
    }),
  ]),
  maxPromptTokens: 512,
  maxNewTokens: 3,
  promptVersion: "per-document-binary-v1",
  cacheKey: "portfolio-rag-flan-v1",
});
