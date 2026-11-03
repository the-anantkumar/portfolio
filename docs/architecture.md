# Architecture decision: static delivery

## Goal

Help engineering hiring teams understand Anant's scope and technical judgment quickly, with founder/product ownership as supporting evidence. Operating cost must be zero. Content remains readable on modest devices and without JavaScript.

## Baseline analysis

The previous implementation used React/Vite, routing, particle effects, animation libraries, and a browser-rendered page shell. Its contact form simulated a successful send. A GitHub component requested an absent stats API. Documentation described Next.js and Nodemailer routes not implemented in the repository. Navigation and footer were rendered twice.

## Chosen approach

Astro generates six HTML pages (home, four case studies, 404). It renders Markdown at build time and extracts CSS. The site contains no application scripts, database, backend process, runtime API calls, or third-party fonts. An always-visible GitHub section embeds a saved contribution calendar; optional CSS transforms animate the spectral background and rings. Semantic HTML and ordinary links support navigation; CSS provides all illustrations and visual feedback. Illustrations intentionally contain no private screenshots or records.

Plain HTML would also meet runtime constraints but duplicate project metadata. Retaining React would reduce migration work but add a browser runtime without a current interactive need. A server framework would introduce operational responsibilities with no visitor benefit. Astro supplies content validation and routing while preserving static portability.

## Interfaces

Projects have title, label, summary, role, category, technologies, order, featured flag, illustration kind, evidence label, and optional public links. The content collection schema validates the frontmatter. Filenames become `/projects/<slug>/`. Markdown headings supply the detail-page table of contents. No public API is introduced.

Only the public content collection may feed future search. Never index `.codex`, repository research, environment files, private documents, or customer data.

## Performance and delivery contract

- Initial application JavaScript: zero today; hard ceiling 20 KB gzip before optional search.
- Initial homepage transfer: under 300 KB; the current checker conservatively caps the whole static output at 300 KB.
- CSS and fonts: one build-managed stylesheet and system fonts; no remote requests.
- Target Lighthouse mobile performance/accessibility: 95 or above. Lab scores are not field Core Web Vitals.
- Build output must have working internal links, one h1 per page, no simulation states or known private markers.
- Cloudflare Pages Free serves static output at its included subdomain. No functions or paid add-ons.

Canonical origin comes from `SITE_URL`, then `CF_PAGES_URL`. Local builds omit a fictional canonical origin. Preview URLs should be given the stable production `SITE_URL` before publication. Asset caching and restrictive HTTP security headers live in `public/_headers`.

## Future search and AI

First add static Pagefind search, indexed after the build and loaded only when requested. Do not call keyword search AI. Update CSP to permit only the actual same-origin script/index needs.

A later semantic search experiment may run a license-compatible embedding model in a worker in the browser. Select a model only after checking the then-current license, total download size, individual asset limits, CPU/WebGPU support, and memory use. Explain the download before activation; keep a working keyword-search fallback. No model downloads occur in v1.

Generated answers are not required for semantic search. If added later, ground them in public passages with source links and handle unsupported answers explicitly. Neither paid inference nor an API-key requirement satisfies the current budget.

## References

- [Astro's static-first design](https://docs.astro.build/en/concepts/why-astro/)
- [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Cloudflare static request pricing](https://developers.cloudflare.com/pages/functions/pricing/)
- [Pagefind](https://pagefind.app/)
- [Transformers.js](https://huggingface.co/docs/transformers.js/en/index)

Free terms and quotas can change. Recheck before deployment or enabling any new service. Do not silently move to paid usage.

## November visual/activity iteration

A dark, continuous spectral palette replaces paper-like surfaces. Native checkbox and `:has()` provide an explicit animation pause control; reduced-motion overrides all CSS animation. The new GitHub refresh script fetches public calendar HTML only when a maintainer runs it, validates a continuous full-year date range, and persists a minimal aggregate snapshot. Builds and visitor requests do not depend on GitHub. The parser intentionally fails rather than fabricate counts if GitHub markup changes.

## Contribution-only GitHub section

Repository cards, repository metadata, and their refresh script were removed at the owner's request. The section shows only aggregate contribution activity and a dated heatmap. Refresh is an explicit maintainer command followed by rebuild/deployment; no automatic schedule or visitor-triggered API fetch exists.
