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
