# Portfolio implementation guide

This repository is an Astro static site on `pilot`. There is no backend, React runtime, API route for contacts, or runtime GitHub fetch.

- Preserve the zero-cost constraint: no paid services, purchased domains, model APIs, or automatic upgrades.
- Use typed Markdown collections for public content. `src/content/projects` feeds both cards and detail pages.
- Keep `.codex/`, resume source files, secrets, private product data, and infrastructure identifiers out of Git and `dist/`.
- Only the explicitly authorized email and professional profile links belong in public contact content.
- Keep ordinary pages script-free, accessible without JavaScript, and under documented performance budgets.
- Figures need a source, a date or measurement period, and clear individual/team attribution.
- trlr is founder work; Nielsen is employer work. Do not imply validated prediction superiority or clinical validity.
- Run `npm run check` and `npm run build` after code/content changes. Use Node 24.
- Apply browser checks to substantive visual changes, including mobile, reduced motion, keyboard navigation, and a script-disabled browser.
- Build checks do not apply Cloudflare HTTP headers; verify them on the actual hosting deployment.
- No deployment, account creation, or paid resource is implied by a local implementation request.
