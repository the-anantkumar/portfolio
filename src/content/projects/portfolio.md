---
title: This portfolio
label: An exercise in restraint
summary: A static, content-driven portfolio designed around a zero-cost operating constraint.
role: Portfolio architecture & implementation
category: Web engineering
stack: [Astro, TypeScript, Markdown, CSS]
order: 4
featured: false
visual: portfolio
evidence: Static HTML · No application JavaScript
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
The build checks an initial homepage transfer budget of 300 KB and an initial compressed JavaScript budget of 20 KB. The implementation ships no application scripts. Core navigation and case studies work without JavaScript.

## Future search
The content is structured for later static indexing. Search can be loaded on demand. Browser-local AI remains a separate, optional experiment with explicit download costs and an ordinary-search fallback; no paid inference is connected to this site.

## Delivery
GitHub Pages serves the generated files from this portfolio's public repository. GitHub Actions validates and deploys changes, including scheduled contribution-calendar updates. A custom domain, paid backend, analytics service, and model API are not required.
