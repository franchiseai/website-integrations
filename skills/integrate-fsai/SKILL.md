---
name: integrate-fsai
description: Build or restyle a headless FranchiseAI Funnel integration or Portal enrollment prototype in a coded React or Astro website. Use for embedded franchise enquiries and applicant signup, not general website design.
---

# FranchiseAI website integration

Read [getting started](references/getting-started.md) to select the integration. Determine Funnel versus Portal from supplied platform configuration; ask if unclear. The website owns all markup/styles. Use the documented controller/hook and keep one stable controller per enquiry.

- **Funnel:** npm `@franchiseai/website-integrations` 0.1.0 supports the qualification flow. Read [contract](references/contract.md) and [development](references/development.md); start with `/demo`. Read [going live](references/going-live.md) when a published selector, API base URL and live-test authorization are supplied. Preserve published fields, page boundaries, server decisions, optional SMS consent and secure email continuation.
- **Portal:** read [Portal enrollment](references/portal.md). Use the repository example and its experimental demo export; it is not in npm 0.1.0 and no live Portal adapter exists. Preserve initial details and optional marketing consent, **email/password signup with email confirmation**, Google/LinkedIn alternatives and a simulated hosted Applicant Portal handoff. Keep passwords transient. Provider cancellation, mismatched email, existing accounts and expired proof need explicit recovery; never silently merge identities. Do not treat the draft OpenAPI or a client-side simulation as working authentication.

Follow [development](references/development.md) for scenario checks and [troubleshooting](references/troubleshooting.md) for failures. Use fake details and a throwaway password for prototypes. Keep passwords/credentials out of saved drafts, browser storage, logs, analytics and recordings. Demo completion is not proof of live email delivery or identity verification.

The complete guide is also at https://franchiseai.github.io/website-integrations/llms-full.txt. Published package documentation describes that release; repository/web docs explicitly mark experimental additions. Do not infer that a web-documented prototype exists in an older installed package.
