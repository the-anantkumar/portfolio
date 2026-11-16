# Anant Kumar Srivastava | portfolio

A static engineering portfolio built with Astro, TypeScript, Markdown, and CSS. The light editorial design uses shared typography, open project presentations, and an embedded GitHub activity section. It targets MTS 2 / SDE 2+ opportunities and presents founder work as evidence of product and technical ownership. The optional `/ask/` page finds original portfolio passages, with browser-local meaning search and an experimental extractive RAG mode available through separate explicit download choices on `pilot`.

## Run locally

Use Node 24 (`nvm use` if you use nvm) and npm. The repository pins dependencies and commits its lockfile.

```sh
npm ci
npm run dev
```

Astro prints the local preview address. For a production preview:

```sh
npm run check
npm run build
npm run preview
```

`npm run build` also verifies generated routes, internal links and anchors, publication boundaries, punctuation, deployment paths, canonical URLs, and size budgets. `npm test` tests the calendar refresh, search retrieval, navigator source handling, the offline generation contract, and RAG source validation, then reruns build checks against the existing `dist/` output. `npm run test:github` runs the refresh tests alone, offline and without installed dependencies. `npm run test:search` compares word matching and hybrid retrieval across both the original and reserved question suites using committed public evaluation vectors. `npm run test:search:holdout` runs the reserved set alone. `npx playwright install chromium` then `npm run test:browser` checks the built site in Chromium, including accessibility and mobile layouts. No test makes paid requests.

## Content and structure

- `src/content/pages/home.md`: headline, introduction, professional positioning, and public contact links.
- `src/content/pages/about.md`: biography, education, and music.
- `src/content/pages/experience.md`: employers, dates, roles, and contributions.
- `src/content/projects/*.md`: one case study per project. Frontmatter feeds homepage cards; the body supplies the detail page.
- `src/content.config.ts`: typed content collections; invalid content fails validation.
- `src/pages/`: homepage, generated project routes, Ask, 404, robots, sitemap, and static search data.
- `src/lib/knowledge.ts`: builds the search corpus exclusively from public content collections.
- `src/lib/retrieval.mjs`: word matching and hybrid ranking, with unsupported-request handling.
- `src/lib/navigator.mjs`: validated topic selections, source grouping, and contextual follow-ups.
- `src/lib/embedding-config.mjs`: pinned model revision and corpus/index compatibility checks.
- `src/scripts/ask.ts` and `embedding-worker.ts`: optional search interface and model worker.
- `src/lib/rag.mjs` and `rag-prompt.mjs`: context boundaries, per-document relevance prompts, complete-source validation, and citation inputs.
- `src/scripts/rag.ts` and `rag-worker.ts`: separate answer-model opt-in, local generation, cancellation, cache removal, and evidence fallback.
- `src/lib/rag-config.mjs`: the pinned FLAN-T5-base configuration and context limits.
- `src/data/search-vectors.json`: precomputed public passage embeddings, regenerated only by a maintainer.
- `src/components/ProjectVisual.astro`: accessible workflow diagrams derived from public project content; these are explanatory outlines, not screenshots or user records.
- `docs/architecture.md`: stack decisions, delivery boundaries, and the search architecture.
- `docs/portfolio-navigator-prd.md`: product scope, acceptance criteria, and implementation evidence for the navigator.
- `docs/ai-search-learning.md`: a hands-on introduction to embeddings, retrieval, evaluation, and later generated answers.
- `docs/learning-tracker.md` and `.json`: component map, input/output boundaries, exercises, and dated experiment outcomes.
- `experiments/generation/` and `experiments/rag/`: local model comparisons and fixed evaluation cases, excluded from the published site.
- `docs/rag-prd.md`: the end-to-end RAG product contract, quality boundaries, and checkpoint plan.
- `docs/editorial-review.md`: the three-perspective editorial review.

Set `featured: true` and a numeric `order` to feature a project. The Markdown filename is its public URL slug. Keep existing slugs stable; GitHub Pages does not support server redirect rules.

## Free GitHub Pages deployment

Production URL: **https://the-anantkumar.github.io/portfolio/**

`main` is the production branch; `pilot` remains the development branch. `.github/workflows/portfolio.yml` checks pull requests, then builds and deploys successful changes on `main`. The same workflow handles the six-hour contribution refresh and verifies the public release after deployment.

| Setting | Value |
| --- | --- |
| Pages source | GitHub Actions |
| Production branch | `main` |
| Node version | 24 |
| Site origin (`SITE_URL`) | `https://the-anantkumar.github.io` |
| Base path (`SITE_BASE`) | `/portfolio` |
| Static output | `dist` |

No purchased domain, backend, database, model API, or Cloudflare account is needed. Use the public repository and standard GitHub-hosted runner. No paid plan or automatic upgrade is enabled. The Pages artifact expires after one day; dependency caching is disabled. See [deployment, testing, and rollback](docs/deployment.md).

To reproduce the production build locally:

```sh
SITE_URL=https://the-anantkumar.github.io SITE_BASE=/portfolio npm run build
npm test
npm run test:browser
```

