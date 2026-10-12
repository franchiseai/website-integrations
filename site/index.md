---
layout: home
hero:
  name: Website integrations.
  text: '<span>Your design. Connected.</span>'
  tagline: Build unmistakable customer websites with the qualification flow already handled. One package. Complete creative control.
  actions:
    - theme: brand
      text: Start building →
      link: /getting-started
    - theme: alt
      text: Explore the API
      link: /api.html
      target: _self
    - theme: alt
      text: Try the playground ↗
      link: /playground/
      target: _self
features:
  - title: Your markup. Your rules of style.
    details: Compose the complete experience in React or Astro. No embedded frame, mandatory components or injected CSS.
    link: /contract
    linkText: Understand the contract
  - title: Give your agent the context.
    details: Typed APIs, readable Markdown, a single context file and an optional installable skill. Same documentation, however you build.
    link: /development
    linkText: See the development tools
  - title: Design without live data.
    details: Switch between qualified, returning and recovery scenarios. The demo creates no leads and sends no email.
    link: /playground/
    target: _self
    linkText: Try both designs
---

## Install once. Make it your own.

```sh
npm install @franchiseai/website-integrations react@^19 react-dom@^19
```

Start with the [React/Astro guide](getting-started.md), then connect your [published funnel](going-live.md). The package handles validation, lead capture, configured page saves and server-controlled qualification. You own every pixel.

## Built for people and their agents

Give your agent [the complete plain-text guide](/llms-full.txt), or install the optional skill:

```sh
npx skills add franchiseai/website-integrations --skill integrate-fsai
```

The [OpenAPI 3.1 document](/openapi.json) and <a href="/website-integrations/api.html" target="_self">Redoc API reference</a> describe the existing public HTTP endpoints. Website developers should generally use the package rather than reimplementing the workflow.

Version 0.1 covers qualification and secure email continuation. Enquiries are held in memory; provision and verify the customer’s live configuration before shipping. [Read the scope and boundaries](contract.md).
