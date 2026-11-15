# Learning AI through portfolio search

The first AI feature helps a reader find related passages in the portfolio. It does not invent a biography, write a conversational answer, or verify the premise of a question. Start with word matching, then choose **Enable meaning-based search** on `/ask/` to use an embedding model on your device.

You can learn the main parts of an AI retrieval system here without a backend, API key, paid inference, or a Hugging Face account.

## Follow one question

Try: “How does Anant make sure a replacement data pipeline produces the same results?”

```text
Public Markdown -> complete passages -> precomputed passage vectors
                                                |
Question -> word matching -----------------------+-> ranked passages + sources
         -> optional local embedding model -----+
```

Word matching looks for shared vocabulary. An embedding model can associate differently worded ideas, such as “same results” and “production/test parity.” Whether it succeeds on a particular question is something to test, not assume.

The portfolio supplies the facts. The model supplies a way to compare text. We have not trained or fine-tuned a model on Anant's resume.

## The concepts, in this repository

| Concept | Meaning here | Where to look |
| --- | --- | --- |
| Corpus | The collection of searchable public text: currently 38 passages. | `src/lib/knowledge.ts` |
| Chunking | Dividing content into useful passages while keeping qualifications and attribution together. | The corpus builder's section handling |
| Token | A piece of text recognized by the model, which may be smaller than a word. | Token-length checks in `scripts/build-semantic-index.mjs` |
| Embedding | A list of 384 numbers representing a passage or question for comparison. | `src/data/search-vectors.json` |
| Inference | Running an already trained model on new input, here a visitor's question. | `src/scripts/embedding-worker.ts` |
| Retrieval | Finding relevant stored passages. It does not write new prose. | `src/lib/retrieval.mjs` |
| Evaluation | Checking outputs against explicit expectations on repeatable questions. | `scripts/search-cases.json` and `scripts/evaluate-search.mjs` |

Chunk size matters. A passage about nonproduction QA must keep the word “nonproduction.” Cutting it away could turn a limited test result into a production claim. Our index builder checks that each model input, including its title and context, fits within 256 tokens. The current 38-passage index has a longest input of 153 tokens. When a passage exceeds the limit, split it thoughtfully instead of silently truncating away qualifications. The underlying model card describes this short-text limit. [MiniLM model card](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)

## What the model does

