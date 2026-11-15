# Portfolio navigator product requirements

Help hiring teams explore Anant's experience, projects, and founder work through questions and direct topic navigation. The next release turns the existing evidence search into an approachable portfolio navigator. Visitors should reach a useful source quickly on a phone, without needing to download an AI model.

Status: ready for implementation on `pilot`, 15 November 2026. The scope review below supports proceeding within the existing authorization. Production deployment is a separate release step.

## Audience and problem

Engineering hiring managers assessing MTS 2 / SDE 2+ scope need to understand ownership, technical decisions, outcomes, and limitations. Founders and senior managers also want to see how Anant takes a product from a question to a working implementation.

The current Ask page has reliable retrieval but presents several long passages and a large model-disclosure panel. Visitors must do too much reading before they can choose a direction. It needs clearer navigation and a better relationship between a quick overview and its evidence.

## Product outcome

A visitor can type a question or select Experience, Projects, Founder, Skills, About, or Contact. Results show compact source cards, clear role attribution, relevant section titles, links into the portfolio, and expandable original evidence. Contextual follow-ups lead to explicit related sections rather than guessing what an ambiguous pronoun means.

For example, selecting Founder shows trlr's product and engineering ownership with its evaluation limits. Choosing a follow-up about engineering decisions opens the relevant public evidence. Questions about the product hypothesis retain both the hypothesis and the current outcome.

## Inspiration and identity

[ntropy.dev](https://www.ntropy.dev/) provides the interaction reference: a distinct exploration mode, central question entry, and a topic dock. Keep Anant's dark pink and violet spectrum, rings, system fonts, and accessible motion controls. Use the existing ordinary portfolio as the browse experience. The reference is design inspiration; its backend, voice system, and external LLM APIs are not dependencies.

## Release scope

| Capability | Required behavior |
| --- | --- |
| Entry and exit | `/ask/` is the interactive route. A visible link returns to the normal portfolio. Homepage and case studies remain script-free. |
| Question entry | Retain the 500-character limit, three working example questions, keyboard submission, and a readable loading state. |
| Topic dock | Six labeled buttons work before AI opt-in. Selected state is visible and announced. Selecting a topic uses validated public passage IDs, independent of model availability. |
| Compact cards | Group matching passages by their actual source. Titles, roles, summaries, and technologies come from the typed public collections. Combine Nielsen experience and its case study without mixing employer and founder ownership. |
| Evidence disclosure | Show matched section titles and an explicit disclosure for the complete original passages and their exact source links. Do not shorten a factual paragraph in a way that drops its qualification. Public source summaries are navigation previews, not generated answers. |
| Follow-ups | Show at most three useful actions for the primary source. An action has a complete visible question and resolves explicit related sources. Product evaluation actions include both hypothesis and outcome when applicable. |
| New question | Editing hides stale results and clears the old topic selection. Requests that finish late cannot overwrite a newer question or topic. |
| Optional AI | A compact expandable panel contains the roughly 40 MB download disclosure, explicit enable action, progress, cancellation, and fallback. No topic or follow-up starts a model download. |
| No match | Preserve specific public-content, unsupported-claim, and no-overlap feedback. Optional AI help opens its disclosure without enabling it. |
| No JavaScript | Hide unusable controls and provide real links to work, experience, about, and contact. |
| Query privacy | Keep questions in memory, outside URLs, logs, storage, and network payloads. Index only approved public content; no raw resume or private sources. |

The first source card is prioritized by retrieval or the selected topic. Every card's full evidence remains available on demand. Guided actions are authored navigation; label them as such rather than implying an LLM wrote a response.

## Technical boundaries

Use Astro, typed Markdown, a small browser controller, and the existing embedding worker. Build source-card templates from public collections. Validate topic IDs, follow-up targets, source mappings, and internal URLs during the build. Rendering evidence uses DOM text APIs, never visitor-controlled HTML.

Keep the current model revision and retrieval behavior. Source presentation and topic navigation must not change the embedding index or bypass unsupported-question handling for typed queries. The existing 90-question suite remains the retrieval regression contract.

No new dependency, hosted process, database, paid service, account, analytics, persistent chat history, model API, voice feature, or resume download is required. Natural-language generation and open-ended conversational memory are later experiments with their own cost, accuracy, privacy, and phone-performance decision.

## Acceptance criteria

1. All six topics return their intended sources with word matching available and zero external requests. Founder and employer attribution remains explicit.
2. A repeated set of passages from the same source yields one card with all those passages, preserving their ranking order and text. Each matched section has a working source link.
3. Evidence is collapsed initially, expands by keyboard, and shows complete original text. A qualification in a second paragraph remains in the same disclosure.
4. Follow-up actions resolve valid public sources and preserve multi-source hypothesis/outcome evidence. No stale topic action overwrites a newer typed query.
5. The AI panel is collapsed initially. Enabling requires a separate deliberate action after the disclosure is opened; cancellation and failure leave typed search and topic navigation usable.
6. No-match AI help opens and focuses the disclosure. It creates no worker or model request by itself.
7. Desktop 1440px and mobile 390px/320px layouts have no horizontal page overflow. Controls are labeled, focus is visible, and topic/follow-up targets are at least 44px high. Reduced motion and the existing pause control stop decorative animation.
8. No-JavaScript navigation, keyboard flows, axe checks, and the existing 90-question tests pass. The explicit real-model check also verifies compact evidence rendering against the full original text.
9. Preserve the documented budgets: ordinary output under 300 KB; Ask bootstrap at most 20 KB gzip; Ask HTML/CSS/bootstrap/corpus at most 60 KB gzip; optional runtime JS at most 250 KB gzip; WASM at most 16 MB; vectors at most 200 KB; complete output at most 17 MB.
10. Use Node 24 for `npm run check`, the production-path `npm run build`, `npm test`, and browser checks. Keep ignored screenshots and caches out of Git. Commit and push in coherent phases of one to three files.

## Scope review

The experience can be built with existing public data and static hosting. Approved source summaries provide compact navigation without inventing new claims. Native evidence disclosures preserve full qualifications. Explicit topic and follow-up targets avoid adding ambiguous conversation memory. Model downloads remain optional and isolated from ordinary pages.

Decision: proceed with this navigator release. Physical-phone inference and production-path hosted verification remain release tasks; desktop emulation must not be described as a physical-phone test.

## Implementation phases

1. Record and review these requirements.
2. Add validated topic, source-grouping, and follow-up definitions.
3. Build the central composer, responsive dock, source-card templates, and evidence disclosures.
4. Connect guided navigation, follow-ups, compact search rendering, and model controls.
5. Run retrieval, browser, accessibility, motion, privacy, and performance checks; inspect screenshots and fix failures.
6. Update the learning and verification records, push the remaining small commits, and mark a checkpoint on `pilot`.
