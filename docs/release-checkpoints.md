# Release checkpoints

The GitHub Pages release is split by concern into small commits. These are ordered checkpoints; later changes may depend on earlier ones. The main release uses a merge commit so these individual commits remain visible.

| Commit | Concern | Changed files |
| --- | --- | --- |
| `dd84c60` | Configurable hosting base and shared path helper | 2 |
| `af18a97` | Shared layout, metadata, and document policies | 1 |
| `37355bb` | Home, case-study, and 404 navigation | 3 |
| `98139eb` | Calendar assets, sitemap, and robots URLs | 3 |
| `b6cb400` | Build publication checks and source revision marker | 3 |
| `2aea769` | Pinned browser/accessibility test dependencies | 2 |
| `ff15c19` | Reproducible responsive/accessibility browser checks | 2 |
| `c986657` | Exact public-release verification | 2 |
| `07eadcc` | CI, deployment, and scheduled refresh workflow | 2 |
| `780c64e` | Public portfolio delivery description | 1 |
| `703ad2b` | README, architecture, and contributor instructions | 3 |
| `541c6d8` | Deployment and calendar operations runbooks | 2 |

Earlier checkpoints remain unchanged: `fc98912` contains the original complete portfolio, `5abdade` removes em dashes, and `07c6136` introduces the initial calendar automation. This release improves commit granularity without rewriting that existing history.

