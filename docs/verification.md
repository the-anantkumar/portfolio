# Verification | 3 November 2026

## Build and static checks

- Astro/TypeScript: zero errors, warnings, or hints.
- Six HTML pages generated: homepage, four case studies, and custom 404.
- Internal links and section anchors pass the build validator.
- Exactly one main heading per page; no application scripts in the output.
- Homepage HTML: approximately 5.0 KB gzip; shared CSS: approximately 7.0 KB gzip.
- Whole generated site, including the 1200 × 630 social preview JPEG: approximately 175 KB uncompressed.
- Application JavaScript: 0 bytes.
- Dependency audit after compatible transitive updates: zero known vulnerabilities reported. This is an advisory snapshot, not a guarantee of future security.
- `.codex/` is ignored; the raw resume is not tracked or copied to the output. Known private markers and unapproved claims are checked during the build.

## Browser checks

Playwright 1.64.1 using installed Chromium in headless mode, against the local production preview:

- Homepage at 1440, 390, and 320 CSS pixels: no horizontal overflow or browser runtime errors.
- All four case studies load directly and pass mobile overflow checks.
- Unknown path returns the custom 404 with HTTP 404.
- One header and footer; skip link receives focus and moves keyboard focus to main content.
- Case-study navigation works with JavaScript disabled.
- Reduced-motion preference used in layout checks.
- axe WCAG 2 A/AA and 2.1 AA checks: zero violations on tested routes and viewports.
- Desktop homepage, mobile homepage, and mobile trlr case study visually inspected. CSS artwork is deliberately illustrative.

## Lighthouse lab measurement

Local mobile Lighthouse run on the production preview:

| Category | Score |
| --- | --- |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |

First contentful paint and largest contentful paint: approximately 0.8 seconds. Cumulative layout shift: 0. These are local laboratory measurements, not real-user field metrics or a promise about every device/network. The remaining diagnostic notes concern the single render-blocking stylesheet; it is approximately 7.4 KB compressed.

An experimental accessible-name diagnostic was corrected by removing redundant labels and keeping decorative artwork outside links. The final run no longer reports it.

## Reproduction and limits

Run `npm run check` and `npm run build` using Node 24. The committed build validator is dependency-free. Browser audits used temporary developer tools outside the application dependency tree; local reports and screenshots are in ignored `artifacts/`.

The in-app browser preview host was unavailable, so automated Chromium screenshots provided visual verification. Cloudflare has not been configured or deployed. Hosted headers, real-domain canonical URLs, redirects, caching, and public availability require validation after deployment. No backend or paid inference was invoked.

## Spectral design and GitHub reveal iteration

- Dark indigo/pink/violet surfaces, CSS gradient backgrounds, original prism artwork, and slow rotating rings replace the paper-like layout.
- Header pause checkbox pauses both rings and background movement. Reduced-motion emulation disables animation; verified in Chromium.
- Real public GitHub calendar snapshot: 367 dates and 266 contributions shown, fetched 3 November 2026. No private repository events or names stored.
- Calendar SVG is a local lazy-loaded static asset. Browser tests confirmed no calendar request until reveal and no third-party page requests.
- Reveal and case-study navigation work with JavaScript disabled; mobile calendar initially shows the most recent dates, with horizontal scrolling.
- CSV contains all 367 dates plus a header. Build checks ensure the calendar cells, CSV rows, and aggregate count agree with the snapshot.
- A deliberately invalid calendar response was rejected and the saved snapshot remained byte-for-byte unchanged.
- All eight supplied Nielsen highlights are included, preserving parallel-run scope, checked mappings, the QA connection exception, investigation status, and pending implementation/testing.
- Final desktop/mobile/reveal axe checks report zero WCAG A/AA violations. Final Lighthouse reports 100 in all four categories, 0.8s FCP/LCP, and zero CLS. The earlier DOM-size diagnostic was eliminated by using a lazy-loaded SVG instead of putting the full calendar/data table into the page DOM.
- Local preview remains running at the user's request. Hosting has not been deployed.