We use `Xenova/all-MiniLM-L6-v2` at revision `751bff37182d3f1213fa05d7196b954e230abad9`. Pinning the revision means the model files do not silently change when the upstream repository changes. `q8` means quantized weights: model values use a smaller representation to reduce download and memory needs. This can affect quality, so evaluate the exact configuration you ship. The public model is Apache-2.0 licensed. [Pinned model repository](https://huggingface.co/Xenova/all-MiniLM-L6-v2/tree/751bff37182d3f1213fa05d7196b954e230abad9)

The model produces representations for tokens. **Mean pooling** combines them into one passage vector. **L2 normalization** scales that vector to unit length. We use the same settings for passages and questions; otherwise comparisons would be inconsistent. These are inference settings, not a training process.

**Cosine similarity** compares the directions of two vectors. Higher similarity can help identify related text. A value of 0.8 does not mean “80% correct,” and similarity does not prove that a passage answers a question. The UI deliberately does not display confidence percentages.

Our hybrid retriever combines the order of semantic matches with the order of word matches using reciprocal-rank fusion. This avoids adding unlike raw scores as if they had the same meaning. A similarity threshold can reject weak matches. Raising it may reduce irrelevant results while missing useful ones; lowering it has the opposite tradeoff. Tests should guide that setting.

## Why there is no hosted LLM

An embedding model creates vectors. A generative large language model, or LLM, writes text. The current feature uses the first kind and returns the actual source passages. That is a useful AI capability in its own right, with a much smaller download than many browser LLMs.

Hugging Face model-file hosting and hosted model execution are different services. Official terms checked on **2026-11-07** show:

| Service | Current constraint | Fit for this portfolio |
| --- | --- | --- |
| CPU Basic Spaces | Hardware has no hourly fee, but creating a new Gradio/Docker compute Space requires a paid plan. Static Spaces remain free. | Does not satisfy a new zero-dollar hosted backend. [Spaces overview](https://huggingface.co/docs/hub/spaces-overview) |
| ZeroGPU | Free personal accounts in good standing, with verified email and age over 30 days, may host two Gradio Spaces. Anonymous use has two GPU minutes daily; free signed-in accounts have five, with queues. | Possible later demo for an eligible account, with fallback required. [ZeroGPU](https://huggingface.co/docs/hub/spaces-zerogpu) |
| Inference Providers | Free accounts receive no included inference credits; credits must be purchased. | Excluded by the zero-money constraint. [Pricing](https://huggingface.co/docs/inference-providers/pricing) |

CPU Basic sleeps after 48 hours of inactivity and wakes when visited; the docs do not promise a cold-start time. ZeroGPU API calls made with one account's token consume that account's quota, while anonymous requests have stricter shared limits. These are not grounds for promising an always-on, unlimited free LLM endpoint. Terms can change, so recheck before choosing a hosted service. [Space sleep behavior](https://huggingface.co/docs/hub/spaces-gpus), [Spaces API quotas](https://huggingface.co/docs/hub/spaces-api-endpoints)

The browser implementation keeps inference compute on the visitor's device. Transformers.js `4.3.2` and its runtime dependencies are pinned in the lockfile. It runs a single-thread CPU WebAssembly backend inside a worker, so the page can stay responsive without requiring WebGPU or cross-origin isolation headers. Full upstream license notices for Transformers.js, ONNX Runtime, and model assets are published in `public/ai-notices/`. [Transformers.js implementation and license](https://github.com/huggingface/transformers.js)

One practical dependency lesson: passing a model revision is not enough if a library also makes metadata requests without that option. We explicitly create `AutoModel`, `AutoTokenizer`, and `FeatureExtractionPipeline`, pin the library's remote URL template, and reject model requests outside that revision's root. Both the indexing script and the browser worker must use the same model configuration.

## Download, privacy, and failure behavior

No model or inference runtime downloads until the visitor opts in. The optional assets total about 40 MB uncompressed: about 23 MB of weights, 14 MB of WebAssembly, and worker/runtime files. Compression and cache change the bytes transferred; device speed affects inference. The current Ask HTML, CSS, bootstrap, and corpus total about 23 KB gzip before optional model use. See the [measured artifact sizes and enforced budgets](architecture.md#performance-and-delivery-contract) for the separate size categories.

The committed browser smoke test on 2026-11-07 measured a 4,355 ms cold model load, a 131 ms first question, a 58 ms subsequent question, and a 209 ms model reload using cached weights. It reported roughly 37.6 MB of cold response bodies, excluding a worker response size that Chromium reported as zero. Keep the rounded 40 MB disclosure. These are individual samples on desktop Chromium at a 390px viewport, not physical-phone measurements or latency percentiles. A warm reload made no Hugging Face weight requests, but the local server re-served WebAssembly; cached weights do not guarantee zero network transfer.

Questions stay in browser memory. They are not sent to a server, placed in the URL, logged, or saved in persistent storage. Downloading model files still sends normal network information to Hugging Face and its delivery infrastructure. The browser can cache model files and can later evict that cache. This feature does not promise permanent offline availability.

The worker's model-download guard is implemented in application code. The document's CSP does not enforce that guard for the HTTP-served worker, and GitHub Pages cannot set a custom worker CSP header. See the [worker and hosting limits](architecture.md#worker-and-hosting-limits) before changing network or security claims.

Canceling stops the worker and keeps word matching usable. Failed model loads, unsupported devices, and query timeouts also fall back. Once corpus data has loaded, word matching can continue without more network requests in that page session. Without JavaScript, the page presents links to work, experience, about, and contact.

## Make a change and evaluate it

1. Edit public Markdown. Keep employer and founder work distinct, and retain dates, sources, and scope around metrics.
2. Run `npm run index:search`. This explicitly builds the public corpus, loads the pinned model when needed, and regenerates passage vectors plus public evaluation-question vectors using native CPU inference under Node 24. It does not process visitor questions.
3. Review the vector and content changes together. A corpus hash ties the index to the exact public text and embedding settings. An ordinary build fails on stale or incompatible vectors rather than silently using them.
4. Run `npm run check`, `npm run build`, `npm test`, and `npm run test:browser` with Node 24. Normal CI builds verify committed vectors without downloading the model.
5. Evaluate both retrieval modes against the same questions:

```sh
# Default word matching only
node scripts/evaluate-search.mjs

# Word matching and hybrid retrieval, using saved public question embeddings
npm run test:search
```

The initial checkpoint evaluation on **2026-11-07**, using `npm run test:search` and the [committed question cases](../scripts/search-cases.json), contains **74 questions**. A retrieval hit means that at least one expected original passage appears among the top three results:

| Question group | Word matching | Hybrid retrieval |
| --- | --- | --- |
| Development: 43 answerable questions | 39/43 (90.70%) | 42/43 (97.67%) |
| Challenge: 6 answerable questions | 0/6 | 3/6 |
| Scope: 3 questions requiring qualifications | 3/3 | 3/3 |
| Unsupported: 22 examples | 22/22 rejected | 22/22 rejected |

The unsupported group contains 15 development and 7 challenge questions. Challenge questions were independently written before the fixes, which helped expose weaknesses missed by the first tests. We then used them during debugging. They are now useful regression examples, but no longer a held-out evaluation. The small challenge set still shows that a high development score does not establish reliable retrieval for new wording.

For example, we fixed matching between “validate” and “validation,” kept Nielsen-specific questions within Nielsen evidence, and gave precise word matches priority. A bounded semantic fallback can recover a paraphrase when its leading match is clearly separated from the alternatives. This improved the measured cases without treating a similarity threshold as proof of truth.

At that initial checkpoint, hybrid retrieval missed the LinkedIn-profile question and three challenge cases: “checking millions of records,” the complete product assumption and what remains unproven, and generic portfolio wording about taking an idea through release. A related paragraph can be an incomplete result when a question needs both a product hypothesis and its outcome. These misses make the next improvement concrete: inspect the missing evidence and ranking before changing the model or adding generation.

These figures are top-three evidence recall, not generated-answer accuracy. They do not prove that every returned passage is relevant or that all unsupported questions will be rejected. The 22 passing rejection examples are regression checks, not a guarantee about unseen requests.

Try adding questions in your own words before changing ranking. Include a question whose answer is absent, a paraphrase, and a misleading premise. Check whether the result keeps “nonproduction,” “evaluated runs,” or “implementation pending” where those limits matter. Keep new questions aside while tuning, then run them as a held-out check. Repeatedly tuning against one small fixture set can overfit it.

## November 15: improve the evidence before changing the model

We kept the same model and weights. The improvements are in how we describe, match, and return the public evidence:

- Public contact titles name the available email and LinkedIn channels. A question about a profile can now match the source's label as well as its body.
- “Records” and “rows” share a lexical term. The displayed quote keeps the original measurement and its qualifications.
- “In this portfolio” describes the search location. Query preprocessing removes that locator phrase, so it does not dominate the embedding. A direct question such as “Why does this portfolio use Astro?” is preserved. Both the browser worker and indexing script use preprocessing version 2.
- A product hypothesis and its current outcome stay together. Showing an assumption while omitting “still requires measurement” would weaken the evidence. The retriever adds the original problem and outcome sections, each with its own source link.
- No-match feedback distinguishes public-content boundaries from weak word overlap. The optional AI help control focuses the download disclosure; it never starts a download automatically. Editing the question hides the previous results.

This is an example of improving an AI product through content and retrieval engineering without retraining its model.

### Measure completeness and unseen wording

The evaluator accepts `expectedAll` for questions that require multiple sources. Finding one of those sources is insufficient. A partial bundle fails the completeness check. Returning nothing is counted as a recall miss, rather than being treated as a fabricated or partial answer.

We froze 16 fresh questions in commit `e7be182`, before the ranking changes. The first evaluation ran after freezing the initial revision. A later browser check exposed a failure on an existing regression question, and required a source-group fallback. The reserved results were already visible by that point, though they were not used to choose the fallback. Final reruns are regression evidence; collect another unseen set before the next tuning round.

Results on **2026-11-15**, from `npm run test:search`:

| Group | Word matching | Hybrid retrieval |
| --- | --- | --- |
| Development, 43 answerable | 40/43 | 43/43 |
| Previous challenge, 6 answerable | 1/6 | 6/6 |
| Reserved, 8 answerable | 3/8 | 8/8 |
| Scope, 5 questions | 5/5 | 5/5 |
| Unsupported/privacy, 28 questions | 28/28 rejected | 28/28 rejected |

The hybrid path returns both required passages for the two completeness cases. Word matching abstains on those cases. Hits mean expected evidence appears in the top three; these figures do not establish that every returned passage is relevant or that future questions will work equally well.

Run just the reserved set with `npm run test:search:holdout`. Its file name is retained for provenance; it is now a reusable regression set. `npm run index:search` regenerates vectors for both suites, and ordinary `npm test` runs both using committed vectors without downloading a model.

### Run the browser's actual model too

Native CPU and browser WebAssembly use different quantized inference kernels. A diagnostic on the product-assumption question produced vectors with cosine agreement around 0.992, yet the leading source's score shifted from about 0.409 to 0.390. That crossed the old 0.4 eligibility cutoff. A good native evaluation therefore did not establish that the browser returned the same evidence.

The bounded fallback now considers whether the two leading sections belong to the same source and are separated from other sources, with meaningful word overlap. The global cutoff remains unchanged. This is a ranking heuristic, not a factual-confidence measure.

`TEST_AI_MODEL=1 npm run test:browser` now exercises all 90 questions through the real browser worker, checks original text and source identity, and requires complete evidence. On desktop Chromium at a 390px viewport it passed 57/57 answerable questions, 5/5 scope cases, and 28/28 unsupported cases. The same run measured 3,350 ms cold model readiness, 141 ms for the first question, 48 ms for a subsequent question, and 310 ms to reload using cached weights. Reported cold response bodies were about 37.6 MB, excluding an unreported worker body. These are individual desktop samples, not physical-phone results or latency percentiles.

Physical-phone testing remains outstanding. Use a secure preview of the same revision or phone-localhost USB forwarding, then record the device, browser version, initial download, cached reload, question time, cancellation, and word-matching fallback. Do not infer those results from a narrow desktop viewport.

## What generated answers would add later

Retrieval-augmented generation, or RAG, would add an LLM after retrieval:

```text
Question -> retrieve public passages -> give passages to an LLM
         -> generated answer with verified citations
```

That would require a separate decision about model download or genuinely free inference, plus tests for unsupported claims, invented facts, citation correctness, prompt injection, latency, and failure fallback. A citation alone does not prove an answer is supported by its source. No RAG or LLM generation is enabled for visitors. A separate local screening experiment is recorded below.

For now, the practical learning loop is: inspect the corpus, ask a question, inspect the returned evidence, add a test for what went wrong, and make one measured retrieval improvement.

## Portfolio navigator

The interface now has two deliberate ways to reach the same public evidence. A topic or guided follow-up selects known sources directly; a free-text question uses retrieval. Both render compact source cards whose summaries are already authored in the public portfolio. Each card contains expandable complete original evidence and source links.

| Path | How it chooses evidence | Model needed |
| --- | --- | --- |
| Topic and guided follow-up | Explicit public passage IDs validated during the build | No |
| Word matching | Shared vocabulary and the existing ranking rules | No |
| Meaning-based search | A local question embedding plus word matching | Optional opt-in download |
| Generated answer | A future model would compose prose from retrieved evidence | Separate experiment |

For example, the guided question about trlr's hypothesis opens both the problem and current outcome. It cannot silently select only the optimistic half of the story. A free-text question still needs to find that evidence through ranking. These paths share source text but have different selection behavior, and the interface labels guided exploration explicitly.

This distinction is useful product engineering: a known destination can be fast and predictable, while AI helps when a visitor brings unfamiliar wording. Neither path needs a backend or persistent visitor history. Changing from a topic to a typed question also tests ordinary asynchronous application design: a slow earlier result must never overwrite the visitor's newer action.

The [PRD](portfolio-navigator-prd.md) defines the accepted scope, and [the verification record](verification.md#portfolio-navigator-15-november-2026) records its browser and source-integrity checks. Natural-language answer generation remains a later decision.

## Revisit components and learn from a failed generation candidate

Use [the learning tracker](learning-tracker.md) as the study path. `npm run learn` opens a local component explorer after you build the site; follow its loopback URL. Each component has inputs, outputs, implementation links, a small exercise, and an explanation to practice. Six saved examples run the actual retriever with committed question vectors during lab generation. Replaying them does not embed a new question or download a model. A checkbox records only your own review action, not a claim of mastery.

On 15 November we screened a separate 135-million-parameter instruction model. An embedding model turns text into numbers for comparison; this instruction model predicts new tokens from a prompt. We supplied the correct public sources directly to separate generation quality from retrieval quality. The candidate passed 0/8 automated checks in native and browser runs, and manual review confirmed source-fidelity failures. It changed pending work into completed work and contradicted a validation result. A better search score cannot fix that transformation.

This is why RAG needs separate gates: finding evidence, preserving its meaning when writing, and running acceptably on real devices. Citation syntax checks are useful but cannot establish that a sentence follows from its source. The browser also behaved differently from the native runtime on some cases, so a native-only test would have hidden repetition and scope failures. A 137 MB quantized weight file also does not describe total download or working memory. Quantization stores weights at lower precision; it does not guarantee accurate answers or phone suitability.

Read the [contract and reproduction commands](../experiments/generation/README.md) and [safe reviewed findings](../experiments/generation/results-summary.json). The eight questions are a screening set, not an unseen benchmark. The candidate was rejected, and the fast evidence navigator remains the visitor feature. The next candidate or prompt needs fresh questions frozen before tuning and a measured physical-phone budget. No paid service or hosted inference account was introduced.
