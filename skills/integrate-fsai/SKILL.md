---
name: integrate-fsai
description: Build or restyle a headless FranchiseAI qualification flow in a coded React or Astro website using @franchiseai/website-integrations. Use for embedded franchise enquiries, not general website design.
---

# FranchiseAI qualification integration

The versioned documentation is the contract. Read [getting started](references/getting-started.md) and [state/actions and presentation rules](references/contract.md). For demo scenarios read [development](references/development.md); for a configured live funnel read [going live](references/going-live.md). Use [troubleshooting](references/troubleshooting.md) when behavior is unexpected.

Install `@franchiseai/website-integrations`. Build with the `/demo` adapter until the user supplies a published funnel selector and API base URL for a live integration. The agency owns all markup/styles; use the package controller and actions rather than reimplementing its workflow. The full example renderer is linked from getting started.

Preserve published questions, required fields, page boundaries, server decisions and explicit optional SMS consent. Never place application credentials in URLs, HTML, logs or analytics. Current continuation requests a secure email. Verify all documented states, keyboard input and mobile presentation; distinguish demo validation from live configuration/email verification.

The same docs are available at https://franchiseai.github.io/website-integrations/llms-full.txt. If using a different package version, prefer that installed version's Markdown documentation over the latest web guide.