## Embedded GitHub section (supersedes the collapsed reveal)

- The calendar is visible by default at `#github`; hero and contact GitHub links scroll there instead of opening GitHub.
- Four verified public repositories are embedded with reviewed summaries, languages, actual star/fork counts, and native expandable overviews. Selection is editorial, not a popularity ranking.
- Build checks reject private repository entries and external GitHub navigation on the homepage.
- Desktop (1440px) and mobile (390px, 320px) checks confirm in-page navigation, visible heatmap, four cards, working overview expansion, and no external links within the GitHub section.
- Browsing the calendar and opening repository overviews works with JavaScript disabled.
- No third-party visitor requests or browser errors. All tested routes remain free of axe WCAG A/AA violations.
- Final Lighthouse remains 100 in performance, accessibility, best practices, and SEO, with 0.8s FCP/LCP and zero CLS.
- The calendar and repository metadata are dated snapshots. New repository metadata is refreshed only by the maintainer command, not a visitor-triggered API request.

## Repository information removed

At the owner's request, all repository cards, per-repository statistics, metadata, and repository-refresh code were removed. The section now shows only the embedded contribution calendar and two aggregate metrics. Type checking and build checks pass; targeted no-JavaScript browser checks at 1440, 390, and 320px confirm a visible heatmap, no repository information, and no horizontal overflow. The last full Lighthouse/axe audit above predates this removal.

At this checkpoint, the heatmap was manual: `npm run refresh:github` refreshed the saved calendar and `npm run build` regenerated the displayed asset. The automation iteration below supersedes that behavior after remote activation.

## Phased commits, punctuation, and automated refresh

- Saved the complete static portfolio as a baseline commit, then isolated the punctuation cleanup and refresh automation in separate commits.
- Removed em dashes from public content, date ranges, page titles, and documentation. The generated HTML check also rejects literal and HTML-encoded em dashes.
- All 18 offline refresh tests pass. They cover exact parsing, missing/invalid data, duplicate and discontinuous dates, partial calendars, unchanged snapshots, changed counts, calendar rollover, stale calendars, network/HTTP/body failures, and local HTML input.
- A real public GitHub fetch succeeded and returned an unchanged calendar. The script preserved the existing snapshot and did not manufacture an update.
- Workflow YAML parses without duplicate keys. Its six-hour schedule, default-branch activation, `pilot` checkout/write target, pinned actions, minimal permissions, public-repository condition, no-change exit, build gate, and non-force push were reviewed locally. A hosted Actions run has not occurred.
- Astro checks: zero errors, warnings, or hints. Build and test commands pass, including internal links, calendar/CSV consistency, punctuation, privacy boundaries, and size budgets. The complete output is approximately 176 KB with zero application JavaScript.
- Chromium checks with JavaScript disabled pass at 1440, 390, and 320px: heatmap visible, two aggregate metrics, no repository cards, and no horizontal overflow.
- SVG/CSV cache revalidation headers are included for Cloudflare. Local preview does not apply them; confirm after hosting is connected. No remote workflow activation or deployment is claimed.

## GitHub Pages release preparation

This release replaces the planned Cloudflare deployment with GitHub Pages and moves production to `main`. The earlier notes above record local checkpoints; the current hosting contract is in [deployment.md](deployment.md).

