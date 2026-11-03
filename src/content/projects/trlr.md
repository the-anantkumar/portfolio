---
title: trlr
label: Founder-led product
summary: Exploring how conversational AI can build a more useful understanding of the person using it.
role: Founder · Product & engineering
category: AI product
stack: [Python, FastAPI, SQLite, GCP]
order: 1
featured: true
visual: trlr
evidence: Product and engineering ownership
links:
  - label: Visit trlr
    url: https://thetrlr.com
---
## The problem
A conversation can contain a great deal of context about a person. The product question behind trlr is whether an AI system can use that context to develop a useful personal understanding—and whether that understanding improves its predictions.

## My contribution
As founder, I own both the product direction and engineering implementation. That means turning a broad product hypothesis into a working conversational experience, defining how it should be evaluated, and carrying the application through deployment.

## Engineering decisions
The application uses a Python and FastAPI backend with persistent state. Reliability matters because an interrupted conversation should not silently lose accepted work or turn a retry into duplicate processing.

The engineering work includes durable conversation workflows, validation, recovery behavior, and comparisons against a baseline. Keeping product behavior and evaluation visible makes it easier to distinguish a working implementation from evidence that the underlying hypothesis is correct.

## Tradeoffs
Persistent state makes recovery possible but also increases the responsibility to handle private information carefully. The public case study therefore describes the engineering approach without exposing personal profiles, conversations, internal prompts, or operational configuration.

Evaluation also adds complexity. A successful deployment demonstrates that the software runs; it does not demonstrate that personalization improves predictions.

## Current outcome
trlr has a deployed application and a public product landing page. Prediction quality and superiority over a baseline still require further measurement. I do not claim validated traction or prediction gains here.

## What this work demonstrates
Product ownership, backend implementation, deployment, and the discipline to test an AI product's central assumption rather than infer success from a functioning demo.
