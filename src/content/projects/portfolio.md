---
title: This portfolio
label: An exercise in restraint
summary: A static, content-driven portfolio designed around a zero-cost operating constraint.
role: Portfolio architecture & implementation
category: Web engineering
stack: [Astro, TypeScript, Markdown, CSS, Transformers.js]
order: 4
featured: false
visual: portfolio
evidence: Static pages · Optional on-device search
links: []
---
## The problem
Present engineering and product work clearly, load quickly, and keep hosting costs at zero. Future AI experiments should not make reading a portfolio expensive or dependent on a model service.

## Architecture
Astro renders typed Markdown content into static HTML at build time. Project cards and detail pages share one content source. Native links provide navigation, and CSS supplies the layout and restrained visual feedback.

## Tradeoffs
A client-rendered application would add a runtime to pages whose main job is to communicate. A dynamic backend would add operational cost without improving the current visitor experience. Static generation fits these constraints directly.

The contact links open email or LinkedIn. The site does not claim to send a message or collect contact-form data.

## Performance contract
The build checks an initial homepage transfer budget of 300 KB. Ordinary pages ship no application scripts. Core navigation and case studies work without JavaScript. A separate Ask page has a 20 KB compressed initial script budget; its optional model loads only after a visitor enables meaning-based search.

## Future search
The Ask page searches only these public Markdown collections and links each result to its source. Word matching works immediately. Optional meaning-based search uses a small embedding model in the visitor's browser, with an explicit first-use download and a working word-matching fallback.

This retrieves original passages rather than generating new answers. Questions stay on the device, and no model API or backend is required. A future conversational model would need separate tests for factual accuracy, unsupported questions, download size, and performance on phones.

## Delivery
GitHub Pages serves the generated files from this portfolio's public repository. GitHub Actions validates and deploys changes, including scheduled contribution-calendar updates. A custom domain, paid backend, analytics service, and model API are not required.
