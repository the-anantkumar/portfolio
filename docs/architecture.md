# Architecture decision: static delivery

## Goal

Help engineering hiring teams understand Anant's scope and technical judgment quickly, with founder/product ownership as supporting evidence. Operating cost must be zero. Content remains readable on modest devices and without JavaScript.

## Baseline analysis

The previous implementation used React/Vite, routing, particle effects, animation libraries, and a browser-rendered page shell. Its contact form simulated a successful send. A GitHub component requested an absent stats API. Documentation described Next.js and Nodemailer routes not implemented in the repository. Navigation and footer were rendered twice.

## Chosen approach

Astro generates seven HTML pages: home, four case studies, 404, and Ask. It renders Markdown at build time and extracts CSS. The first six pages contain no application scripts. Ask is an isolated interactive route with optional browser-local model inference. There is no database, backend process, hosted inference endpoint, contact API, or runtime GitHub fetch. System fonts avoid font downloads.

An always-visible GitHub section embeds a saved contribution calendar. A continuous light canvas, shared typography, native disclosures, and ordinary links support navigation. No ambient animation runs. Workflow diagrams contain no private screenshots or records.

Plain HTML would also meet runtime constraints but duplicate project metadata. Retaining React would reduce migration work but add a browser runtime without a current interactive need. A server framework would introduce operational responsibilities with no visitor benefit. Astro supplies content validation and routing while preserving static portability.

## Interfaces

Projects have title, label, summary, role, category, technologies, order, featured flag, illustration kind, evidence label, and optional public links. The content collection schema validates the frontmatter. Filenames become `/projects/<slug>/`. Markdown headings supply the detail-page table of contents. No public API is introduced.

Only `src/content/pages` and `src/content/projects` feed search. `src/lib/knowledge.ts` builds complete, contextual passages with source anchors. Never index `.codex`, repository research, environment files, private documents, customer data, or raw resume files. The search JSON files are static build artifacts, not API routes backed by a server.

## Performance and delivery contract

- Ordinary pages: zero application JavaScript and no model-related requests.
- Initial homepage transfer: under 300 KB. Search assets have separate budgets; a larger optional model must not consume the ordinary-page budget.
- Ask: a small controller and retrieval module load on this route. Corpus data loads for search. The model worker and inference assets load only after explicit opt-in.
- Optional meaning-search inference needs about 40 MB of uncompressed assets: about 23 MB of quantized weights, 14 MB of same-origin WebAssembly, and the worker/runtime files. This is an approximate artifact size, not a measured network-transfer or memory claim.
- Experimental extractive RAG has a separate approximately 300 MB first-use disclosure and explicit opt-in. Its model files are remote pinned public assets; no server inference is used.
- CSS: shared site styling plus Ask-only styling. System fonts require no remote requests.
- Target Lighthouse mobile performance/accessibility: 95 or above. Lab scores are not field Core Web Vitals.
- Build output must have working internal links, one h1 per page, no simulation states or known private markers.
- GitHub Pages serves static output from the public repository at its included github.io URL. No functions or paid add-ons.

Production uses `SITE_URL=https://the-anantkumar.github.io` and `SITE_BASE=/portfolio`; local builds default to `/` without a canonical origin. A shared path helper prefixes authored links and public assets. Build checks reject links outside the hosting base and validate sitemap/social URLs. Every document includes CSP and referrer metadata because GitHub Pages does not apply the optional Cloudflare `public/_headers` file. Ask alone enables its same-origin application scripts and worker. Host cache behavior and response-only security headers remain outside application control. The committed build verifier is the executable source for exact asset budgets.

The historical local measurements below are from 15 November 2026. The November 17 RAG layer adds a separate runtime budget; rerun the build verifier for current measurements. Artifact limits remain separate from real network transfer. KB and MB below use decimal bytes; gzip estimates assume compression rather than a particular host response.

| Asset group | Current measured size, rounded where marked | Enforced cap |
| --- | --- | --- |
| Ordinary site output, excluding optional search assets | About 187 KB | 300 KB |
| Ask HTML, CSS, bootstrap, and corpus | About 27.4 KB gzip | 60 KB gzip |
| Ask bootstrap JavaScript | About 7.9 KB gzip | 20 KB gzip |
| Search inference JavaScript | About 143 KB gzip at the November 15 checkpoint | 250 KB gzip |
| Experimental answer worker JavaScript | Record from the current build | 250 KB gzip |
| Combined optional inference JavaScript | Record from the current build | 500 KB gzip |
| Same-origin WebAssembly | 14,264,838 bytes | 16 MB |
| Public passage vectors | 138,012 bytes | 200 KB |
| Full upstream license notices | 351,753 bytes | 400 KB |
| Complete published artifact | About 15.5 MB | 17 MB |

