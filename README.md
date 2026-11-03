# Anant Kumar Srivastava | portfolio

A static engineering portfolio built with Astro, TypeScript, Markdown, and CSS. The dark spectral design uses optional CSS-only motion and an embedded GitHub activity section. It targets MTS 2 / SDE 2+ opportunities and presents founder work as evidence of product and technical ownership.

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

`npm run build` also verifies generated routes, internal links and anchors, publication boundaries, punctuation, and size budgets. `npm test` tests the calendar refresh and reruns those checks against the existing `dist/` build. `npm run test:github` runs the refresh tests alone, offline and without installed dependencies. No test makes paid requests.

## Content and structure

- `src/content/pages/home.md`: headline, introduction, professional positioning, and public contact links.
- `src/content/pages/about.md`: biography, education, and music.
- `src/content/pages/experience.md`: employers, dates, roles, and contributions.
- `src/content/projects/*.md`: one case study per project. Frontmatter feeds homepage cards; the body supplies the detail page.
- `src/content.config.ts`: typed content collections; invalid content fails validation.
- `src/pages/`: homepage, generated project routes, 404, robots, and sitemap.
- `src/components/ProjectVisual.astro`: original CSS illustrations; these are conceptual artwork, not screenshots or user records.
- `docs/architecture.md`: stack decisions, budgets, hosting, and future search boundaries.
- `docs/editorial-review.md`: the three-perspective editorial review.

Set `featured: true` and a numeric `order` to feature a project. The Markdown filename is its public URL slug. Keep existing slugs stable; add a Cloudflare `_redirects` entry if a published slug changes.

## Free Cloudflare Pages deployment

Use **Cloudflare Pages Free**, with Git integration for this repository:

| Setting | Value |
| --- | --- |
| Production branch | `pilot` |
| Framework | Astro |
| Build command | `npm run check && npm run build` |
| Output directory | `dist` |
| Node version | 24 (also recorded in `.node-version`) |

Use the supplied `pages.dev` hostname. No purchased domain, Functions, database, KV/R2 storage, email delivery, AI service, or paid plan is required. Do not enable paid add-ons or automatic upgrades. This repository prepares deployment; it does not create a Cloudflare account or publish itself.

Cloudflare sets `CF_PAGES_URL`, which is used for canonical links and sitemap URLs. Set `SITE_URL` to the stable production HTTPS URL when known, especially if building preview deployments. Local builds intentionally omit canonical URLs and emit an empty sitemap rather than invent a public address. You can test canonical output with `SITE_URL=https://example.pages.dev npm run build`; that example is not the deployed site.

The `_headers` file restricts scripts and network connections because v1 has no browser API calls. It is applied by Cloudflare, not Astro's local preview server. Future search will require a deliberate same-origin CSP update.

Deployments are static and portable. Use Cloudflare's previous successful deployment to roll back, or revert the source change and rebuild. If free terms change or quota is exhausted, keep the last working site and reconsider hosting rather than authorizing spending.

## Privacy and claims

The public email and LinkedIn are authorized contact channels. The phone number and raw resume are excluded. `.codex/`, local environment files, and audit artifacts are ignored. Do not put private source notes in `public/`, published Markdown, or repository documentation. There are no cookies set by this application, analytics integrations, form submissions, or query logs. Hosting providers still process normal HTTP requests; this is not a claim that infrastructure collects no data.

Store metrics are dated snapshots. Portfolio narratives distinguish independent products from employer work and do not claim measured AI superiority. Review `docs/editorial-review.md` before adding new metrics.

## Future search

Search and AI are intentionally deferred. Add Pagefind first, loaded on demand. Browser-local semantic retrieval can follow only after model license, download, hosting-size, device-support, and zero-cost checks. Do not introduce a paid model API, expose a key, or connect to trlr's inference backend.

## GitHub activity and motion

The homepage displays the contribution calendar and aggregate activity counts. GitHub links scroll to this section rather than leaving the portfolio. Repository-level information is not included.

The SVG is a local, lazy-loaded static asset; daily counts are available as a CSV. Visitors make no GitHub API requests. The calendar works without JavaScript and shows its snapshot date.

**A six-hour refresh workflow is included.** It fetches the public calendar, validates it, and commits changed data to `pilot` only after the site passes its checks. Connected Cloudflare Pages Git integration then rebuilds the site. Unchanged data produces no commit or deployment; failures preserve the last good snapshot. Manual refresh still works:

```sh
npm run refresh:github
npm run build
```

The workflow is prepared locally, **not activated by a local commit**. Push the implementation to `pilot`, add the workflow file to the repository's default branch (`main`), enable Actions, and connect Cloudflare Pages to `pilot`. See [activation, freshness, costs, and rollback](docs/github-refresh.md). No personal access token or new service secret is required.

This is an automatically refreshed snapshot, not a real-time feed. Reloading a page reads the most recently deployed data; an already-open page does not poll. The displayed snapshot date changes only when the saved calendar changes.

Slow ambient light and ring movement use CSS transforms. The pause control in the header stops motion; `prefers-reduced-motion` disables it automatically. No preference storage or animation JavaScript is needed.
