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
