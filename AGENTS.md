# Portfolio implementation guide

This repository is an Astro static site published from `main`; `pilot` is the development branch. There is no backend, React runtime, API route for contacts, or runtime GitHub fetch.

- Preserve the zero-cost constraint: no paid services, purchased domains, model APIs, or automatic upgrades.
- Use typed Markdown collections for public content. `src/content/projects` feeds both cards and detail pages.
- Do not use em dashes in public copy, date ranges, or page titles. The build verifies this preference.
- Contribution refreshes run outside the visitor request path. Keep the scheduled workflow public-repository-only, preserve the last valid snapshot on failure, and commit only changed calendar data to `main`.
- Keep `.codex/`, resume source files, secrets, private product data, and infrastructure identifiers out of Git and `dist/`.
- Only the explicitly authorized email and professional profile links belong in public contact content.
- Keep ordinary pages script-free, accessible without JavaScript, and under documented performance budgets.
- Figures need a source, a date or measurement period, and clear individual/team attribution.
- trlr is founder work; Nielsen is employer work. Do not imply validated prediction superiority or clinical validity.
- Run `npm run check` and `npm run build` after code/content changes. Use Node 24.
- Apply browser checks to substantive visual changes, including mobile, reduced motion, keyboard navigation, and a script-disabled browser.
- GitHub Pages ignores `public/_headers`. Preserve document CSP and referrer metadata. Do not claim response-only protections are enforced.
- Run the committed browser checks for release changes. Production-path builds use SITE_URL=https://the-anantkumar.github.io and SITE_BASE=/portfolio.
- Deployment and refresh share one workflow so bot commits publish without relying on a second push trigger. Preserve exact-commit verification and the public-repository/free-runner guards.
- No deployment, account creation, or paid resource is implied by a local implementation request.
- `/ask/` is the sole interactive route. Load the embedding worker only after explicit opt-in; preserve word matching, cancellation, and no-JavaScript browse links.
- Search indexes only public typed collections. Run `npm run index:search` after indexed content or evaluation-question changes; ordinary builds and scheduled refreshes verify committed vectors without downloading models.
- Preserve the pinned model revision, source links, query privacy, separate performance budgets, and the upstream notices under `public/ai-notices/`. License texts remain verbatim.
- Run `npm run test:search` for retrieval changes. `TEST_AI_MODEL=1 npm run test:browser` explicitly exercises the real public model download; default browser checks stay independent of model hosting.
