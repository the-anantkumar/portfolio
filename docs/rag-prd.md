# Local RAG product requirements

17 November 2026. Development on `pilot`, following `checkpoint/learning-lab-v1-2026-11-15`. Goal: a complete question-to-answer path grounded in public portfolio sources, with genuinely zero service spend. Production release is a separate step.

## Product and cost boundary

Keep immediate word search and guided topics as the default. Optional meaning-based retrieval remains a separate approximately 40 MB opt-in. Add an explicitly chosen local language-model answer mode on `/ask/`. It must run without an account, inference API, paid host, backend, analytics, or persistent query history. GitHub Pages serves only static assets. Model weights download from a pinned public Hugging Face revision; the model host sees the file request and normal network metadata, but receives no question or retrieved context.

The previous 135M model failed all eight screening cases. This phase may test a stronger model with a separate experimental download ceiling of 650 MB, not silently reuse the former 200 MB screening target. All existing initial-page and deployment-output budgets remain. Large downloads and memory are a material product tradeoff, so generated-answer opt-in must disclose the measured approximate size, device limits, and cancellation before starting. Phones retain fast evidence access and are not claimed validated without physical measurement.

## Answer contract

Compare a stronger model's free-prose baseline with constrained extractive RAG. Unrestricted paraphrase cannot be proved faithful with citation syntax or numeric regex checks. The deliverable may therefore use the LLM to generate a structured source selection and have application code compose an answer from complete original public passages. Label that mode **AI-selected answer** and explain that original wording is retained. Do not describe quotations as newly generated factual prose.

The pipeline is question → retrieve up to three complete public passages → pack evidence and instructions → local LLM generation → validate structure and source references → preserve required companion qualifications → render exact quotations with canonical citations. The LLM may select or abstain. It cannot supply HTML, links, facts, shortened quotes, or altered wording. This establishes provenance and text integrity, not independent factual truth or universal relevance. If free prose fails, record its failure and use the constrained path only if its own tests pass.

Unsupported, private, or no-evidence questions must abstain before generation. Validate output against the current request's retrieved sources, reject malformed/unknown/duplicate/excess IDs, and retain complete source sections. Selecting trlr's hypothesis must retain its current-outcome qualification. Do not silently truncate oversized prompts. Never stream unvalidated model text to the page. Failed validation shows the existing evidence and an explicit fallback status.

## Interaction and lifecycle

- Evidence appears first and remains usable during loading or generation. Topics/follow-ups do not start a model. A separate answer action uses the current typed question and retrieved evidence.
- First-use opt-in, progress, timeout, stop, retry, disable, and model-cache removal have clear controls. Do not automatically enable the other model or silently switch to a larger model.
- Every edit, topic, follow-up, new question, cancellation, disable, or page exit invalidates older answer work. A previous question's answer cannot appear under a newer question.
- Use an isolated worker so CPU inference does not block controls. Stop terminates inference; retry loads the same pinned candidate. No conversation memory is required.
- Create citations from the canonical public corpus, not model text. Render with text DOM APIs and keep complete evidence expandable.
- Keep no-JavaScript browse links, keyboard operation, visible focus, live status, reduced motion, and 320/390/1440px layouts. Ordinary pages remain script-free.

## Evaluation and gates

Freeze `experiments/rag/cases.json` before candidate/prompt tuning. These 20 supplied-evidence cases isolate generation, include distractors, and cover founder/employer attribution, dated figures, migration scope, nonproduction testing, pending work, negative durations, multi-source qualifications, unrelated requests, unknown facts, and injection. Once observed they are screening/regression evidence, not a blind benchmark. Preserve the original eight-case failure record.

Test context assembly, output rejection, companion completeness, exact answer text/citations, unsupported preflight, and stale-response handling offline. Run the real pinned model in native CPU and browser WASM. Record raw model selection quality separately from application repairs and fallback rate. A valid selection is not automatically a correct answer; manually compare selection with the question and source. End-to-end tests must exercise actual retrieval, not only supplied passages.

Required checks: Node 24 `npm run check`, production-path `npm run build`, `npm test`, retrieval suites, committed browser checks, learning-lab checks, and an explicit real-model RAG run. Default tests do not download models. Record runtime, transfer, generation latency, cache behavior, cancellation, and browser limits; viewport emulation is not physical-phone evidence. No deployment is implied.

## Learning checkpoints

Commit in phases of one to three files, with annotated checkpoints for the frozen contract, model screening, integrated pipeline, and final verification. Update the learning tracker with context packing, generation, validation, citations, and fallback components. Show the full pipeline and safe saved examples in the local lab. Preserve failed experiments and the distinction between built, experimental, planned, and owner-reviewed.
