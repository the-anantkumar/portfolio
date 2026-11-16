# Minimal editorial direction, 17 November 2026

Development branch: `pilot`. This is the current visual brief. It supersedes the earlier instruction to retain the dark spectral identity, lavender accent, prism, and decorative motion. The previous pass remains available at `checkpoint/design-polish-v1-2026-11-17`.

## Direction

Use a continuous near-white canvas, charcoal text, and one restrained green accent. The portfolio should feel personal, readable, and deliberately composed. Identity, useful work, and original evidence carry the presentation. Do not restore glows, rings, prism imagery, gradients, decorative animation, or repeated framed panels.

The references inform composition rather than exact styling:

- [Studio Plato](https://www.studioplato.co/): close grouping of identity, positioning, project context, and the route into the work. The portfolio does not adopt the full-screen carousel.
- [Tom de Koning](https://www.tomdekoning.work/): shared gutters, confident identity, fine rules, and open rows. Keep this site's reading scale; do not import the reference's oversized masthead or portrait introduction.
- [Awwwards minimal](https://www.awwwards.com/websites/minimal/) and [portfolio](https://www.awwwards.com/websites/portfolio/): review composition principles, not effects or awards as a design requirement. The galleries contain varied approaches, not one mandatory style.

Actual desktop screenshots of all four references informed the direction. Plato's mobile splash and unloaded lower gallery thumbnails were not used as visual evidence. Reference captures remain in ignored `artifacts/design-polish/minimal-references/`.

## Baseline problems

The `593d093` development build was captured before editing, at 1440, 768, 390, and 320 px. The rendered review identified five priorities:

1. The full name was tiny while a broad slogan dominated the first screen.
2. A long hero, repeated introduction, and separate metric strip delayed the first project, especially on phones.
3. Prism, rings, and glows competed with concrete engineering evidence.
4. Repeated backgrounds, borders, and rounded panels fragmented the composition.
5. Several font families, very small labels, and oversized case titles created an uneven reading scale.

## Shared design rules

`src/styles/global.css` is the foundation. Use its semantic roles rather than new component-specific font scales:

| Role | Token | Purpose |
| --- | --- | --- |
| Main heading | `--text-main` | Page identity and case titles, fluid and comfortable |
| Section heading | `--text-section` | Major content groups |
| Project title | `--text-project` | Work entries and prose sections |
| Body | `--text-body` | 17 px reading text |
| Supporting text | `--text-support` | 14 px metadata, captions, and supporting information |
| Controls | `--text-control` | 15 px links and controls, with comfortable tap targets |

The single primary font stack uses Avenir Next with local sans-serif fallbacks. No font service or download is needed. Use `--space-1` through `--space-6` for relationships within and between groups; `--space-section` separates major sections. Align shared navigation, content, and footer to `.wrap`. Long prose stays near 62 characters per line.

The accent marks links, selected states, focus, and a few meaningful details. Fine neutral rules can separate work entries. Enclosing boundaries belong around inputs and controls where they help interaction. Do not put every section or result inside a card. Supporting text must remain readable on the near-white canvas.

No ambient animation is required. Small color and border transitions may provide interaction feedback. Respect reduced motion for transitions and scrolling. The old pause control is removed because its decorative animation no longer exists.

## Composition and interaction

- **Homepage:** lead with the full name, role, and existing factual introduction. Provide quiet links to work and Ask. Feature Nielsen's employer work with its individual/team scope and one-run validation qualification. Supporting projects are open rows; trlr remains founder work. Experience uses native disclosures, keeping contributions available without JavaScript. Biography, a light contribution calendar, and straightforward contact links complete the story.
- **Case studies:** connect title, summary, role, scope, and original sources. Use comfortable prose and clear section navigation. Keep accurate workflow diagrams, expressed as open steps with readable labels, not fake screenshots or decorative product substitutes. Preserve every qualification and source anchor.
- **Ask:** share the same palette, typography, and alignment. Lead with the question field and three examples; topics and separate model controls remain disclosures. Show the complete first relevant passage near its exact source link, with all matched original context still accessible. Results and follow-ups should read as evidence, not chat bubbles.
- **Optional models:** preserve separate explicit choices, approximately 40 MB and 300 MB disclosures, cancellation, fallback, cache controls, and query privacy. The experimental answer mode selects original passages; it is not an accepted free-form conversational assistant. Technical details remain in “How this works” and the case study.
- **Activity and sharing:** calendar data and refresh behavior are unchanged. Empty tiles are outlined, and active tiles use a sequential green scale. The favicon and authored social image follow the same identity. Re-render the JPEG from its SVG with `node scripts/render-social.mjs` using the installed Chromium browser.

## Operating boundaries

Keep Astro, TypeScript, typed public Markdown, and CSS. Preserve zero-cost static GitHub Pages hosting under `/portfolio/`, document CSP/referrer metadata, script-free ordinary pages, and `/ask/` as the sole interactive route. No new service, account, model API, dependency, or paid resource is part of this redesign.

The public collections, retrieval algorithms, pinned models, evaluation inputs, and historical RAG results are unchanged by this pass. Employer and founder attribution remain separate. No private data, new achievement, invented metric, screenshot, client, or testimonial is introduced. The owner alone marks personal learning review progress.

## Visual review and reproduction

Use Node 24. Start the existing production-path preview:

```sh
SITE_URL=https://the-anantkumar.github.io SITE_BASE=/portfolio npm run build
npm run preview -- --port 4321
```

Capture the same routes and search states:

```sh
CAPTURE_WIDTHS=1440,768,390,320 node scripts/capture-design.mjs minimal-before
CAPTURE_WIDTHS=1440,768,390,320 node scripts/capture-design.mjs minimal-after
```

The original baseline is already saved; use a new phase name rather than overwriting it during later work. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` if needed. `TEST_URL` overrides the local preview address. Screenshots are ignored review artifacts and must never be copied into `dist/`.

The sequence matters: inspect the current rendered pages, implement the shared foundation and homepage, inspect that result, then propagate to case studies and Ask. The intermediate reviewed images are in `minimal-foundation/`. Final review covers homepage, all four projects, Ask entry, evidence, no-match, model disclosures, and keyboard focus at all four widths. Screenshots establish visual quality; the existing browser suites separately check keyboard, reduced motion, no JavaScript, overflow, accessibility, source integrity, opt-ins, and fallback.

Run `npm run check`, the production-path build, `npm test`, `npm run test:browser`, `npm run test:rag:browser`, and `npm run test:learn`. This presentation-only pass does not require new model downloads or rebenchmarking model quality. Physical-phone inference remains unmeasured.

## Handoff

Small commits separate the foundation, homepage, activity figure, project reading experience, Ask, social identity, checks, and study material. These are review boundaries; the complete final checkpoint is the checked implementation. See [verification](verification.md) and [release checkpoints](release-checkpoints.md) for exact results and revisions.

Keep changes on `pilot`. Publishing requires the release PR and successful existing CI, followed by an authorized merge to `main` and exact-commit hosted verification. No production deployment is part of this visual redesign.
