---
title: Codeforces POTD
label: A shipped developer tool
summary: A daily coding problem, matched to your level. Less time choosing, more time practicing.
role: Creator · Engineering
category: Browser extension
stack: [JavaScript, Chrome APIs, Codeforces API]
order: 2
featured: true
visual: codeforces
evidence: Featured on the Chrome Web Store
links:
  - label: Chrome Web Store
    url: https://chromewebstore.google.com/detail/codeforces-potd/kdpcekneldcnkajbmabmfgdpcdjdmcfd
---
## The problem
Codeforces offers a large problem library. Choosing a suitable problem every day can get in the way of building a consistent practice habit.

## My contribution
I built a Chrome extension that recommends a daily problem based on a user's Codeforces rating and puts a practice calendar into the workflow they already use.

## Engineering decisions
The extension integrates the Codeforces API with browser capabilities to retrieve user and problem information and present a personalized daily challenge. The current published listing describes streak tracking, progress synchronization, and automatic recognition of solved daily problems.

## Product tradeoffs
The product focuses on a small, repeatable task: choosing the next problem and returning to practice. Its usefulness depends on relevant recommendations and reliable interaction with an external platform, rather than the number of features on screen.

## Evidence
The Chrome Web Store listing checked on **3 November 2026** displayed **2,000 users**, **4.4 out of 5 from 32 ratings**, and **Featured** status. These are a dated snapshot of the listing, not lifetime installs or weekly active users.

[View the source listing](https://chromewebstore.google.com/detail/codeforces-potd/kdpcekneldcnkajbmabmfgdpcdjdmcfd).

## What I learned
A narrow workflow can be a useful product in its own right. Adoption is a signal that people find it useful; stronger claims about retention or learning efficiency require separate measurement.