The complete artifact includes optional runtime files and notices, but not the model weights downloaded from Hugging Face. It is not the initial visitor download. Re-run the build verifier after dependency or content changes; these measurements are a local snapshot, not permanent totals.

## Worker and hosting limits

Ordinary document CSP blocks scripts and connections. Ask's document policy allows same-origin scripts, workers, and connections, with WebAssembly support. Its HTTP-served worker has a separate execution context and does not inherit document CSP. GitHub Pages cannot supply a custom CSP response header for the worker. Do not claim the document policy restricts all worker networking. [Worker CSP behavior](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#content_security_policy)

The reviewed worker code instead restricts model requests to the pinned model root and omits credentials and referrers. This is an application guard, not a browser-enforced network sandbox; model downloads may follow provider CDN redirects. The optional Cloudflare `_headers` file supplies response-only protections, including `frame-ancestors`, while document metadata defines route policies. Pages ignores that file.

## Search decision

The earlier Pagefind proposal is replaced by a small custom retriever for the current 38-passage corpus. This keeps complete passages, qualifications, and source anchors explicit, and lets word matching and semantic retrieval share an evaluation suite. It avoids maintaining two indexes with different document boundaries. Pagefind remains an option if the site grows into a large document collection; custom ranking should not become an unbounded search-platform project.

The default path matches words locally. Optional AI search embeds the visitor's question, compares it with precomputed passage vectors, and combines semantic and lexical rankings. Retrieval returns related original complete passages and does not verify a question's premise. The separately enabled extractive RAG layer consumes this same evidence. Boundary rules and evidence thresholds reject some unsupported requests, but cannot guarantee detection of every absent fact or misleading premise. A match score ranks evidence; it is not a probability that a claim is true.

Transformers.js is pinned to `4.3.2`. The public Apache-2.0 model is `Xenova/all-MiniLM-L6-v2`, revision `751bff37182d3f1213fa05d7196b954e230abad9`, using `q8` weights, mean pooling, L2 normalization, and 384-dimensional vectors. The worker runs CPU WebAssembly with one inference thread, avoiding dependence on WebGPU or cross-origin isolation headers. Model weights are downloaded from Hugging Face only after consent; runtime files are served from the portfolio. `public/ai-notices/` publishes full upstream license and third-party notice files.

Both indexing and browser inference construct `AutoModel`, `AutoTokenizer`, and `FeatureExtractionPipeline` explicitly. The `remotePathTemplate` is pinned as well as the model options because some SDK metadata requests omit the revision option. The worker fetch guard rejects model requests outside the pinned root. Keep these protections when upgrading the SDK.

`npm run index:search` is an explicit maintainer operation using native CPU inference under Node 24. It embeds public content and public evaluation questions, checks passage token lengths, and writes versioned vector files. Normal builds verify the pinned configuration and corpus hash against committed data. No scheduled workflow generates embeddings or downloads model weights. Questions are not sent to an inference service or saved in URLs, logs, or persistent storage. The browser may cache model assets, but eviction is possible. Canceling terminates the worker and restores word matching. After the corpus has loaded, word matching needs no further network access in the current page session.

The search checks now cover 90 questions: 74 existing regression cases and 16 reserved questions written before the November 15 changes. Native CPU evaluation finds the expected evidence in the top three for 43/43 development, 6/6 challenge, and 8/8 reserved answerable questions in hybrid mode. Word matching finds 40/43, 1/6, and 3/8 respectively. Both modes pass 5 scope and 28 unsupported/privacy checks. Actual browser WASM inference also passes all 57 answerable, 5 scope, and 28 unsupported examples. These measure retrieval on this small collection, not answer-generation accuracy or guaranteed behavior on unseen questions.

Public contact labels include the available contact channels. Query preprocessing version 2 removes locator phrases such as “in this portfolio” before both lexical and semantic matching, while leaving direct site-architecture questions intact. The index generator and worker share the same preprocessing and model metadata; a version mismatch rejects stale vectors. Model weights remain unchanged.

