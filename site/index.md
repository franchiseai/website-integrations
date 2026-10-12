---
layout: home
---

<section class="prompt-hero" aria-labelledby="add-it-to-your-website-in-one-prompt">

<div class="prompt-intro">
<p class="prompt-eyebrow">FS AI AGENCY <span>/</span> WEBSITE INTEGRATIONS</p>
<h1 id="add-it-to-your-website-in-one-prompt">Add it to your website.<br><span>In one prompt.</span></h1>
<p class="prompt-description">Open your website project. Give your agent the prompt. Make it yours.</p>
</div>

<div class="agent-prompt">

```text
Add a FranchiseAI qualification flow to this existing website.

First read https://franchiseai.github.io/website-integrations/llms-full.txt and inspect this project's framework, routes, components and design system. Use @franchiseai/website-integrations and its documented controller/hook API. Check React 19 compatibility before installing; don't silently upgrade the site's framework.

Build the flow into the site's existing enquiry journey, reusing its typography, spacing, components and tone. Keep the UI fully custom and responsive. Use the docs' React/Astro setup and example renderer; preserve configured questions, validation, optional consent, server-controlled outcomes and secure email continuation. Include accessible labels, keyboard focus, progress, back navigation, pending states and recoverable errors.

Start with the demo adapter. Verify qualified, not-qualified, returning-visitor, loading-failure and save/progress-retry scenarios without creating real leads or sending email. Keep one stable controller per enquiry and keep credentials out of URLs, browser storage and logs.

Make the demo work end to end, run the project's relevant checks, and show me the result. Then explain the exact live configuration still needed. Connect the live adapter only when I provide the API base URL and published funnel slug or host and authorize a live test. Don't invent endpoints, qualification rules or an applicant-portal login, and don't deploy the site automatically.
```

</div>

<div class="prompt-steps"><span><b>01</b> Copy the prompt</span><span><b>02</b> Paste into your coding agent</span><span><b>03</b> Preview it in your site</span></div>

</section>

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
