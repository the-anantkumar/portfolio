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
