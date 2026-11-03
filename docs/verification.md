# Verification | 3 November 2026

## Build and static checks

- Astro/TypeScript: zero errors, warnings, or hints.
- Six HTML pages generated: homepage, four case studies, and custom 404.
- Internal links and section anchors pass the build validator.
- Exactly one main heading per page; no application scripts in the output.
- Homepage HTML: approximately 5.0 KB gzip; shared CSS: approximately 7.0 KB gzip.
- Whole generated site, including the 1200 × 630 social preview JPEG: approximately 175 KB uncompressed.
- Application JavaScript: 0 bytes.
- Dependency audit after compatible transitive updates: zero known vulnerabilities reported. This is an advisory snapshot, not a guarantee of future security.
- `.codex/` is ignored; the raw resume is not tracked or copied to the output. Known private markers and unapproved claims are checked during the build.

## Browser checks

Playwright 1.64.1 using installed Chromium in headless mode, against the local production preview:

- Homepage at 1440, 390, and 320 CSS pixels: no horizontal overflow or browser runtime errors.
- All four case studies load directly and pass mobile overflow checks.
- Unknown path returns the custom 404 with HTTP 404.
- One header and footer; skip link receives focus and moves keyboard focus to main content.
- Case-study navigation works with JavaScript disabled.
- Reduced-motion preference used in layout checks.
- axe WCAG 2 A/AA and 2.1 AA checks: zero violations on tested routes and viewports.
- Desktop homepage, mobile homepage, and mobile trlr case study visually inspected. CSS artwork is deliberately illustrative.

## Lighthouse lab measurement

Local mobile Lighthouse run on the production preview:

| Category | Score |
| --- | --- |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |

First contentful paint and largest contentful paint: approximately 0.8 seconds. Cumulative layout shift: 0. These are local laboratory measurements, not real-user field metrics or a promise about every device/network. The remaining diagnostic notes concern the single render-blocking stylesheet; it is approximately 7.4 KB compressed.

An experimental accessible-name diagnostic was corrected by removing redundant labels and keeping decorative artwork outside links. The final run no longer reports it.

## Reproduction and limits

Run `npm run check` and `npm run build` using Node 24. The committed build validator is dependency-free. Browser audits used temporary developer tools outside the application dependency tree; local reports and screenshots are in ignored `artifacts/`.

The in-app browser preview host was unavailable, so automated Chromium screenshots provided visual verification. Cloudflare has not been configured or deployed. Hosted headers, real-domain canonical URLs, redirects, caching, and public availability require validation after deployment. No backend or paid inference was invoked.

## Spectral design and GitHub reveal iteration

- Dark indigo/pink/violet surfaces, CSS gradient backgrounds, original prism artwork, and slow rotating rings replace the paper-like layout.
- Header pause checkbox pauses both rings and background movement. Reduced-motion emulation disables animation; verified in Chromium.
- Real public GitHub calendar snapshot: 367 dates and 266 contributions shown, fetched 3 November 2026. No private repository events or names stored.
- Calendar SVG is a local lazy-loaded static asset. Browser tests confirmed no calendar request until reveal and no third-party page requests.
- Reveal and case-study navigation work with JavaScript disabled; mobile calendar initially shows the most recent dates, with horizontal scrolling.
- CSV contains all 367 dates plus a header. Build checks ensure the calendar cells, CSV rows, and aggregate count agree with the snapshot.
- A deliberately invalid calendar response was rejected and the saved snapshot remained byte-for-byte unchanged.
- All eight supplied Nielsen highlights are included, preserving parallel-run scope, checked mappings, the QA connection exception, investigation status, and pending implementation/testing.
- Final desktop/mobile/reveal axe checks report zero WCAG A/AA violations. Final Lighthouse reports 100 in all four categories, 0.8s FCP/LCP, and zero CLS. The earlier DOM-size diagnostic was eliminated by using a lazy-loaded SVG instead of putting the full calendar/data table into the page DOM.
- Local preview remains running at the user's request. Hosting has not been deployed.

## Embedded GitHub section (supersedes the collapsed reveal)

