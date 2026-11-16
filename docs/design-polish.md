# Visual and UX polish, 17 November 2026

Development branch: `pilot`. This pass refines presentation and the existing visitor journey. It does not promote the experimental answer model or deploy the site.

## Direction

Keep the dark spectral identity, lavender accent, and prism illustration. Use a stronger editorial hierarchy: a clear introduction, one featured engineering case, compact independent projects, and supporting experience and activity. Shared typography, spacing, links, and focus states connect the pages. The prism is decorative illustration; project visuals are explicitly described public workflow diagrams, never product screenshots.

The first screen connects the introduction to Anant's Nielsen validation work: approximately 7 million rows across 28 checks in one parallel run, with a direct source link. Employer contributions remain attributed to work within a wider team. trlr remains founder work with unvalidated prediction superiority.

## Screenshot-based review

The in-app browser was unavailable. The repository's Chromium test setup captured and exercised the actual production-path build. Before images were taken before source edits were built, at 1440 × 1000 and 390 × 844. The initial capture exposed a lazy-image issue in full-page screenshots; those blank captures were rejected and replaced with the already captured browser-suite images showing the loaded calendar. The capture manifest records this provenance. The repeatable capture now decodes lazy images before accepting them.

1. **Homepage → selected work: improved.** Before: three similarly large project rows, decorative product substitutes, and a large calendar before experience. After: Nielsen is the featured employer case; trlr, Codeforces, and the portfolio/search project use concise supporting rows. The calendar sits after experience and biography. Ask has a first-screen link and a dedicated invitation.
2. **Case study → original context: improved.** Before: tall facts, metrics, and decorative visuals delay the body. After: compact facts, a clear scope note where needed, readable prose, and an explanatory margin diagram. Desktop contents links and a native mobile contents disclosure preserve navigation without JavaScript. All existing source qualifications remain.
3. **Ask → question: improved.** Before: a large introduction, six topics, three long examples, and model controls compete. After: compact introduction, three short examples, optional topic disclosure, and model controls following results. The question field starts at 425 px rather than 611 px on desktop and 375 px rather than 471 px on mobile in the captured viewports.
4. **Question → evidence → source: improved.** Before: generic card summaries are visible while the matched source is collapsed. After: the complete first matched passage is visible with its exact source link above it. The full matched set remains in a native disclosure; follow-up questions continue the journey. No quotation is truncated to manufacture a stronger claim.
5. **Optional models and fallback: retained and clarified.** Separate explicit choices disclose approximately 40 MB for meaning search and approximately 300 MB for the experimental selector. Cancellation, failure recovery, and original evidence remain available. A return-to-evidence link connects the secondary controls to results. “How this works” links to the case study and learning material.

Screenshots alone do not establish accessibility or interaction correctness. Committed browser checks also cover keyboard use, reduced motion, no JavaScript, 320 px wrapping, source navigation, opt-in boundaries, cancellation, and fallback. Physical-phone inference and general model quality are outside this presentation pass.

## Implementation map

| Concern | Where to read | Why |
| --- | --- | --- |
| Shared hierarchy and restrained motion | `src/styles/global.css`, `src/layouts/Base.astro` | One coherent foundation instead of accumulated overrides; one small moving glow and one slow decorative ring |
| Homepage story | `src/pages/index.astro` | Featured employer work, independent projects, visible Ask route, supporting GitHub calendar |
| Case studies and accurate diagrams | `src/pages/projects/[slug].astro`, `src/styles/case-study.css`, `src/components/ProjectVisual.astro` | Read the problem early; retain role, tradeoffs, scope, and original sources |
| Question and evidence journey | `src/pages/ask.astro`, `src/styles/ask.css`, `src/scripts/ask.ts` | Full first passage visible; complete context and optional models remain accessible |
| Repeatable visual evidence | `scripts/capture-design.mjs` | Same routes, viewports, and states, with verified lazy images and no model opt-in |
| Historical learning evidence | `experiments/rag/corpus-2026-11-17.json`, `scripts/learning-lab.mjs` | Replay measured RAG results against their original public input, even when later editorial changes update the live corpus |

The portfolio case study's old “Future search” heading is now “Search today and next.” Its old fragment remains an alias. The guided source ID and public vectors were regenerated together. Retrieval algorithms and pinned model configurations are unchanged. The historical RAG results were not rewritten or reevaluated by this design pass.

## Reproduce the review

Use Node 24 and the installed Chromium browser:

```sh
npm run check
SITE_URL=https://the-anantkumar.github.io SITE_BASE=/portfolio npm run build
npm run preview -- --port 4321
```

In another terminal:

```sh
node scripts/capture-design.mjs after
CAPTURE_WIDTHS=1440,390,320 node scripts/capture-design.mjs after
npm test
npm run test:browser
npm run test:rag:browser
npm run test:learn
```

If Chromium is installed outside Playwright's default location, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. `TEST_URL` can override the preview address, and `TEST_SCREENSHOT_DIR` can override the artifact directory. Screenshots, capture manifests, and test logs stay in ignored `artifacts/design-polish/`.

The capture records the homepage, four case studies, Ask entry, a sourced result, no-match feedback, expanded model disclosures, and keyboard focus. It does not enable either model. The default browser suites exercise model lifecycle behavior without depending on remote hosting. Separate explicit real-model checks are described in the README.

## Handoff

Small commits isolate the shared foundation, homepage story, diagrams, case studies, Ask presentation, browser checks, editorial/index update, historical replay inputs, and learning notes. They are review/backtracking boundaries, not independently deployable releases. See `docs/release-checkpoints.md` for exact revisions and `docs/verification.md` for final measurements.

Publishing remains a separate owner decision: review `pilot`, open or update its release PR to `main`, allow the existing public-repository CI guards to run, then merge and verify the exact hosted revision. No paid service, new backend, account, or model API is needed.