Use `git show <commit>` to inspect a specific concern. To explore an older state without disturbing development, create a detached worktree at the desired commit. For production rollback, revert the appropriate commit through a PR and run the normal checks; do not reset or force-push `main`. Review dependencies before reverting a foundational helper, package change, or workflow. See [deployment recovery](deployment.md#recovery-and-rollback).

## Optional search on pilot

The 7 November 2026 implementation is recorded on `pilot` in the following ordered checkpoints. Each changes one to three files. Foundational and integration commits depend on one another; these are review and backtracking boundaries, not a claim that every intermediate commit is a separately deployable release. The completed set passed the checks recorded in [verification](verification.md#optional-on-device-search-7-november-2026). It has not been merged into `main` or deployed.

| Commit | Concern | Changed files |
| --- | --- | --- |
| `47a29c5` | build: pin browser embedding dependencies | 2 |
| `656cbe8` | feat: build a public-only knowledge corpus | 3 |
| `e38a69b` | feat: rank sourced passages with scope-aware retrieval | 2 |
| `cce9483` | feat: pin and regenerate semantic search embeddings | 2 |
| `738d204` | test: preserve retrieval questions and model vectors | 2 |
| `93fe2b4` | test: evaluate retrieval and reject stale search data | 2 |
| `402c173` | docs: retain inference runtime license texts | 3 |
| `a398ca8` | docs: identify model licenses and portable document policies | 2 |
| `a262f02` | feat: run pinned embeddings in an opt-in worker | 2 |
| `c992471` | feat: add cancellable search controls and responsive styling | 2 |
| `9b47b39` | content: describe optional search and save public passage vectors | 2 |
| `a34d4d6` | feat: expose the isolated Ask route and verified vector data | 3 |
| `8e64627` | style: connect Ask navigation across screen sizes | 3 |
| `4d18a79` | test: enforce isolated AI performance and publication budgets | 1 |
| `7d4d977` | test: verify Ask accessibility recovery and real model inference | 1 |
| `b82799c` | test: verify hosted search assets against the release | 1 |
| `7a07390` | docs: teach embeddings retrieval and evaluation | 2 |
| `b9e297a` | docs: document search setup and deployment boundaries | 3 |
| `4bde7a0` | docs: record local AI search validation and limitations | 1 |

## Resume checkpoint

Annotated tag: `checkpoint/ai-search-v1-2026-11-07`. Development branch: `pilot`. The implementation and its validation record are complete for this checkpoint; further development is deferred at the owner's request. The tag includes this handoff note and the existing small commits, without squashing or rewriting them.

Start with [the AI learning guide](ai-search-learning.md) and [the validation record](verification.md#optional-on-device-search-7-november-2026). Use Node 24. Public content and evaluation questions have matching committed vectors; ordinary builds do not need a model download.

When work resumes:

1. Measure inference on a physical phone, including the initial download, cached reload, cancellation, and fallback.
2. Write fresh held-out questions before tuning retrieval. Investigate the four documented hybrid-search misses and retain existing scope and privacy checks.
3. When ready for release, open the `pilot` to `main` PR, run CI, and complete exact-commit hosted verification after deployment. Production release remains pending.

## Search quality checkpoint, 15 November 2026

Annotated tag: `checkpoint/ai-search-v2-2026-11-15`. Branch: `pilot`. This resumes the November 7 checkpoint. The original tag and phased history are preserved. Production merge and deployment remain pending.

Merge `271f2c9` first brought the scheduled contribution snapshots from `main` into development. Implementation work then used the following small commits. As before, these are ordered review/backtracking boundaries; dependent intermediate commits are not standalone releases.

| Commit | Concern | Changed files |
| --- | --- | --- |
| `e7be182` | test: freeze fresh portfolio search questions before ranking changes | 3 |
| `f984ba3` | test: measure complete evidence and separate holdout results | 1 |
| `6f18b59` | feat: normalize search context consistently in browser and index | 3 |
| `e10f7fb` | content: label public contact evidence and refresh passage embeddings | 2 |
| `ede21b8` | test: refresh query vectors for the pinned preprocessing version | 2 |
| `ab24077` | fix: retrieve complete product evidence and resolve known search gaps | 3 |
| `5164bdb` | feat: explain search misses and guide optional AI opt-in | 2 |
| `42bb92f` | fix: validate grouped source matching in the actual browser runtime | 2 |
| `e48e655` | test: include the reserved question set in routine search checks | 1 |
| `313e4ec` | docs: teach complete retrieval and browser runtime evaluation | 3 |

The checkpoint also includes this handoff and the [November 15 validation record](verification.md#search-quality-iteration-15-november-2026). All code changes are covered by type, build, retrieval, and browser checks. `npm test` evaluates both question suites using committed vectors; `TEST_AI_MODEL=1 npm run test:browser` runs all 90 questions through the actual browser model.

Next work: measure physical-phone behavior, write a new unseen question set before further ranking changes, and prepare a `pilot` to `main` PR when the feature is ready for release. Generated answers still require their own model, cost, factuality, citation, and performance decision. The current feature retrieves original public passages.

## Portfolio navigator checkpoint

Annotated tag: `checkpoint/portfolio-navigator-v1-2026-11-15`. Branch: `pilot`. The reviewed [PRD](portfolio-navigator-prd.md) is implemented locally: six topics, compact source cards, complete evidence disclosures, contextual follow-ups, and optional model controls. The [verification record](verification.md#portfolio-navigator-15-november-2026) contains the passing checks and measurements. Production release remains pending.

| Commit | Concern | Changed files |
| --- | --- | --- |
| `3795983` | docs: define the portfolio navigator product requirements | 1 |
| `2e95dfd` | feat: define validated public topics and contextual follow-ups | 2 |
| `83a8810` | style: shape the spectral portfolio navigator and topic dock | 1 |
| `edb410f` | feat: connect compact source cards and guided portfolio exploration | 2 |
| `2a35ad5` | test: verify navigator evidence grouping topics and request races | 3 |
| `315169c` | docs: explain navigator scope guided evidence and learning goals | 3 |

The checkpoint also contains the completed PRD acceptance record and this handoff. These are ordered review and backtracking boundaries, not independently deployable intermediate releases. Existing search-quality tags and commits remain intact.

Before production release, measure the model on a physical phone and complete PR CI plus hosted verification. Before adding generated answers or open-ended conversation memory, formulate their own scope and evaluate factuality, citations, download cost, phone performance, and zero-cost operation.

## Learning lab and first generation screen

Annotated tag: `checkpoint/learning-lab-v1-2026-11-15`. Branch: `pilot`. The [learning tracker](learning-tracker.md) now has a local interactive companion, component boundaries, code links, exercises, saved search traces, and manually controlled review markers. The first local generation candidate was evaluated and rejected; it is not a public feature. The [verification record](verification.md#learning-lab-and-generation-screening-15-november-2026) contains the checks, measurements, and limits.

| Commit | Concern | Changed files |
| --- | --- | --- |
| `8a656d6` | Define pinned generation candidate, fixed cases, and promotion gates | 3 |
| `cdc5c3d` | Start the component tracker and native generation screening | 3 |
| `61bb77f` | Isolate the explicit browser experiment interface | 3 |
| `4731320` | Run pinned browser WASM screening and network checks | 2 |
| `c6583af` | Add offline generation contracts and developer commands | 3 |
| `7c3b3f5` | Record reviewed candidate rejection and reproducible measurements | 2 |
| `dcfd04f` | Build the offline component explorer and actual saved retrieval traces | 2 |
| `91a90b8` | Verify the learning lab and add its model-free CI check | 2 |
| `2c33806` | Update learning outcomes and the ongoing tracker maintenance rule | 3 |
| `4ef40c1` | Teach component boundaries and the generation failure lessons | 3 |

The tag also contains this handoff and its dated verification entry. These are ordered review/backtracking boundaries; dependent intermediate commits are not separate deployable releases. All previous checkpoint tags remain intact. No production merge or deployment occurred.

To revisit, use Node 24, run `npm run build`, then `npm run learn`, and open the printed loopback URL. `npm run learn:build` generates the standalone offline document under ignored `artifacts/learning/`. Replay is prepared retrieval evidence, not live inference. Your review markers belong only to your local browser and start unchecked.

Next work: retain the fast evidence navigator, measure the embedding model on a physical phone, and freeze fresh evaluation questions before any further generation candidate or prompt tuning. A candidate must preserve source meaning and pass manual citation/scope review before any visitor integration is proposed. A completed benchmark command does not imply acceptance. Production release still needs PR CI and exact-commit hosted verification.

## End-to-end experimental RAG, 17 November 2026

Final annotated tag: `checkpoint/rag-experimental-v1-2026-11-17`. Branch: `pilot`. The minimal frontend and complete local extractive RAG implementation are built and checked. Model quality remains experimental, with measured misses preserved in [the safe RAG record](../experiments/rag/README.md). No merge to `main` or deployment occurred.

Earlier boundaries are `checkpoint/rag-contract-v1-2026-11-17` (frozen contract/questions) and `checkpoint/rag-pipeline-v1-2026-11-17` (integrated FLAN pipeline before final verification). Each phase changes one to three files. Intermediate commits are dependent review/backtracking boundaries, not separately deployable releases. Prior tags and history remain intact.

| Commit | Concern | Files |
| --- | --- | --- |
| `f840454` | docs: freeze the end-to-end RAG contract and fresh screening cases | 2 |
| `fa709fe` | feat: validate extractive RAG context and source-only answers | 3 |
| `e88f9bd` | experiment: screen a pinned stronger model for grounded prose | 3 |
| `bcf8faa` | experiment: measure structured source selection on frozen questions | 1 |
| `ce1e0ad` | experiment: simplify the selection prompt while preserving rejection checks | 2 |
| `1b64ea4` | feat: connect local RAG generation cancellation and canonical citations | 3 |
| `f89013b` | style: unify the navigator into a minimal spectral reading experience | 2 |
| `8fa2679` | docs: preserve pinned answer model provenance and upstream license | 2 |
| `c587cd7` | test: enforce separate answer runtime and hosted notice budgets | 2 |
| `219b264` | fix: keep answer controls quiet and make cache removal race safe | 2 |
| `f2cd924` | docs: map the complete RAG pipeline and its learning exercises | 3 |
| `3c0e676` | test: freeze fresh RAG questions before browser candidate validation | 1 |
| `7c73f41` | fix: abstain when a comparison omits an ownership group | 3 |
| `6649666` | content: describe the experimental answer path and regenerate public vectors | 2 |
| `24e12d7` | feat: pin the smaller FLAN answer selector and binary prompt | 3 |
| `0dcf173` | feat: generate bounded relevance decisions from complete source passages | 2 |
| `46e3b46` | fix: scope comparison completeness to the roles in the question | 3 |
| `9bd746f` | experiment: retain the rejected Qwen configuration for reproduction | 2 |
| `e0ffb77` | docs: disclose FLAN download cost and experimental source selection | 2 |
| `91d7def` | test: cover RAG lifecycle source integrity and actual browser inference | 3 |
| `1e9e07f` | docs: record measured RAG quality and remaining acceptance limits | 3 |
| `789921d` | docs: teach extractive answers caching and native-browser differences | 3 |
| `46d73c6` | style: disclose additional answer sources without crowding the page | 2 |
| `585586d` | feat: replay every measured RAG decision in the offline learning lab | 3 |
| `25238f4` | test: verify keyboard access to additional cited sources | 1 |
| `2029717` | docs: distinguish completed RAG engineering from model acceptance | 3 |

The final tag also includes this checkpoint inventory. To revisit, use Node 24, build the production path, and run `npm run preview` for `/portfolio/ask/` or `npm run learn` for the offline study map. The lab has 17 components and 28 saved RAG examples; review markers remain owner-controlled. `npm test`, `npm run test:browser`, `npm run test:rag:browser`, and `npm run test:learn` avoid external model downloads. `TEST_RAG_MODEL=1 npm run test:rag:browser` explicitly exercises actual inference.

Completed: interface/lifecycle/source-integrity checks, pinned model integration, supplied-source native/browser measurement, actual retrieval-to-answer UI run, caching/cancellation measurement, documentation, learning replay, and phased commits. Outstanding: model-quality promotion (browser 14/20 screening, 4/8 fresh), physical-phone inference, release PR CI, and exact-commit hosted verification. Do not present the experimental pipeline as production-accepted or a free-form conversational assistant.


## Editorial polish and evidence-first navigation, 17 November 2026

Final annotated tag: `checkpoint/design-polish-v1-2026-11-17`. Branch: `pilot`. Earlier UI boundary: `checkpoint/editorial-ui-v1-2026-11-17` at `e5a8dc7`. The homepage, four case studies, and existing Ask journey have been refined and checked. The implementation remains static and free, with optional models only on Ask. The answer selector remains experimental; no model-quality promotion or production release occurred.

Each implementation commit changes one to three files. Intermediate commits are ordered review/backtracking boundaries and may depend on the next commit, particularly the heading/source-ID update and regenerated vectors. The final tag is the complete checked handoff.

| Commit | Concern | Files |
| --- | --- | --- |
| `a7c8d60` | style: unify typography navigation and restrained spectral motion | 2 |
| `82b19b8` | style: feature production work and clarify the homepage story | 1 |
| `7c9cf4b` | design: replace decorative project panels with public workflow diagrams | 1 |
| `35fe9f2` | style: make case studies readable with clear roles and contents | 2 |
| `319fe8a` | design: lead Ask with complete evidence and secondary model controls | 3 |
| `81caa28` | test: verify evidence previews mobile navigation and model recovery | 2 |
| `e5a8dc7` | test: capture repeatable portfolio journeys and loaded visual assets | 1 |
| `dca8c0d` | test: preserve original public inputs for historical RAG replay | 3 |
| `5a84e63` | content: distinguish built search from future experiments | 3 |
| `2fe2d6f` | chore: regenerate public vectors for the revised search heading | 1 |
| `b508535` | docs: teach presentation boundaries and evidence-first navigation | 2 |
| `c7c0fa7` | fix: clarify empty search feedback and preserve accessible status | 3 |
| `ae110c8` | docs: record the visual review and verified development handoff | 3 |
| `7382a41` | test: stabilize screenshot fonts and viewport capture order | 1 |

The final tag also includes this checkpoint inventory and the frozen screenshot archive location. The [design review](design-polish.md), [verification record](verification.md#editorial-portfolio-and-evidence-first-ask-17-november-2026), and [learning tracker](learning-tracker.md) explain the choices and how to study them. The tracker now maps 18 components; personal review markers remain owner-controlled.

Local previews use `npm run preview -- --port 4321` after a production-path build with Node 24. The study map uses `npm run learn` on port 4382. Accepted before/after images are frozen under ignored `artifacts/design-polish/verified/`, including a SHA256 manifest; they are never copied into the published site. `scripts/capture-design.mjs` reproduces the visitor journey with lazy-image decoding, font readiness, and stable viewport capture.

Verified: all routes and public boundaries, 1440/390/320 layouts, keyboard/no-JavaScript navigation, reduced motion and pause controls, axe checks, source integrity, optional-model failure/cancellation, 90/90 existing semantic browser evaluation questions, model-free RAG lifecycle, and the updated offline learning lab. Historical RAG results replay against their original frozen public corpus instead of a later editorial revision.

Launch remains separate: review the complete `pilot` diff, run release PR CI, approve the merge to `main`, and verify the exact hosted revision after the existing workflow publishes it. The static deployment workflow and contribution refresh are unchanged. No new account, service, billing resource, or domain is needed.

## Minimal editorial redesign, 17 November 2026

Complete checkpoint: `checkpoint/minimal-editorial-v1-2026-11-17` on `pilot`. Baseline: `593d093`. This replaces the spectral presentation with the current [light editorial brief](design-polish.md). The earlier tag remains available for comparison. No merge or production deployment occurred.

Small commits preserve review and backtracking boundaries. Each changes one to three files; intermediate design commits depend on later component updates. Use the final checkpoint for the fully checked site.

| Commit | Concern | Files |
| --- | --- | ---: |
| `45675c7` | New visual direction and reproduction guide | 1 |
| `95d7f57` | Shared light canvas, typography, spacing, navigation | 2 |
| `0f9ec96` | Identity-led homepage and open work hierarchy | 1 |
| `ed34e4f` | Readable contribution-calendar palette | 2 |
| `a98a815` | Open public workflow diagrams | 1 |
| `2a503b2` | Case-study reading scale and composition | 1 |
| `01a478a` | Focused Ask entry and open source evidence | 2 |
| `e24381f` | Site icon | 1 |
| `a6bff73` | Social image and reproducible rendering | 3 |
| `5e78a9c` | Tablet, native disclosure, and motion regression coverage | 1 |
| `b532e48` | Current site/search architecture guidance | 3 |
| `ac17368` | Learning map and study exercises | 2 |

The final documentation commit adds this inventory and the dated verification results. See [verification](verification.md#minimal-editorial-redesign-17-november-2026) for the passing checks, exact budgets, and limitations. Ask retrieval, indexed content, pinned models, snapshot data, and delivery workflows remain unchanged. The answer selector is still experimental; the owner alone marks learning progress.

Changed-file inventory:

- Shared foundation and homepage: `src/styles/global.css`, `src/layouts/Base.astro`, `src/pages/index.astro`.
- Workflows and case studies: `src/components/ProjectVisual.astro`, `src/styles/case-study.css`.
- Ask presentation: `src/pages/ask.astro`, `src/styles/ask.css`.
- Contribution figure: `src/components/GitHubSection.astro`, `src/pages/github-heatmap.svg.ts`.
- Identity assets: `public/favicon.svg`, `public/social.svg`, `public/social.jpg`, `scripts/render-social.mjs`.
- Browser checks: `scripts/verify-browser.mjs`.
- Current documentation and learning: `README.md`, `docs/design-polish.md`, `docs/architecture.md`, `docs/portfolio-navigator-prd.md`, `docs/learning-tracker.json`, `docs/learning-tracker.md`, `docs/verification.md`, `docs/release-checkpoints.md`.

Local preview: `http://localhost:4321/portfolio/`. Reproduce with Node 24:

```sh
SITE_URL=https://the-anantkumar.github.io SITE_BASE=/portfolio npm run build
npm run preview -- --port 4321
```

Before/after screenshots are in ignored `artifacts/design-polish/minimal-before/` and `minimal-after/`; accepted representative copies and hashes are in `minimal-verified/`. These artifacts are intentionally excluded from the public repository and site. Review and authorize the release PR to `main` when ready to publish.