- The calendar is visible by default at `#github`; hero and contact GitHub links scroll there instead of opening GitHub.
- Four verified public repositories are embedded with reviewed summaries, languages, actual star/fork counts, and native expandable overviews. Selection is editorial, not a popularity ranking.
- Build checks reject private repository entries and external GitHub navigation on the homepage.
- Desktop (1440px) and mobile (390px, 320px) checks confirm in-page navigation, visible heatmap, four cards, working overview expansion, and no external links within the GitHub section.
- Browsing the calendar and opening repository overviews works with JavaScript disabled.
- No third-party visitor requests or browser errors. All tested routes remain free of axe WCAG A/AA violations.
- Final Lighthouse remains 100 in performance, accessibility, best practices, and SEO, with 0.8s FCP/LCP and zero CLS.
- The calendar and repository metadata are dated snapshots. New repository metadata is refreshed only by the maintainer command, not a visitor-triggered API request.

## Repository information removed

At the owner's request, all repository cards, per-repository statistics, metadata, and repository-refresh code were removed. The section now shows only the embedded contribution calendar and two aggregate metrics. Type checking and build checks pass; targeted no-JavaScript browser checks at 1440, 390, and 320px confirm a visible heatmap, no repository information, and no horizontal overflow. The last full Lighthouse/axe audit above predates this removal.

At this checkpoint, the heatmap was manual: `npm run refresh:github` refreshed the saved calendar and `npm run build` regenerated the displayed asset. The automation iteration below supersedes that behavior after remote activation.

## Phased commits, punctuation, and automated refresh

- Saved the complete static portfolio as a baseline commit, then isolated the punctuation cleanup and refresh automation in separate commits.
- Removed em dashes from public content, date ranges, page titles, and documentation. The generated HTML check also rejects literal and HTML-encoded em dashes.
- All 18 offline refresh tests pass. They cover exact parsing, missing/invalid data, duplicate and discontinuous dates, partial calendars, unchanged snapshots, changed counts, calendar rollover, stale calendars, network/HTTP/body failures, and local HTML input.
- A real public GitHub fetch succeeded and returned an unchanged calendar. The script preserved the existing snapshot and did not manufacture an update.
- Workflow YAML parses without duplicate keys. Its six-hour schedule, default-branch activation, `pilot` checkout/write target, pinned actions, minimal permissions, public-repository condition, no-change exit, build gate, and non-force push were reviewed locally. A hosted Actions run has not occurred.
- Astro checks: zero errors, warnings, or hints. Build and test commands pass, including internal links, calendar/CSV consistency, punctuation, privacy boundaries, and size budgets. The complete output is approximately 176 KB with zero application JavaScript.
- Chromium checks with JavaScript disabled pass at 1440, 390, and 320px: heatmap visible, two aggregate metrics, no repository cards, and no horizontal overflow.
- SVG/CSV cache revalidation headers are included for Cloudflare. Local preview does not apply them; confirm after hosting is connected. No remote workflow activation or deployment is claimed.

## GitHub Pages release preparation

This release replaces the planned Cloudflare deployment with GitHub Pages and moves production to `main`. The earlier notes above record local checkpoints; the current hosting contract is in [deployment.md](deployment.md).

- Node 24 type checks pass with no errors, warnings, or hints. Both root-path local builds and `/portfolio/` production builds pass publication/link/size validation.
- All 18 calendar tests pass. Production output is approximately 180 KB, with zero application JavaScript.
- The committed Chromium suite passes at 1440, 390, and 320px, including all case studies, no-JavaScript navigation, heatmap asset loading, reduced motion, keyboard skip access, animation pause, custom 404 recovery, and axe WCAG A/AA checks.
- The pause test checks the glows and rings with active CSS animations; decorative stationary rings are excluded. This corrected a test assertion rather than changing the visual behavior.
- `actionlint` 1.7.12 validates the workflow. Its binary was checked against the official release digest before use. Dependency installation reports no known vulnerabilities at this checkpoint.
- Root and production builds verify document CSP, base-prefixed links, canonical/social URLs, the sitemap, and a source revision marker. GitHub Pages controls actual response headers and CDN caching; the optional Cloudflare headers are not part of this host's guarantee.
- Remote CI and publication use the same committed checks, plus `test:hosted` against the exact released revision. The [workflow history](https://github.com/the-anantkumar/portfolio/actions/workflows/portfolio.yml) is the source of evidence for each deployed revision.