- Node 24 type checks pass with no errors, warnings, or hints. Both root-path local builds and `/portfolio/` production builds pass publication/link/size validation.
- All 18 calendar tests pass. Production output is approximately 180 KB, with zero application JavaScript.
- The committed Chromium suite passes at 1440, 390, and 320px, including all case studies, no-JavaScript navigation, heatmap asset loading, reduced motion, keyboard skip access, animation pause, custom 404 recovery, and axe WCAG A/AA checks.
- The pause test checks the glows and rings with active CSS animations; decorative stationary rings are excluded. This corrected a test assertion rather than changing the visual behavior.
- `actionlint` 1.7.12 validates the workflow. Its binary was checked against the official release digest before use. Dependency installation reports no known vulnerabilities at this checkpoint.
- Root and production builds verify document CSP, base-prefixed links, canonical/social URLs, the sitemap, and a source revision marker. GitHub Pages controls actual response headers and CDN caching; the optional Cloudflare headers are not part of this host's guarantee.
- Remote CI and publication use the same committed checks, plus `test:hosted` against the exact released revision. The [workflow history](https://github.com/the-anantkumar/portfolio/actions/workflows/portfolio.yml) is the source of evidence for each deployed revision.

## Public release and automation verified

Verified on 3 November 2026:

- [PR #33](https://github.com/the-anantkumar/portfolio/pull/33) merged into `main` as `6fce220b97711fb49c63dbb03c151c230b8ef4ce`, preserving all phased commits. The 13 release-preparation commits each contain one to three changed files.
- [PR CI](https://github.com/the-anantkumar/portfolio/actions/runs/41684947722) passed the type, build, unit, browser, and accessibility checks before merge.
- [First production run](https://github.com/the-anantkumar/portfolio/actions/runs/41685255545) deployed the site and passed its public-release checks. The site is available at https://the-anantkumar.github.io/portfolio/ with HTTPS enforced. The Pages environment permits deployments from `main` only.
- The workflow is active on `main`, including its six-hour schedule. A [manual refresh run](https://github.com/the-anantkumar/portfolio/actions/runs/41685324762) exercised a real data change: 266 to 284 contributions across 367 calendar dates.
- That run created bot commit `68b4637e99e3bc3e7379fd7b7becae1fba2bd06b`, changing only `src/data/github.json`. Its validation and deployment jobs both passed, including the check that the public revision marker matched the refreshed source commit and that calendar/CSV assets matched the verified build.
- The committed browser suite also passed directly against the live HTTPS site: all case studies, 1440/390/320px layouts, no-JavaScript navigation, loaded heatmap, reduced motion, keyboard skip access, pause control, custom 404 recovery, and axe WCAG A/AA checks. Local screenshots remain in ignored `artifacts/hosted/`.
- GitHub Pages uses the Actions publishing source. No Cloudflare account, purchased domain, paid plan, custom service secret, or paid API was provisioned. Hosting-specific response/cache limitations remain documented in the deployment runbook.

These links record the initial production verification. Later runs identify their own source revision through `release.json` and repeat the automated checks. A scheduled trigger has been enabled; this verification does not claim to have waited for the next six-hour scheduled execution.

## Optional on-device search, 7 November 2026

This checkpoint was validated locally on `pilot`, not as a new production release. Its source is marked by `checkpoint/ai-search-v1-2026-11-07`; see the [resume note](release-checkpoints.md#resume-checkpoint). No backend, account, paid resource, model API, or deployment was created.

- Node 24.22.2: `npm run check`, production-path `npm run build`, and `npm test` pass. All 18 calendar tests remain passing. `npm audit` reports no known vulnerabilities at this checkpoint.
- The index command was exercised end to end. It embeds 38 public passages and 74 public test questions with the pinned q8 model. The longest passage input is 153 tokens. Normal builds verify the saved index and do not download model weights.
- On 43 development questions, top-three evidence recall is 39/43 for word matching and 42/43 for hybrid search. Both modes pass 3/3 scope checks and 22/22 unsupported/privacy examples. On 6 separately authored challenge questions, recall is 0/6 and 3/6 respectively. Those challenges informed debugging and now form regression examples, not held-out validation. The [learning guide](ai-search-learning.md) records misses and interpretation limits.
- The committed browser suite passes at 1440, 390, and 320px, including ordinary script-free pages, Ask with JavaScript disabled, reduced motion, keyboard navigation, results focus, all suggested questions, source links, axe WCAG A/AA checks, and no model requests before opt-in. Mocked cancellation, failure, and corpus retry preserve word matching.
- `TEST_AI_MODEL=1 npm run test:browser` passes real browser inference, immutable model-path checks, and cached weight reload. Desktop Chromium at a 390px viewport measured 4,355 ms cold readiness, 131 ms first question, 58 ms subsequent question, and 209 ms cached model reload. These are individual local samples, not physical-phone measurements. Approximately 37.6 MB of reported cold response bodies excludes an unreported worker body; the UI discloses about 40 MB. Cached reload did not refetch Hugging Face weights but did re-serve local WebAssembly.
- Ordinary output is 187,627 bytes. Homepage HTML/CSS is 12,303 bytes gzip; initial Ask HTML/CSS/script/corpus is 22,475 bytes gzip. Optional JavaScript is 142,814 bytes gzip, WebAssembly 14,264,838 bytes, and passage vectors 137,995 bytes. Complete static output, including upstream notices, is 15,491,762 bytes. Separate budgets preserve ordinary-page performance.
- Screenshots under ignored `artifacts/ask-browser/` were visually inspected. No raw resumes, private documents, query logs, or model caches enter Git or the build. The public corpus uses the same source content as the visible portfolio.

Hosted verification was extended to cover Ask and its static search data, but was not run against a new public release in this checkpoint. Physical-phone inference and broader unseen-question evaluation remain future work.

## Search quality iteration, 15 November 2026

Development resumed from `checkpoint/ai-search-v1-2026-11-07` on `pilot`. Merge `271f2c9` incorporated newer contribution snapshots from `origin/main`. No production merge, deployment, account, model API, or paid resource was created.

- Node 24.22.2: `npm run check`, production-path `npm run build`, and `npm test` pass. The 18 calendar tests still pass. Index regeneration was exercised with 38 public passages and 90 public questions; the longest passage remains 153 tokens. The model and weights are unchanged; query preprocessing is now version 2.
- The 16 reserved questions and their public vectors were committed in `e7be182` before ranking changes. Their initial evaluation followed a ranking freeze. A subsequent fix addressed an existing browser regression after those results were visible, so final results are repeatable regression evidence, not a fully blind benchmark. The reserved set was not used to tune that follow-up fix.
- Native CPU hybrid retrieval passes 43/43 development and 6/6 original challenge answerable cases; word matching passes 40/43 and 1/6. The reserved answerable results are 8/8 and 3/8 respectively. Both modes pass 5/5 scope and 28/28 unsupported/privacy checks across both suites. Two multi-source cases require both the product hypothesis and its outcome. Hybrid returns both; word matching abstains, without returning a partial bundle.
- A real-browser diagnostic found a quantization difference: cosine agreement between one native and browser question vector was about 0.992, while its leading source score shifted from about 0.409 to 0.390. A bounded fallback for two leading sections from the same source resolved the browser failure without lowering the global threshold. This source-group rule remains a heuristic, not a confidence measure.
- `TEST_AI_MODEL=1 npm run test:browser` passes all 90 questions through the actual WASM worker: 57/57 answerable, 5/5 scope, and 28/28 unsupported cases, with original passage text, source identity, employer scope, and completeness checks. Ordinary pages remain script-free. The 1440/390/320px, no-JavaScript, reduced-motion, keyboard, axe, opt-in, cancellation, failure, retry, and cached-weight checks all pass. No-match help focuses the download disclosure without starting the model; editing a question hides old results.
- On desktop Chromium at a 390px viewport, cold model readiness measured 3,350 ms, the first question 141 ms, a subsequent question 48 ms, and cached model reload 310 ms. Reported cold response bodies were about 37.6 MB, excluding an unreported worker body. These are individual desktop samples; physical-phone measurements remain outstanding. The local test server re-serves WASM on reload, so cached weights do not imply zero transfer.
- Ordinary output is 186,919 bytes. Homepage initial HTML/CSS is 12,305 bytes gzip; Ask initial HTML/CSS/script/corpus is 23,206 bytes gzip. Optional runtime JavaScript is 142,901 bytes gzip, WASM 14,264,838 bytes, and passage vectors 138,012 bytes. Complete output is 15,493,192 bytes. All separate budgets pass. Screenshots in ignored `artifacts/resume-2026-11-15/browser/` were visually inspected.

The four original hybrid misses are now regression successes, but top-three evidence recall does not establish that every returned passage is relevant. Physical-phone inference, fresh unseen-question evaluation before further tuning, PR CI, and exact-commit hosted verification remain release tasks. The [learning guide](ai-search-learning.md#november-15-improve-the-evidence-before-changing-the-model) explains the changes and limitations.

## Portfolio navigator 15 November 2026

The [navigator PRD](portfolio-navigator-prd.md) was recorded before implementation and reviewed against the existing cost, public-content, accessibility, and performance constraints. The implemented scope is topic navigation and evidence presentation on `pilot`; no production merge or deployment occurred.

- Node 24.22.2: type checks pass without diagnostics. Production-path build and `npm test` pass, including 18 calendar tests, both retrieval suites, four navigator tests, and publication/size checks. Public source content, retrieval rules, embedding data, and the pinned model remain unchanged.
- Six topic controls select validated public passages. Source cards use summaries and roles from typed public collections; full original evidence is collapsed in native disclosures. Nielsen experience and case-study evidence share one employer card. Founder work stays separate. Guided follow-ups retain both the trlr product hypothesis and current outcome.
- The browser suite passes all routes at 1440/390/320px, no-JavaScript browse navigation, keyboard disclosures and focus, axe WCAG A/AA checks, reduced motion, and the ring pause control. It verifies topic selection, contextual follow-ups, grouped evidence, initially collapsed AI controls, deliberate opt-in, no-match help, cancellation, failure, and retry. Controlled slow-response scenarios prove that the latest typed question or topic survives an earlier pending action.
- The explicit real-model browser run passes the existing 90-question contract after presentation changes: 57/57 answerable, 5/5 scope, and 28/28 unsupported cases. It checks original passage text and source identity within collapsed disclosures, and guided exploration while the model is enabled. These are regression results, not general answer accuracy.
- Desktop Chromium at a 390px viewport measured cold readiness at 3,369 ms, the first question at 123 ms, a later question at 52 ms, and cached model reload at 312 ms. Reported cold response bodies were about 37.6 MB with the worker body unreported. These are individual desktop samples, not physical-phone measurements; cached weights still do not imply zero network transfer.
- Initial Ask HTML/CSS/bootstrap/corpus is 27,431 bytes gzip; bootstrap JavaScript is 7,897 bytes gzip. Ordinary output stays at 186,919 bytes. Optional runtime JS is 142,901 bytes gzip, WASM 14,264,838 bytes, vectors 138,012 bytes, and complete output 15,510,988 bytes. All documented caps pass, with no new dependency or runtime service.
- Screenshots under ignored `artifacts/navigator/` were visually inspected for landing, grouped results, the project grid, and complete founder evaluation at desktop and mobile widths. A 320px decorative-ring overflow was fixed before the passing run.

Physical-phone inference, release PR CI, and exact-commit hosted verification remain production-release tasks. The local navigator does not generate prose or implement open-ended conversation memory.

## Learning lab and generation screening, 15 November 2026

Development continued on `pilot` from `checkpoint/portfolio-navigator-v1-2026-11-15`. The learning lab and model experiment are local developer tools, outside the published routes and `dist/`. No production merge, deployment, account, paid model API, new dependency, or private corpus was introduced.

- Node 24.22.2: `npm run check` reports zero errors, warnings, or hints. Generated ignored artifacts are excluded from TypeScript checking. Production-path `npm run build` and `npm test` pass, including 18 calendar tests, both retrieval suites (90 questions in total), four navigator tests, five offline generation-contract tests, and publication/size validation. No model was downloaded by these commands.
- The default `npm run test:browser` passes all public routes, 1440/390/320px layouts, no-JavaScript navigation, reduced motion, keyboard access, heatmap, axe, search privacy, lazy model loading, cancellation, and recovery. Public source content, retrieval rules, passage/question vectors, and the embedding worker are unchanged, so the previous real-model 90-question run remains the applicable inference record; it was not repeated in this phase.
- `npm run test:learn` validates 14 component entries and six saved word/hybrid traces against the current public corpus and committed vector hashes. Chromium checks pass at 1440/390/320px with reduced motion, no overflow or page errors, zero axe WCAG A/AA violations, keyboard activation/focus, complete product outcome evidence, and unsupported private-detail handling. The standalone document makes zero HTTP requests while opened and explored. A script-disabled browser has a visible Markdown study link.
- Review markers begin unchecked. The test explicitly marks one component, reloads, and verifies that local storage contains only its component ID. These isolated test-browser markers do not mark the owner's actual browser as reviewed. The lab persists no questions or conversations. The lab and source/failure-card screenshots under ignored `artifacts/learning/screenshots/` were visually inspected at desktop and mobile sizes.
- An explicit local screening used `HuggingFaceTB/SmolLM2-135M-Instruct` q8 at revision `12fd25f77366fa6b3b4b768ec3050bf629380bac`, prompt version 1. Relevant complete public passages were supplied directly to isolate generation quality. Native CPU and actual browser WASM completed all eight fixed cases, with 0/8 automated passes in each. Manual review rejected all eight in each runtime for citation, scope, source-fidelity, or abstention failures. Examples included false completion, a reversed validation finding, repetition, and invented details. These are screening results, not general model accuracy.
- Chromium 153.0.8010.12 on macOS ARM64 at a 390px desktop viewport reported 152,141,935 response-body bytes, 7,165 ms initialization, and 9,569 ms initialization plus first answer. Later generation samples took 1,514 to 6,210 ms. No question text or request body was transmitted; Hugging Face paths stayed pinned. Physical-phone behavior and browser memory were not measured. Native process RSS was 1,241,694,208 bytes after the run, including Node/runtime overhead. See [the safe reviewed summary](../experiments/generation/results-summary.json) for exact per-case measurements and limitations.
- Decision: the candidate is not promoted into `/ask/`. Model downloads remain explicit experiment commands; routine CI tests only the model-free contract and learning lab. The public navigator still returns original evidence rather than generated prose. Raw answers and caches remain ignored, and invented sensitive values are excluded from the committed record.
- Published budgets remain unchanged: ordinary output 186,919 bytes; initial homepage 12,305 bytes gzip; initial Ask 27,431 bytes gzip; bootstrap 7,897 bytes gzip; optional runtime JS 142,901 bytes gzip; WASM 14,264,838 bytes; vectors 138,012 bytes; total output 15,510,988 bytes. The local lab stays below its separate 300 KB standalone cap. CI retains public-repository/free-runner guards and exact-commit artifact verification. The added CI step has been reproduced locally; remote PR CI has not run on this checkpoint.

Before another model or prompt iteration, freeze new questions before tuning and revisit phone/download budgets. Physical-phone inference, release PR CI, and exact-commit hosted verification remain production-release tasks. The [learning tracker](learning-tracker.md) is the maintained component study path.

## Experimental RAG and minimal frontend, 17 November 2026

The full local extractive RAG path is implemented on `pilot`: typed question → public retrieval → immutable context → opt-in FLAN worker → strict binary decisions → source validation → original quotations/canonical citations or evidence fallback. Ordinary pages remain script-free. The revised Ask interface uses a focused question surface, quieter disclosures, continuous source sections, and expandable additional answer sources.

- Node 24.22.2: type checks report zero errors/warnings/hints. Production-path build and `npm test` pass, covering the existing calendar/retrieval/navigator suites plus five original generation-contract and twelve RAG-contract checks. Public content changes were followed by `npm run index:search`; hashes and committed vectors match.
- Default public browser checks and the new model-free RAG suite pass at 1440/390/320 px, with no overflow, keyboard operation, reduced motion, no-JavaScript browse links, and zero axe WCAG A/AA violations. The RAG suite verifies source text/role/URL identity, opt-in, malformed output, abstention, unsupported preflight, retries, edit/topic races, download/inference cancellation, cache deletion scoped to its own name, and keyboard opening of additional quotations.
- `TEST_RAG_MODEL=1 npm run test:rag:browser` completed actual UI retrieval → model → rendered citations, cached reload, actual inference cancellation, and all 28 supplied-source cases. No question text or body was transmitted; model requests remained revision-pinned. This execution completion is distinct from quality acceptance.
- FLAN-base native exact source selections were 18/20 screening and 6/8 fresh cases. Browser results were 14/20 and 4/8. Nine browser mismatches abstained; one fresh answer included an additional irrelevant migration source. Complete quoted text remained unchanged. The eight fresh questions were frozen in `3c 0e 676` and were not used for prompt tuning. An overly broad application comparison guard was corrected based on a known screening case before the final browser run. This is small-sample evaluation, not general accuracy.
- Desktop Chromium 153.0.8010.12 at 390 px measured cold readiness 10,227 ms, complete first UI answer 11,778 ms, and 290,404,901 response-body bytes. Cached readiness was 716 ms with 14,289,219 additional runtime bytes. Cache inspection found both pinned weights and tokenizer/config files (277,668,184 bytes according to their headers). Supported fixed-case decisions took about 1–1.7 seconds. These are individual desktop samples, not physical-phone measurements. The explicit run used no inference service or account.
- Earlier Qwen prose failed 0/8; final Qwen source selection scored 6/20 in both native/browser runs. FLAN-small reached 13/20 native. The safe [result summary](../experiments/rag/results-summary.json) records the chosen configuration and reviewed outcomes; raw invented prose and caches stay ignored. FLAN remains experimental, with production model acceptance pending.
- Build budgets pass: ordinary output 187,051 bytes; homepage initial 12,305 gzip; Ask initial 31,238 gzip; bootstrap 10,949 gzip; combined optional JS 281,469 gzip across independently budgeted search/answer workers (each 250 KB ceiling, combined 500 KB). WASM remains 14,264,838 bytes, vectors 138,007 bytes, complete output 16,026,789 bytes within 17 MB. Answer weights remain off-site until explicit opt-in, with about 300 MB disclosed first-use transfer.
- The learning lab maps 17 components and replays 28 safe saved RAG decisions alongside six retrieval examples. Its offline/mobile/keyboard/owner-review/no-JavaScript-link/axe checks pass. Screenshots in ignored `artifacts/rag/screenshots/` and `artifacts/learning/screenshots/` were visually inspected. No production merge or deployment occurred. Remote PR CI, physical-phone inference, model-quality promotion, and exact-commit hosted verification remain pending.

## Editorial portfolio and evidence-first Ask, 17 November 2026

Scope: presentation, content hierarchy, existing interaction states, and a public heading correction on `pilot`. No retrieval algorithm, model pin, inference service, deployment workflow, or contact boundary changed. Model-quality promotion remains a separate decision.

The screenshot-based review and implementation map are in [design-polish.md](design-polish.md). The in-app browser was unavailable; the repository's installed Chromium setup exercised the actual production-path build. Before captures preceded the source rebuild. Final after captures cover 1440 × 1000, 390 × 844, and 320 × 844. Full-page captures explicitly load the lazy calendar first. The before manifest records the replacement of initially blank full-page calendar captures with accepted images from the earlier browser suite.

Visitor journey checked:

1. Homepage introduction and featured Nielsen work, compact founder/independent projects, Ask entry, and supporting GitHub calendar.
2. All four case studies, scope/role attribution, public workflow diagrams, desktop contents links, mobile disclosure, and original section anchors.
3. Ask entry with three examples, native topic disclosure, immediate complete evidence, exact source navigation, full context, and guided follow-ups.
4. No-match feedback, keyboard focus, independent model disclosures, loading/cancellation/failure fallback, stale response rejection, and cache-removal behavior.

The question field moved from 611 to 425 px down the desktop page and from 471 to 375 px on mobile in matched capture viewports. These are layout measurements, not user-study or conversion results. The desktop/mobile screenshots were inspected; 320 px checks verify wrapping without horizontal overflow. No physical phone was used.

Commands and outcomes:

- Node 24.22.2, `npm run check`: 54 files, zero errors, warnings, or hints.
- `SITE_URL=https://the-anantkumar.github.io SITE_BASE=/portfolio npm run build`: all 7 routes, internal links/anchors, document policies, punctuation, publication boundaries, committed-vector integrity, and budgets passed. Ordinary pages remain script-free.
- `npm run index:search`: regenerated 38 public passage vectors after changing “Future search” to “Search today and next.” The old fragment remains an alias, and the guided selection and evaluation reference use the current source ID. Query-vector files remained unchanged.
- `npm test`: calendar refresh, word/hybrid retrieval suites, navigator, generation contract, RAG source validation, and built-output gates passed. The lexical baseline retains its documented misses; passing the gate is not perfect lexical recall.
- `npm run test:browser`: routes at 1440/390/320 px, no-JavaScript browsing, case contents keyboard traversal, reduced motion, pause control, calendar, 404, axe checks, first-screen form, visible complete source previews, source navigation, topics/follow-ups, query privacy, lazy model loading, cancellation, and recovery passed.
- `npm run test:rag:browser`: model-independent answer lifecycle, exact quotations/citations, cancellation, stale work, errors, and scoped cache removal passed. The FLAN model was not re-benchmarked by this design pass.
- `TEST_AI_MODEL=1 npm run test:browser`: actual pinned embedding model passed all 90 labeled questions in browser WASM. Search set: 49/49 answerable, 3/3 scope, 22/22 unsupported; reserved set: 8/8 answerable, 2/2 scope, 6/6 unsupported. No reported misses. Chromium desktop with a 390 px viewport, not a physical-phone measurement.
- Actual embedding run: 2,884 ms model load, 115 ms first query, 54 ms warm query, 314 ms cached reload, 37,619,090 cold model response-body bytes. These are one local run, not performance guarantees.
- `npm run test:learn`: 18 components, six current retrieval traces, all 28 historical RAG cases, exact misses, owner-controlled review markers, keyboard, offline/no-JavaScript path, three viewports, and axe passed.
- `git diff --check`: clean.

Final production-path build budget results:

| Artifact | Measured bytes | Existing limit |
| --- | ---: | ---: |
| Homepage initial compressed HTML + CSS | 10,330 | 300,000 |
| Ask initial compressed HTML + CSS + bootstrap + corpus | 28,596 | 60,000 |
| Ask bootstrap, compressed | 11,089 | 20,000 |
| Ordinary output | 190,298 | 300,000 |
| Combined optional model runtime, compressed | 281,469 | 500,000 |
| Self-hosted WASM | 14,264,838 | 16,000,000 |
| Public vectors | 138,018 | 200,000 |
| Complete output | 16,033,614 | 17,000,000 |

The homepage initial transfer fell from 12,305 to 10,330 compressed bytes. No new dependencies, remote fonts, image service, backend, analytics, or paid resource were introduced. Motion now uses one 520 px ambient glow and one slow decorative ring; pause/reduced-motion checks verify their controls, not a device-independent frame-rate guarantee.

Historical RAG replay now reads `experiments/rag/corpus-2026-11-17.json`, whose hash equals the original recorded experiment hash. Current search traces still validate against the current corpus and vectors. The earlier measured RAG results remain unchanged: browser 14/20 screening and 4/8 fresh cases, with model acceptance and physical-phone inference pending.

Local screenshot manifests and logs are under ignored `artifacts/design-polish/`. They are not published with the portfolio. Release remains pending: PR CI, owner-approved merge to `main`, and exact-commit hosted verification. No production deployment was performed.
