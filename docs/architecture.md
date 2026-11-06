# Architecture decision: static delivery

## Goal

Help engineering hiring teams understand Anant's scope and technical judgment quickly, with founder/product ownership as supporting evidence. Operating cost must be zero. Content remains readable on modest devices and without JavaScript.

## Baseline analysis

The previous implementation used React/Vite, routing, particle effects, animation libraries, and a browser-rendered page shell. Its contact form simulated a successful send. A GitHub component requested an absent stats API. Documentation described Next.js and Nodemailer routes not implemented in the repository. Navigation and footer were rendered twice.

## Chosen approach

Astro generates seven HTML pages: home, four case studies, 404, and Ask. It renders Markdown at build time and extracts CSS. The first six pages contain no application scripts. Ask is an isolated interactive route with optional browser-local model inference. There is no database, backend process, hosted inference endpoint, contact API, or runtime GitHub fetch. System fonts avoid font downloads.

An always-visible GitHub section embeds a saved contribution calendar; optional CSS transforms animate the spectral background and rings. Semantic HTML and ordinary links support navigation. Illustrations contain no private screenshots or records.

Plain HTML would also meet runtime constraints but duplicate project metadata. Retaining React would reduce migration work but add a browser runtime without a current interactive need. A server framework would introduce operational responsibilities with no visitor benefit. Astro supplies content validation and routing while preserving static portability.

## Interfaces

Projects have title, label, summary, role, category, technologies, order, featured flag, illustration kind, evidence label, and optional public links. The content collection schema validates the frontmatter. Filenames become `/projects/<slug>/`. Markdown headings supply the detail-page table of contents. No public API is introduced.

Only `src/content/pages` and `src/content/projects` feed search. `src/lib/knowledge.ts` builds complete, contextual passages with source anchors. Never index `.codex`, repository research, environment files, private documents, customer data, or raw resume files. The search JSON files are static build artifacts, not API routes backed by a server.

## Performance and delivery contract

- Ordinary pages: zero application JavaScript and no model-related requests.
- Initial homepage transfer: under 300 KB. Search assets have separate budgets; a larger optional model must not consume the ordinary-page budget.
- Ask: a small controller and retrieval module load on this route. Corpus data loads for search. The model worker and inference assets load only after explicit opt-in.
- Optional inference currently needs about 40 MB of uncompressed assets: about 23 MB of quantized weights, 14 MB of same-origin WebAssembly, and the worker/runtime files. This is an approximate artifact size, not a measured network-transfer or memory claim.
- CSS: shared site styling plus Ask-only styling. System fonts require no remote requests.
- Target Lighthouse mobile performance/accessibility: 95 or above. Lab scores are not field Core Web Vitals.
- Build output must have working internal links, one h1 per page, no simulation states or known private markers.
- GitHub Pages serves static output from the public repository at its included github.io URL. No functions or paid add-ons.

Production uses `SITE_URL=https://the-anantkumar.github.io` and `SITE_BASE=/portfolio`; local builds default to `/` without a canonical origin. A shared path helper prefixes authored links and public assets. Build checks reject links outside the hosting base and validate sitemap/social URLs. Every document includes CSP and referrer metadata because GitHub Pages does not apply the optional Cloudflare `public/_headers` file. Ask alone enables its same-origin application scripts and worker. Host cache behavior and response-only security headers remain outside application control. The committed build verifier is the executable source for exact asset budgets.

Current local build measurements and enforced limits are separate from real network transfer. KB and MB below use decimal bytes; gzip estimates assume compression rather than a particular host response.

| Asset group | Current measured size, rounded where marked | Enforced cap |
| --- | --- | --- |
| Ordinary site output, excluding optional search assets | About 188 KB | 300 KB |
| Ask HTML, CSS, bootstrap, and corpus | About 22 KB gzip | 60 KB gzip |
| Ask bootstrap JavaScript | About 5 KB gzip | 20 KB gzip |
| Optional inference JavaScript | About 143 KB gzip | 250 KB gzip |
| Same-origin WebAssembly | 14,264,838 bytes | 16 MB |
| Public passage vectors | 137,995 bytes | 200 KB |
| Full upstream license notices | 351,753 bytes | 400 KB |
| Complete published artifact | About 15.5 MB | 17 MB |

The complete artifact includes optional runtime files and notices, but not the model weights downloaded from Hugging Face. It is not the initial visitor download. Re-run the build verifier after dependency or content changes; these measurements are a local snapshot, not permanent totals.

## Worker and hosting limits

Ordinary document CSP blocks scripts and connections. Ask's document policy allows same-origin scripts, workers, and connections, with WebAssembly support. Its HTTP-served worker has a separate execution context and does not inherit document CSP. GitHub Pages cannot supply a custom CSP response header for the worker. Do not claim the document policy restricts all worker networking. [Worker CSP behavior](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#content_security_policy)

