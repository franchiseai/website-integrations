---
layout: home
---

<section class="prompt-hero" aria-labelledby="add-it-to-your-website-in-one-prompt">

<div class="prompt-intro">
<p class="prompt-eyebrow">FS AI AGENCY <span>/</span> WEBSITE INTEGRATIONS</p>
<h1 id="add-it-to-your-website-in-one-prompt">Add FSAi to a site<br><span>In one prompt.</span></h1>
<p class="prompt-description">Funnel or Portal. Your site, your design. Give your agent the prompt.</p>
</div>

<div class="agent-prompt">

```text
Add a FranchiseAI enquiry flow to this existing website.

Read https://franchiseai.github.io/website-integrations/llms-full.txt and inspect this project's framework, routes and design system. Identify whether this is a Funnel brand or a Portal brand from the supplied configuration; ask me if it is unclear. Check React 19 compatibility without silently upgrading the site's framework.

For a Funnel brand: use @franchiseai/website-integrations with its demo adapter and documented qualification controller/hook. Preserve published questions, validation, optional SMS consent, server-controlled outcomes and secure email continuation. Test new and returning visitors, both outcomes, loading failures and save/progress retries.

For a Portal brand: follow https://franchiseai.github.io/website-integrations/portal.md and the repository example. The experimental Portal adapter is not in npm 0.1.0 and has no live backend integration. Build a clearly labelled, network-free prototype: initial details and optional consent, email/password signup with confirmation, or Google/LinkedIn, then a simulated handoff to the hosted Applicant Portal. Keep password capability. Test provider cancellation, different-email recovery, expired links, returning applicants and retries. Never silently merge identities or treat a client-side success state as authentication.

Match the site's existing design using fully custom components. Keep one stable controller per enquiry, with accessible labels, errors, focus, progress, back navigation and pending states. Use fake details and a throwaway password in demos; keep passwords and credentials out of saved drafts, browser storage, logs, analytics and recordings.

Run the relevant checks and show me the working prototype. For Funnel, connect live only with the supplied API base URL, published funnel slug or host, and authorization for a live test. For Portal, explain the backend work and supported release still needed; don't invent endpoints or connect the draft API. Don't deploy the website automatically.
```

</div>

<div class="prompt-steps"><span><b>01</b> Copy the prompt</span><span><b>02</b> Paste into your coding agent</span><span><b>03</b> Preview it in your site</span></div>

</section>

## Choose your integration.

| Brand type | Start here                                                             | Availability                                                                                                                      |
| ---------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Funnel     | [React/Astro setup](getting-started.md) · [Playground](/playground/)   | npm 0.1.0; demo and live adapters. Verify the published customer configuration before launch.                                     |
| Portal     | [Enrollment guide](portal.md) · [Playground](/playground/?flow=portal) | Repository prototype; password/email, Google and LinkedIn are simulated. Backend work and a supported release are still required. |

For **Funnel brands**:

```sh
npm install @franchiseai/website-integrations react@^19 react-dom@^19
```

Start with the [React/Astro guide](getting-started.md), then connect your [published funnel](going-live.md). The package handles validation, lead capture, configured page saves and server-controlled qualification. You own every pixel.

## Built for people and their agents

Give your agent [the complete plain-text guide](/llms-full.txt), or install the optional skill:

```sh
npx skills add franchiseai/website-integrations --skill integrate-fsai
```

The [OpenAPI 3.1 document](/openapi.json) and <a href="/website-integrations/api.html" target="_self">Redoc API reference</a> describe the existing Funnel HTTP endpoints. Portal has a separate [draft OpenAPI contract](/portal-openapi.draft.json); it is not a deployed API. Website developers should generally use the package rather than reimplementing the workflow.

Version 0.1 covers qualification and secure email continuation. Enquiries are held in memory; provision and verify the customer’s live configuration before shipping. [Read the scope and boundaries](contract.md).

## Portal brands, too.

Explore [the Portal enrollment prototype](/playground/?flow=portal): custom initial details, email/password or Google/LinkedIn, then a simulated handoff to the hosted Applicant Portal. Try two designs using the same headless integration.

[Read the Portal guide](portal.md) for the flow, agent prompt and backend requirements. This is a repository-only demo; npm 0.1.0 and the live integration still cover Funnel brands.