Ordinary local builds use `/` and omit canonical URLs. Production links, assets, social previews, and the sitemap include `/portfolio/`. `dist/release.json` identifies the source commit deployed for verification.

GitHub Pages does not apply `public/_headers`; that file remains an optional Cloudflare configuration for a future host migration. Every HTML page supplies a restrictive Content Security Policy and referrer policy through metadata. The six ordinary pages remain script-free. Only Ask enables application scripts and its model worker. Document CSP is not a network boundary for that worker; see [worker and hosting limits](docs/architecture.md#worker-and-hosting-limits). Response-only protections such as `frame-ancestors`, custom cache headers, and Permissions-Policy cannot be configured on Pages. Host caching may briefly delay a newly deployed asset.

## Privacy and claims

The public email and LinkedIn are authorized contact channels. The phone number and raw resume are excluded. `.codex/`, local environment files, and audit artifacts are ignored. Do not put private source notes in `public/`, published Markdown, or repository documentation. There are no cookies set by this application, analytics integrations, server form submissions, or query logs. Ask questions stay in browser memory and are not placed in URLs or persistent storage. Optional model files may be cached by the browser. Hosting and model-download providers still process normal HTTP requests; this is not a claim that infrastructure collects no data.

Store metrics are dated snapshots. Portfolio narratives distinguish independent products from employer work and do not claim measured AI superiority. Review `docs/editorial-review.md` before adding new metrics.

## Ask and optional AI search

Ask starts with lightweight word matching. It returns related complete public passages and source links. Retrieval does not verify the premise of a question. An additional experimental answer mode is described below. Visitors can enable meaning-based search using a small embedding model that runs on their device. No model download happens before that choice. If loading fails or is canceled, word matching remains available. No-match feedback explains the public-content boundary or offers a path to the AI download disclosure. Questions about product assumptions preserve the source’s outcome and qualifications too. Without JavaScript, Ask offers useful portfolio links.

This needs no backend, API key, Hugging Face account, or paid inference service. The model and runtime add about 40 MB of uncompressed assets on first use; actual network transfer and load time depend on compression, cache, and device. Browser cache can be evicted. Ordinary pages never download the model or search scripts.

When public search content changes, regenerate its vectors explicitly:

```sh
npm run index:search
npm run check
npm run build
npm test
npm run test:browser
```

The indexing command downloads the pinned public model as needed and updates passage vectors plus vectors for both public evaluation-question suites. Normal builds use committed vectors, verify their content hash and preprocessing version, and fail if the index is stale. They do not download models. Review index changes with the corresponding content change. Full upstream license files are published under `public/ai-notices/`. The learning guide explains the [pipeline, evaluation commands, and limits](docs/ai-search-learning.md).

## GitHub activity and interaction

The homepage displays the contribution calendar and aggregate activity counts. GitHub links scroll to this section rather than leaving the portfolio. Repository-level information is not included.

The SVG is a local, lazy-loaded static asset; daily counts are available as a CSV. Visitors make no GitHub API requests. The calendar works without JavaScript and shows its snapshot date.

**The six-hour refresh is part of the deployment workflow.** It validates public calendar data, commits changes to `main`, then tests and deploys that exact revision in the same run. Unchanged scheduled checks skip deployment; failures retain the last published site. Manual refresh still works:

```sh
npm run refresh:github
npm run build
```

No personal access token or service secret is required. [Refresh operations and failure handling](docs/github-refresh.md) describe the schedule, manual runs, and pause controls.

This is an automatically refreshed snapshot. Reloading the page reads deployed data; an already-open page does not poll. The displayed snapshot date changes only when the saved calendar changes. GitHub contribution processing, the schedule, deployment, and CDN caching all affect freshness.

The site has no ambient animation. Small control transitions and smooth anchor scrolling respect `prefers-reduced-motion`. No animation JavaScript or preference storage is needed. The current [visual design brief](docs/design-polish.md) replaces the earlier dark spectral direction.

## Search validation on pilot

The November 15 iteration resolves the four initial hybrid-search misses. `TEST_AI_MODEL=1 npm run test:browser` explicitly downloads the public model and tests all 90 questions through the browser worker, including source identity, original passage text, unsupported requests, and complete evidence. The default browser suite stays independent of external model hosting. See [the learning guide](docs/ai-search-learning.md#november-15-improve-the-evidence-before-changing-the-model) for measurements and their limits. Physical-phone validation and production release remain pending.

## Portfolio navigator

The `/ask/` experience now has three concise example questions, six topics behind a native disclosure, source cards with the first complete passage visible, expandable full evidence, and contextual follow-up questions. Topic navigation works without a model. Card summaries come from the same typed public collections as the rest of the portfolio. Nielsen experience and case-study passages share a card while keeping employer work separate from founder work.

Guided questions select explicit public sources. Free-text questions continue to use word matching and optional on-device semantic retrieval. The model disclosure starts collapsed; opening it does not start a download. The November 17 development adds an experimental extractive answer layer with its own opt-in. Open-ended conversational memory is not implemented.

The [PRD](docs/portfolio-navigator-prd.md) records the reviewed scope and acceptance criteria. `npm run test:navigator` verifies grouping, complete product evaluation evidence, source integrity, and deduplication; it is included in `npm test`. Browser checks also cover all topics, guided follow-ups, evidence disclosures, and races between topics and typed questions. The [verification record](docs/verification.md#portfolio-navigator-15-november-2026) includes the real-model run and performance measurements.

## Revisit what was built

Start with [the learning tracker](docs/learning-tracker.md). After a site build, run `npm run learn` and open `http://127.0.0.1:4382/`. The local lab maps 18 components to code, compares six prepared word/hybrid search traces, and explains the first generation candidate's failures. It downloads no model and is never copied into `dist/`. `npm run learn:build` creates an offline standalone HTML file under ignored `artifacts/learning/`; `npm run test:learn` checks mobile layouts, keyboard focus, local review state, offline operation, and accessibility in Chromium.

Your reviewed-component markers are local browser state and begin unchecked. Implementation status does not claim personal understanding. The [first generation experiment](experiments/generation/README.md) failed its eight-case native and browser screen, so that candidate was rejected. The current RAG mode preserves original quotations instead of accepting generated factual prose. Its model downloads are explicit developer commands, separate from normal builds and tests.

## Experimental extractive RAG on pilot

The minimal Ask interface keeps evidence visible first. After a separate **Enable AI-selected answers** action, a visitor can compose an answer from the current retrieved sources. A local language model judges each complete passage, and the application renders the selected original quotations with attribution and canonical source links. This is extractive RAG: it selects evidence for an answer, rather than writing new biographical claims or maintaining an open-ended chat history.

The candidate is `Xenova/flan-t5-base` q8 at revision `c6a1b98a4a35e1063d88edaceef4dc52cf3b2784`. Its encoder and decoder weights total 275,241,990 bytes. The first-use disclosure is approximately **300 MB**, including tokenizer/runtime overhead; this is a separate download from the approximately 40 MB meaning-search model. Actual transfer and working memory depend on caching and device. The model handles one complete document at a time within a checked 512-token prompt budget. Oversized context is rejected, never silently truncated.

Questions and context stay in memory on the device. No account, inference API, backend, paid service, or persistent conversation is involved. Requests for pinned public model files omit credentials and referrers. Stop terminates answer work; errors and unsupported output leave original evidence available. Cache removal deletes this answer model's own cache, without deleting the embedding-model cache. A new question or topic invalidates an earlier answer.

Run the separate checks using Node 24 after a site build:

```sh
npm run test:rag
npm run test:rag:browser
TEST_RAG_MODEL=1 npm run test:rag:browser
npm run experiment:rag
```

The first two commands are model-free. The explicit `TEST_RAG_MODEL=1` run exercises the actual browser model; `experiment:rag` runs native CPU screening and may download the pinned weights. Default build/test workflows do not download models.

The native supplied-evidence screening matched the exact expected source set on 18/20 cases: 12/14 answerable and 6/6 unsupported, with five unsupported cases rejected by application preflight before inference. It selected no unrelated sources in that small set. It missed dated adoption evidence and one side of an employer/founder comparison; incomplete comparisons now fall back to the original evidence. These are development screening results, not general answer accuracy, browser results, or physical-phone measurements. Browser and fresh-question evidence belongs in the dated [verification record](docs/verification.md) once completed. The feature remains experimental while those checks are in progress.

Source identity and exact text are enforced; relevance and completeness still require evaluation. The [RAG contract](docs/rag-prd.md), [architecture](docs/architecture.md), and [learning guide](docs/ai-search-learning.md) explain those boundaries. Production release remains a separate checkpoint.

The final browser selection measurement is **14/20 screening cases and 4/8 fresh cases**, compared with native CPU results of 18/20 and 6/8. The experimental pipeline works end to end, but model-quality promotion remains pending. See [the reviewed RAG record](experiments/rag/README.md) for misses, cache measurements, and reproduction commands.

## Visual review and development handoff

The 17 November polish keeps the spectral identity while emphasizing engineering evidence. Nielsen is the featured employer case; independent products are compact supporting projects. Case studies use readable prose, explicit role/scope notes, and accurate workflow diagrams. The GitHub calendar supports the story after experience and biography.

Ask puts the question and original evidence first. Its first complete matching passage is immediately visible with an exact source link; all matching context remains available. Model choices stay separate and explicit after the results, with cancellation and fallback unchanged. The answer selector remains experimental.

See [the design review](docs/design-polish.md) for before/after evidence, implementation decisions, and the screenshot command. With the production preview running, `node scripts/capture-design.mjs after` captures desktop/mobile routes and Ask states without enabling a model. Artifacts stay local and ignored. [Verification](docs/verification.md) and [checkpoint history](docs/release-checkpoints.md) record what passed and how to revisit each phase. Changes remain on `pilot`; release PR CI, merge, and exact-commit hosted verification remain launch steps.