The reviewed worker code instead restricts model requests to the pinned model root and omits credentials and referrers. This is an application guard, not a browser-enforced network sandbox; model downloads may follow provider CDN redirects. The optional Cloudflare `_headers` file supplies response-only protections, including `frame-ancestors`, while document metadata defines route policies. Pages ignores that file.

## Search decision

The earlier Pagefind proposal is replaced by a small custom retriever for the current 38-passage corpus. This keeps complete passages, qualifications, and source anchors explicit, and lets word matching and semantic retrieval share an evaluation suite. It avoids maintaining two indexes with different document boundaries. Pagefind remains an option if the site grows into a large document collection; custom ranking should not become an unbounded search-platform project.

The default path matches words locally. Optional AI search embeds the visitor's question, compares it with precomputed passage vectors, and combines semantic and lexical rankings. Results are related original complete passages, never generated answers or verification of a question's premise. Boundary rules and evidence thresholds reject some unsupported requests, but cannot guarantee detection of every absent fact or misleading premise. A match score ranks evidence; it is not a probability that a claim is true.

Transformers.js is pinned to `4.3.2`. The public Apache-2.0 model is `Xenova/all-MiniLM-L6-v2`, revision `751bff37182d3f1213fa05d7196b954e230abad9`, using `q8` weights, mean pooling, L2 normalization, and 384-dimensional vectors. The worker runs CPU WebAssembly with one inference thread, avoiding dependence on WebGPU or cross-origin isolation headers. Model weights are downloaded from Hugging Face only after consent; runtime files are served from the portfolio. `public/ai-notices/` publishes full upstream license and third-party notice files.

Both indexing and browser inference construct `AutoModel`, `AutoTokenizer`, and `FeatureExtractionPipeline` explicitly. The `remotePathTemplate` is pinned as well as the model options because some SDK metadata requests omit the revision option. The worker fetch guard rejects model requests outside the pinned root. Keep these protections when upgrading the SDK.

`npm run index:search` is an explicit maintainer operation using native CPU inference under Node 24. It embeds public content and public evaluation questions, checks passage token lengths, and writes versioned vector files. Normal builds verify the pinned configuration and corpus hash against committed data. No scheduled workflow generates embeddings or downloads model weights. Questions are not sent to an inference service or saved in URLs, logs, or persistent storage. The browser may cache model assets, but eviction is possible. Canceling terminates the worker and restores word matching. After the corpus has loaded, word matching needs no further network access in the current page session.

The current 74-question regression suite reports development top-three evidence recall of 39/43 (90.70%) for word matching and 42/43 (97.67%) for hybrid retrieval. Both modes preserve all 3 scope cases and reject all 22 unsupported examples, comprising 15 development and 7 challenge cases. On 6 independently written answerable challenge questions, word matching finds 0/6 and hybrid retrieval finds 3/6. These questions were written before fixes but then used during debugging, so they are now regression examples, not held-out evidence. The results measure retrieval, not answer accuracy or guaranteed abstention on unseen questions.

The fixes normalize validation word variants, constrain named-employer questions to that employer's evidence, prioritize precise word matches, and permit a bounded semantic fallback when the leading match is clearly separated. Thresholds are ranking choices, not truth tests. Remaining hybrid misses include LinkedIn-profile wording, a paraphrase about checking millions of records, a question requiring the complete product hypothesis and outcome, and generic portfolio wording about ownership from idea to release. See [the learning and evaluation guide](ai-search-learning.md).

Generated answers would require a separate generative model and new factuality, citation, refusal, latency, and download tests. They are outside the current implementation. No paid inference, API key, or trlr backend is introduced.

## References

- [Astro's static-first design](https://docs.astro.build/en/concepts/why-astro/)
- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [GitHub Pages Actions deployment](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Transformers.js repository and license](https://github.com/huggingface/transformers.js)
- [Pinned model files and model card](https://huggingface.co/Xenova/all-MiniLM-L6-v2/tree/751bff37182d3f1213fa05d7196b954e230abad9)

Free terms and quotas can change. Recheck before deployment or enabling any new service. Do not silently move to paid usage.

## November visual/activity iteration

A dark, continuous spectral palette replaces paper-like surfaces. Native checkbox and `:has()` provide an explicit animation pause control; reduced-motion overrides all CSS animation. The GitHub refresh script fetches public calendar HTML manually or in the scheduled workflow, validates a continuous full-year date range, and atomically persists a minimal aggregate snapshot when data changes. Builds and visitor requests do not depend on GitHub. The parser intentionally fails rather than fabricate counts if GitHub markup changes.

## Contribution-only GitHub section

Repository cards, repository metadata, and their refresh script were removed at the owner's request. The section shows only aggregate contribution activity and a dated heatmap. The deployment workflow checks every six hours on `main`, commits only changed calendar data, validates that exact revision in Chromium, then publishes the verified Pages artifact within the same run. No visitor-triggered API fetch exists. See [the refresh runbook](github-refresh.md) for activation and failure behavior.