A bounded fallback can use two leading sections from the same source when their scores are separated from other sources and the question shares substantive words. This handles small native CPU versus WASM quantization differences without reducing the global similarity threshold. Questions about a product assumption or predictions retain both its problem and current-outcome sections when the source supplies both. `expectedAll` fixtures require that complete bundle; returning part of it fails completeness, while abstaining remains a recall miss.

The 16 reserved questions were frozen in `e7be182` before ranking changes. Their first run followed a ranking freeze; results were then visible before a follow-up fix for an existing real-browser regression. They were not used to tune that fix, but final repeated results must not be presented as a fully blind independent benchmark. See [the learning and evaluation guide](ai-search-learning.md) for the initial checkpoint and current measurements.

The November 17 extractive RAG implementation adds a separate local sequence-to-sequence model after retrieval, described below. Unrestricted model-written factual prose remains excluded. No paid inference, API key, or trlr backend is introduced.

## Portfolio navigator presentation

The [navigator PRD](portfolio-navigator-prd.md) defines the next layer above retrieval. `/ask/` renders source-card templates from the existing typed public collections. Each card has its published role, summary, technologies where applicable, and a link to the actual case study or page section. Runtime evidence is inserted with DOM text APIs and keeps every original paragraph and source anchor inside a native disclosure. Summaries are authored navigation previews, not generated answers.

`src/lib/navigator.mjs` defines six topic selections and contextual follow-up targets using public passage IDs. The build rejects missing targets, missing source cards, and ambiguous template IDs. Nielsen experience maps to its employer case-study card; founder work keeps its own source group. Grouping preserves passage order within a source and does not alter the original evidence.

Topic actions and guided follow-ups select explicit public passages without invoking the model, including when semantic search has already been enabled. Typed questions keep the original retrieval boundary checks. A monotonically increasing request sequence prevents an older topic or typed question from overwriting a later selection. No visitor history is persisted.

The model disclosure starts collapsed and contains the download explanation and enable control. No-match help opens that disclosure and focuses the control; enabling remains a separate action. At the November 15 navigator checkpoint, ordinary pages, the contribution refresh workflow, embedding-model revision, and embedding data were unchanged. Initial Ask HTML/CSS/controller/corpus measured 27,431 bytes gzip, below its 60 KB cap. The November 17 integration must satisfy the same initial-page cap and its separate answer-runtime budget. The browser suite checks native evidence disclosures, all topics, follow-ups, and request races in addition to the 90-question retrieval contract.

## Local learning and generation screening

`docs/learning-tracker.json` describes 18 component boundaries, implementation status, exercises, and dated milestones. `scripts/learning-lab.mjs` validates those file references and the existing public corpus/vector hashes, then runs the actual retriever for six saved evaluation questions. A standalone HTML explorer is generated under ignored `artifacts/learning/`. Its loopback server serves only that document. The explorer has no model download or API; optional review markers contain component IDs only in the owner's browser. It is not an additional public route and is excluded from the Pages artifact.

`experiments/generation/` isolates a pinned instruction model from the public search runtime. Native CPU and browser WASM runners supply fixed questions with complete relevant public passages, reject oversized prompts, and inspect generated citations, scope, and abstention before manual review. Raw drafts and caches stay in ignored artifacts. The first candidate failed all eight automated screening cases in both runtimes, with confirmed semantic errors, and is not integrated into `/ask/`. Routine CI tests the offline contract and the model-free learning lab; model screening requires an explicit developer command. See [the reviewed decision](../experiments/generation/results-summary.json).

## Experimental extractive RAG pipeline

The [RAG product contract](rag-prd.md) defines the November 17 integration on `pilot`. A minimalist refinement keeps the question, topic navigation, source evidence, and optional model controls in a single readable flow. The pipeline is complete locally, while browser, fresh-question, and device measurements determine its release status.

```text
Question → retrieve up to three complete public passages
         → prepare an immutable question/evidence snapshot
         → public-scope and context checks
         → explicit answer-model opt-in
         → per-document local yes/no generation
         → validate source selection and companion qualifications
         → exact original quotations with canonical citations
         → evidence fallback on abstention, incomplete context, or failure
```

`src/lib/rag-config.mjs` pins `Xenova/flan-t5-base` q8 at revision `c6a1b98a4a35e1063d88edaceef4dc52cf3b2784`. The encoder and merged decoder files total 275,241,990 bytes. Their recorded hashes identify the reviewed files; runtime URLs are pinned to the revision. The approximately 300 MB first-use disclosure includes tokenizer/runtime overhead rather than claiming a universal transfer or memory size. The embedding model remains a separate opt-in with its original revision.

