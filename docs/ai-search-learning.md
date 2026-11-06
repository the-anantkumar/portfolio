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

No model or inference runtime downloads until the visitor opts in. The optional assets total about 40 MB uncompressed: about 23 MB of weights, 14 MB of WebAssembly, and worker/runtime files. Compression and cache change the bytes transferred; device speed affects inference. The current Ask HTML, CSS, bootstrap, and corpus total about 22 KB gzip before optional model use. See the [measured artifact sizes and enforced budgets](architecture.md#performance-and-delivery-contract) for the separate size categories.

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

The local repository evaluation on **2026-11-07**, using `npm run test:search` and the [committed question cases](../scripts/search-cases.json), contains **74 questions**. A retrieval hit means that at least one expected original passage appears among the top three results:

| Question group | Word matching | Hybrid retrieval |
| --- | --- | --- |
| Development: 43 answerable questions | 39/43 (90.70%) | 42/43 (97.67%) |
| Challenge: 6 answerable questions | 0/6 | 3/6 |
| Scope: 3 questions requiring qualifications | 3/3 | 3/3 |
| Unsupported: 22 examples | 22/22 rejected | 22/22 rejected |

The unsupported group contains 15 development and 7 challenge questions. Challenge questions were independently written before the fixes, which helped expose weaknesses missed by the first tests. We then used them during debugging. They are now useful regression examples, but no longer a held-out evaluation. The small challenge set still shows that a high development score does not establish reliable retrieval for new wording.

For example, we fixed matching between “validate” and “validation,” kept Nielsen-specific questions within Nielsen evidence, and gave precise word matches priority. A bounded semantic fallback can recover a paraphrase when its leading match is clearly separated from the alternatives. This improved the measured cases without treating a similarity threshold as proof of truth.

Hybrid retrieval still misses the LinkedIn-profile question and three challenge cases: “checking millions of records,” the complete product assumption and what remains unproven, and generic portfolio wording about taking an idea through release. A related paragraph can be an incomplete result when a question needs both a product hypothesis and its outcome. These misses make the next improvement concrete: inspect the missing evidence and ranking before changing the model or adding generation.

These figures are top-three evidence recall, not generated-answer accuracy. They do not prove that every returned passage is relevant or that all unsupported questions will be rejected. The 22 passing rejection examples are regression checks, not a guarantee about unseen requests.

Try adding questions in your own words before changing ranking. Include a question whose answer is absent, a paraphrase, and a misleading premise. Check whether the result keeps “nonproduction,” “evaluated runs,” or “implementation pending” where those limits matter. Keep new questions aside while tuning, then run them as a held-out check. Repeatedly tuning against one small fixture set can overfit it.

## What generated answers would add later

Retrieval-augmented generation, or RAG, would add an LLM after retrieval:

```text
Question -> retrieve public passages -> give passages to an LLM
         -> generated answer with verified citations
```

That would require a separate decision about model download or genuinely free inference, plus tests for unsupported claims, invented facts, citation correctness, prompt injection, latency, and failure fallback. A citation alone does not prove an answer is supported by its source. No RAG or LLM generation is implemented here yet.

For now, the practical learning loop is: inspect the corpus, ask a question, inspect the returned evidence, add a test for what went wrong, and make one measured retrieval improvement.
