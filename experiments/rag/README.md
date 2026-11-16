# Extractive RAG checkpoint

The implemented pipeline retrieves public passages, uses a local FLAN-T5-base model to generate a yes/no relevance decision for each complete passage, validates the selection, and composes exact source quotations with canonical citations. It is an experimental extractive answer mode, not free-form generated biography or open-ended chat.

## Reproduce

Use Node 24, install dependencies, and build the production path:

```sh
SITE_URL=https://the-anantkumar.github.io SITE_BASE=/portfolio npm run build
npm run test:rag
npm run test:rag:browser
npm run experiment:rag
node experiments/rag/flan-screen.mjs --cases experiments/rag/holdout.json
TEST_RAG_MODEL=1 npm run test:rag:browser
```

The first two test commands are model-free. The final three explicitly download pinned public model files as needed. Install Chromium with `npx playwright install chromium`, or provide `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. No account, model API, secret, or paid service is used. Experiment exit success means the run completed; it does not mean every answer met the quality expectation. Reports and model caches stay under ignored `artifacts/rag/`.

The candidate is `Xenova/flan-t5-base`, revision `c6a1b98a4a35e1063d88edaceef4dc52cf3b2784`. Q8 encoder plus merged decoder weights total 275,241,990 bytes. [Conversion and pinned files](https://huggingface.co/Xenova/flan-t5-base/tree/c6a1b98a4a35e1063d88edaceef4dc52cf3b2784), [upstream model card](https://huggingface.co/google/flan-t5-base). Apache-2.0 notices remain under `public/ai-notices/`. `src/lib/rag-config.mjs` records both weight hashes, the immutable revision, context limit, and cache name. Source text is never truncated: inputs over 512 tokens are rejected. The model emits at most three tokens per passage; unsupported labels reject the answer.

## What passed, and what did not

The [safe reviewed result summary](results-summary.json) distinguishes source-selection quality from interface correctness. Twenty supplied-source questions were frozen before tuning. Eight further questions were frozen after choosing the binary model/prompt and before browser validation; they were not used to tune it. These are small sets and do not establish general accuracy.

The [17 November public corpus snapshot](corpus-2026-11-17.json) preserves the exact public source text used by these recorded results. Its content hash must match `results-summary.json`; the learning lab checks that before replaying any RAG case. Current word/hybrid traces continue to use the current built corpus and its verified index. Later editorial changes therefore update the current search without rewriting the historical model measurements or presenting old results as a fresh evaluation.

| Runtime | Screening exact sets | Fresh exact sets |
| --- | --- | --- |
| Native CPU | 18/20 | 6/8 |
| Browser WASM | 14/20 | 4/8 |

The browser's ten mismatches comprise nine abstentions and one extra irrelevant source in the fresh set. Displayed wording and citation URLs still come unchanged from public content. A structurally valid selection does not establish relevance or independent truth. A cross-role comparison that omits a requested ownership group falls back instead of presenting a partial comparison. Product-hypothesis answers include the outcome qualification, with repairs recorded separately.

The real UI scenario exercised typed question → word retrieval → actual browser model → complete quotations and citations. Cold readiness was 10,227 ms with 290,404,901 reported response-body bytes. With cached weights, readiness was 716 ms and additional runtime transfer was 14,289,219 bytes. The cache contained both pinned weights and tokenizer/configuration files. Actual inference cancellation passed and no question was transmitted. The separate fixed-case worker reused those cached weights. Generation took approximately 1 to 1.7 seconds per supported question on this desktop Chromium run. These are individual laboratory samples at a narrow viewport, not physical-phone measurements or a latency guarantee.

Default browser checks exercise explicit opt-in, source identity and exact text, invalid output, abstention, privacy, retries, edits and topic races, download/inference cancellation, scoped cache removal, keyboard access, 320/390/1440px layouts, and axe. Original search and no-JavaScript navigation remain covered by the existing browser suite.

## Decision and remaining work

The end-to-end implementation is complete for an experimental development checkpoint on `pilot`. Production model acceptance is **not** marked complete. The browser quality gate has not been met; retain the experimental label and evidence fallback. Physical-phone measurements, a future release PR/CI run, and hosted exact-commit verification also remain pending. No production merge or deployment occurred.

Earlier Qwen free-prose and structured-selection experiments remain reproducible through `screen.mjs`, `select.mjs`, and their separately pinned `candidate.mjs`. They must not silently use the FLAN configuration. Raw invented facts from failed prose runs are excluded from committed records. The 135M failure record remains in `../generation/`.

The next improvement must use a new frozen evaluation set before tuning, separate native/browser results, and keep the original scope and privacy requirements. Do not treat a successful download, fluent prose, or a well-formed citation as model acceptance.