`src/scripts/rag-worker.ts` uses `AutoModelForSeq2SeqLM` and `AutoTokenizer` in a single-thread CPU/WASM worker. For each complete retrieved passage, `src/lib/rag-prompt.mjs` asks whether it answers the question. The full title, attribution, text, question, and instruction must fit within 512 tokens. Generation is limited to three new tokens, and only a yes/no result is accepted. Context is never silently truncated. The worker turns positive decisions into source indices; it cannot supply the displayed factual wording.

`src/lib/rag.mjs` rejects private or unsupported requests before inference, freezes public source fields, and validates the narrow selection contract. All selected indices must belong to the current request. Required trlr outcome context is preserved and repairs remain measurable. A partial employer/founder comparison abstains rather than presenting one side as complete. `src/scripts/rag.ts` constructs quotations, attributions, and links using DOM text APIs and canonical corpus values. These checks enforce provenance and text identity; they cannot prove independent factual truth, universal relevance, or every possible completeness requirement.

The controller owns the request lifecycle. Editing, topic navigation, new evidence, stop, disable, and page exit invalidate stale answer work. Loading and generation have timeouts. Stop terminates the worker; retry uses the same pinned model. Cache removal targets only `portfolio-rag-flan-v1`. No questions enter URLs, network payloads, logs, or persistent storage. Only progress is shown before validation; model output never streams into the page as unchecked prose. Ordinary evidence navigation remains available throughout.

The native 20-case supplied-evidence screen produced 18 exact expected source sets: 12/14 answerable and 6/6 unsupported. Five unsupported cases were blocked by application preflight, so they must not be counted as model refusals. No unrelated source was selected in that screen. Dated adoption and the employer/founder comparison remained misses; the latter is now an explicit fallback. These are development results after observing earlier candidates, not blind general accuracy. Record the actual browser and fresh-question results in [verification](verification.md) before claiming those checks complete. Physical-phone inference remains unmeasured.

`npm run test:rag` covers context and source contracts. `npm run test:rag:browser` covers lifecycle/UI behavior without external model downloads. `TEST_RAG_MODEL=1 npm run test:rag:browser` explicitly exercises real browser inference, while `npm run experiment:rag` runs native screening. Published initial-page budgets and the 17 MB full-output cap remain; optional search JS and answer-worker JS each have a 250 KB gzip cap, with a 500 KB combined cap. Upstream notices remain under `public/ai-notices/`.

## References

- [Astro's static-first design](https://docs.astro.build/en/concepts/why-astro/)
- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [GitHub Pages Actions deployment](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Transformers.js repository and license](https://github.com/huggingface/transformers.js)
- [Pinned model files and model card](https://huggingface.co/Xenova/all-MiniLM-L6-v2/tree/751bff37182d3f1213fa05d7196b954e230abad9)

Free terms and quotas can change. Recheck before deployment or enabling any new service. Do not silently move to paid usage.

## November visual/activity iteration

The earlier November iteration used a dark spectral palette and a native animation pause control. The later [minimal editorial redesign](design-polish.md) supersedes that presentation with a continuous light canvas and no ambient animation; reduced motion still disables nonessential transitions and scrolling. The GitHub refresh script fetches public calendar HTML manually or in the scheduled workflow, validates a continuous full-year date range, and atomically persists a minimal aggregate snapshot when data changes. Builds and visitor requests do not depend on GitHub. The parser intentionally fails rather than fabricate counts if GitHub markup changes.

## Contribution-only GitHub section

Repository cards, repository metadata, and their refresh script were removed at the owner's request. The section shows only aggregate contribution activity and a dated heatmap. The deployment workflow checks every six hours on `main`, commits only changed calendar data, validates that exact revision in Chromium, then publishes the verified Pages artifact within the same run. No visitor-triggered API fetch exists. See [the refresh runbook](github-refresh.md) for activation and failure behavior.

The final browser selection measurement is **14/20 screening cases and 4/8 fresh cases**, compared with native CPU results of 18/20 and 6/8. The experimental pipeline works end to end, but model-quality promotion remains pending. See [the reviewed RAG record](../experiments/rag/README.md) for misses, cache measurements, and reproduction commands.
