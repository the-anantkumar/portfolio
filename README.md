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

`npm run build` also verifies generated routes, internal links and anchors, publication boundaries, punctuation, deployment paths, canonical URLs, and size budgets. `npm test` tests the calendar refresh and reruns those checks against the existing `dist/` build. `npm run test:github` runs the refresh tests alone, offline and without installed dependencies. `npx playwright install chromium` then `npm run test:browser` checks the built site in Chromium, including accessibility and mobile layouts. No test makes paid requests.

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

No purchased domain, backend, database, model API, or Cloudflare account is needed. Use the public repository and standard GitHub-hosted runner. No paid plan or automatic upgrade is enabled. The small Pages artifact expires after one day; dependency caching is disabled. See [deployment, testing, and rollback](docs/deployment.md).

To reproduce the production build locally:

```sh
SITE_URL=https://the-anantkumar.github.io SITE_BASE=/portfolio npm run build
npm test
npm run test:browser
```

Ordinary local builds use `/` and omit canonical URLs. Production links, assets, social previews, and the sitemap include `/portfolio/`. `dist/release.json` identifies the source commit deployed for verification.

GitHub Pages does not apply `public/_headers`; that file remains an optional Cloudflare configuration for a future host migration. Every HTML page supplies a restrictive Content Security Policy and referrer policy through metadata. Response-only protections such as `frame-ancestors`, custom cache headers, and Permissions-Policy cannot be configured on Pages. Host caching may briefly delay a newly deployed asset. Future search requires a deliberate CSP change.

## Privacy and claims

The public email and LinkedIn are authorized contact channels. The phone number and raw resume are excluded. `.codex/`, local environment files, and audit artifacts are ignored. Do not put private source notes in `public/`, published Markdown, or repository documentation. There are no cookies set by this application, analytics integrations, form submissions, or query logs. Hosting providers still process normal HTTP requests; this is not a claim that infrastructure collects no data.

Store metrics are dated snapshots. Portfolio narratives distinguish independent products from employer work and do not claim measured AI superiority. Review `docs/editorial-review.md` before adding new metrics.

## Future search

Search and AI are intentionally deferred. Add Pagefind first, loaded on demand. Browser-local semantic retrieval can follow only after model license, download, hosting-size, device-support, and zero-cost checks. Do not introduce a paid model API, expose a key, or connect to trlr's inference backend.

## GitHub activity and motion

The homepage displays the contribution calendar and aggregate activity counts. GitHub links scroll to this section rather than leaving the portfolio. Repository-level information is not included.

The SVG is a local, lazy-loaded static asset; daily counts are available as a CSV. Visitors make no GitHub API requests. The calendar works without JavaScript and shows its snapshot date.

**The six-hour refresh is part of the deployment workflow.** It validates public calendar data, commits changes to `main`, then tests and deploys that exact revision in the same run. Unchanged scheduled checks skip deployment; failures retain the last published site. Manual refresh still works:

```sh
npm run refresh:github
npm run build
```

No personal access token or service secret is required. [Refresh operations and failure handling](docs/github-refresh.md) describe the schedule, manual runs, and pause controls.

This is an automatically refreshed snapshot. Reloading the page reads deployed data; an already-open page does not poll. The displayed snapshot date changes only when the saved calendar changes. GitHub contribution processing, the schedule, deployment, and CDN caching all affect freshness.

Slow ambient light and ring movement use CSS transforms. The pause control in the header stops motion; `prefers-reduced-motion` disables it automatically. No preference storage or animation JavaScript is needed.
