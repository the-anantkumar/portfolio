# Production deployment and operations

## Hosting

- Public site: https://the-anantkumar.github.io/portfolio/
- Repository: https://github.com/the-anantkumar/portfolio
- Production branch: `main`; development branch: `pilot`.
- Workflow: [Portfolio CI and Pages](https://github.com/the-anantkumar/portfolio/actions/workflows/portfolio.yml).
- Pages settings: GitHub Actions source, HTTPS, `github-pages` environment.
- Build: Node 24, `npm ci`, Astro static output in `dist`.

GitHub Pages was chosen for this release because the existing public GitHub repository can supply hosting and automation without another account or credentials. Cloudflare remains a portable alternative, but is not the active host. This is a personal portfolio, with no transactions, customer accounts, or server runtime. [Pages availability and limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)

The production build sets `SITE_URL=https://the-anantkumar.github.io` and `SITE_BASE=/portfolio`. Do not remove the base prefix from authored links or public assets. `src/lib/paths.ts` centralizes it. Canonical links, social images, and sitemap entries are checked during the build. The project-scoped `robots.txt` does not control the account's root `github.io/robots.txt`.

## Release flow

1. Develop on `pilot` or a feature branch and open a PR into `main`.
2. **Validate site** runs type checks, a production-path build, refresh and retrieval tests, and Chromium checks. PR jobs have no deployment/write credentials. Ordinary builds verify committed search vectors and do not download a model.
3. Merge the reviewed, passing PR. Preserve the existing phased commits with a merge commit when releasing the initial portfolio.
4. The `main` run uploads only the verified `dist` directory and deploys it to Pages.
5. The deployment job checks the public `release.json` against the exact verified source SHA, verifies content routes including Ask and canonical URLs, compares the calendar/CSV/search data/sitemap/images with the build, and checks the custom 404. A green deployment job includes these public checks.

Scheduled heatmap checks run in this same workflow. When data changes, the refresh job validates it, commits only the snapshot to `main`, then passes the resulting SHA to validation and deployment. This avoids relying on another push workflow from a `GITHUB_TOKEN` commit. See [calendar operations](github-refresh.md).

The workflow serializes runs for each branch/PR. A human push during a calendar update can reject the bot push; no force push or automatic history rewrite occurs. The next scheduled run starts from current `main`.

## Reproduce the tests

Use Node 24. For an ordinary local preview, use `npm run dev`.

```sh
npm ci
npx playwright install chromium
npm run check
SITE_URL=https://the-anantkumar.github.io SITE_BASE=/portfolio npm run build
npm test
npm run test:browser
```

The browser script starts and closes its own static test server, so it does not disturb an existing development preview. It checks content routes including Ask at desktop, 390px and 320px widths; no-JavaScript navigation; loaded calendar; reduced motion; pause behavior; keyboard navigation; custom 404 recovery; and axe WCAG A/AA checks. Ask checks cover source links, query handling, zero model downloads before opt-in, and recovery from corpus/model failures and cancellation. CI installs Chromium with its Linux system dependencies. Default tests use synthetic calendar and worker fixtures and make no paid requests or model downloads.

The saved-vector retrieval tests exercise actual embeddings without running the model again. They do not replace a real-browser inference check after changing runtime dependencies, CSP, model configuration, or worker code. Run that separate check explicitly with `TEST_AI_MODEL=1 npm run test:browser`; it downloads the public model and may take longer. It does not provision a service or use paid inference. Runtime timing from one machine is not a general device-performance claim.

For a built release, run `TEST_URL=https://the-anantkumar.github.io/portfolio/ EXPECTED_COMMIT=<full-source-SHA> npm run test:hosted`. The local `dist` must come from that same source revision with the production environment values. `TEST_URL=... npm run test:browser` also supports browser checks against the live site. Screenshots are optional through `TEST_SCREENSHOT_DIR` and remain untracked.

## Updating the search index

Use `npm run index:search` after changing indexed public content. This explicit maintainer command rebuilds the corpus, runs native CPU inference with the pinned model, writes passage and public evaluation-question vectors, then runs the normal build. A stale index fails that normal build. Commit content, model configuration, and matching vectors in reviewable phases; the release must contain a compatible set.

Do not set `SEARCH_INDEX_REBUILD=1` in ordinary CI to bypass a stale-index failure. Regenerate the reviewed index locally and commit it. The scheduled contribution refresh changes only calendar data, which is outside this corpus, so it needs no model download or index regeneration. The index contains public portfolio text only; model caches and local experiment artifacts stay outside the release.

## Recovery and rollback

If a build or pre-deployment test fails, Pages keeps the previous release. If a post-deployment check fails, inspect the live release and workflow logs: the deployment has already happened, so failure does not automatically roll it back.

For a code rollback, revert the offending commit through a PR to `main` and let the full workflow redeploy. For a merge commit, use Git's appropriate mainline parent rather than rewriting branch history. Avoid force pushes. Existing phase commits remain individually inspectable for backtracking.

To redeploy current `main` without refreshing calendar data, run **Portfolio CI and Pages** manually with `refresh` unchecked, or use:

```sh
gh workflow run portfolio.yml --ref main -f refresh=false
```

For a calendar rollback, first pause the schedule by removing its `schedule` trigger through a PR; then revert the unwanted snapshot commit. Otherwise a later refresh can restore the same upstream data. Disabling the whole workflow stops CI and deployments too, so use that only as an emergency pause and re-enable it before redeploying.

Do not weaken existing branch or environment protections to make a job pass. The initial repository had no branch protections. If required PR reviews are added to `main`, change the calendar update to open a PR or use a narrowly scoped automation rule; direct bot pushes may then fail as intended.

## Cost and platform boundaries

The jobs run only in this named public repository, use standard Ubuntu runners, disable dependency caches, and give the Pages artifact a one-day lifetime. No paid plan, model API, purchased domain, or third-party hosting account is provisioned. Pages and public standard runner availability follow current GitHub terms; do not enable paid upgrades if limits are reached. [Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)

GitHub Pages controls HTTP cache/security headers. The optional Cloudflare `_headers` file is ignored. Ordinary documents block scripts and connections; Ask enables its same-origin application code. The HTTP-served worker does not inherit the document's CSP, and Pages cannot provide a custom worker CSP response header. The worker's pinned model-fetch guard is application code, not a network sandbox. [Architecture and worker limits](architecture.md#worker-and-hosting-limits)

Referrer policy is supplied by document metadata and explicitly by model-fetch code. `frame-ancestors`, Permissions-Policy, and custom cache directives require a host that supports response headers. The optional Cloudflare policy supplies response-only protections while document metadata supplies route policies. A fresh deployment may need time to reach CDN edges, so hosted checks retry the commit marker before declaring success.

The release currently contains about 15.5 MB of static files, primarily optional same-origin WebAssembly. Ordinary pages remain about 188 KB in total and script-free; the full artifact is not their initial transfer. Model weights remain on Hugging Face and load only on visitor opt-in. Full upstream notices in `public/ai-notices/` are intentionally published. See [separate asset budgets](architecture.md#performance-and-delivery-contract).

No secrets, raw resume, `.codex/`, local screenshots, model caches, or development dependencies belong in the uploaded artifact. The build publication checks and upload path enforce the intended boundary. Future AI/search changes need separate review of download size, CSP, privacy, licensing, and zero-cost operation. A local implementation or test run does not authorize deployment or account creation.
