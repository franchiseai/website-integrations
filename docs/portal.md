# Portal brands · prototype

::: warning Repository prototype, not a live integration
Portal enrollment is available in the [playground](/playground/?flow=portal) and the repository's runnable example. It sends no requests, creates no accounts, contacts no providers and sends no email. Use fictional details and a throwaway demo password.

The published **npm 0.1.0 release supports Funnel brands only**. The experimental Portal export exists in the repository distribution, not that npm release. There is no live Portal adapter. The [draft OpenAPI contract](/portal-openapi.draft.json) describes proposed backend work, not available endpoints.
:::

## The journey

A customer website owns every pixel of the initial enquiry. The main site is the brand's hosted Applicant Portal, where authentication finishes and the application continues.

1. Collect name, email, configured signup answers and optional marketing consent.
2. Save a pending intake. The live backend will need to protect that intake independently of account identity.
3. Choose **email and password**, **Google**, or **LinkedIn**.
4. For password signup, create the account without giving the website a Portal session, then confirm the email. For a provider, complete its sign-in and identity checks.
5. Complete the handoff at the canonical hosted Portal and continue with the initial answers attached after ownership is proven.

Password login stays available. Social signup does not require a second password. A verified matching provider email can replace the confirmation-email step; an absent, unverified or different provider email cannot silently claim the original intake.

## Try the prototype

Open [Portal brands in the playground](/playground/?flow=portal). The **Paper** and **Midnight** designs use the same headless controller; switching designs preserves answers. The example uses a fictional Northstar coffee brand. Every layout, label, input and transition belongs to the renderer.

| Scenario                          | What to try                                                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| New applicant                     | Fill details, create a demo password, open the demo inbox, then simulate confirmation into the Portal preview.                        |
| Google or LinkedIn                | Fill details, select a provider, then simulate its return. Cancel first to check that the answers remain.                             |
| Provider email differs            | Select a provider. The mismatch screen stops the handoff; return to the original email/password path or try another provider account. |
| Returning applicant               | The demo routes to a simulated hosted Portal login rather than creating another account.                                              |
| Expired email link                | Simulate confirmation, wait for the resend cooldown, resend and open the new simulated email.                                         |
| Portal access unavailable         | A completed identity step does not bypass the brand's access check.                                                                   |
| Save / account request fails once | Retry with the details intact; re-enter the transient password after a failed signup attempt.                                         |
| Needs a conversation              | Qualification is advisory in this example. It does not invent an account-creation ban.                                                |

The inbox, provider return and Portal arrival are explicitly **simulated separate surfaces**. The controller never becomes an authenticated Portal session. Resetting or refreshing discards the in-memory demo. This is a UX prototype, not proof that real authentication or delivery works.

## Run the example locally

```sh
git clone https://github.com/franchiseai/website-integrations.git
cd website-integrations
npm install
cd examples/playground
npm install
npm run dev
```

Open the printed local URL with `?flow=portal`. The example uses the included repository package through `file:../..`. Do not install npm 0.1.0 and expect its experimental Portal export to exist.

See [PortalExperience.tsx](https://github.com/franchiseai/website-integrations/blob/main/examples/playground/src/PortalExperience.tsx) for the complete renderer. Astro can mount it as a React island using the same React 19 setup as [getting started](getting-started.md).

## Headless integration shape

This code runs against the **repository prototype**:

```tsx
import { useState } from 'react';
import {
  createDemoPortalEnrollmentAdapter,
  createPortalEnrollmentController,
  usePortalEnrollment,
} from '@franchiseai/website-integrations/experimental/portal';

export function Enrollment() {
  const [demo] = useState(() => createDemoPortalEnrollmentAdapter());
  const [controller] = useState(() =>
    createPortalEnrollmentController(demo.adapter)
  );
  const { state, actions } = usePortalEnrollment(controller);

  // Render contact and definition.questions with your own components.
  // actions.setContact('email', value)
  // actions.setAnswer(question.id, value)
  // actions.setMarketingConsent(checked)
  // await actions.submit()
  // await actions.signUp(transientPassword)
  // await actions.startOAuth('google')
  return <p aria-live="polite">{state.phase}</p>;
}
```

Keep a stable controller for each enquiry. The hook loads the definition and subscribes to snapshots; the renderer owns controls, validation messages, focus management, progress and responsiveness. Implement all documented states before using a custom renderer.

| Controller action                                | Purpose                                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `load()`                                         | Load definition; retry a load error. The hook invokes it automatically.              |
| `setContact`, `setAnswer`, `setMarketingConsent` | Edit the intake while the controller is in `editing`.                                |
| `submit()`                                       | Validate required contact and configured answers, then save and show methods.        |
| `back()`                                         | Return from method selection to details.                                             |
| `signUp(password)`                               | Pass a transient password to the adapter, then show email pending or hosted sign-in. |
| `resendEmail()`                                  | Resend after the cooldown. The real backend must enforce limits independently.       |
| `startOAuth(provider)`, `cancelOAuth()`          | Start or cancel the simulated provider handoff.                                      |

Snapshots include `phase`, `definition`, `contact`, `answers`, `marketingConsent`, `qualified`, `method`, `fieldErrors`, `error` and `resendAt`. They never include a password or session credential. Phases are `idle`, `loading`, `load_error`, `editing`, `saving`, `choose_method`, `requesting`, `email_pending`, `provider_pending`, and `sign_in_required`.

`demo.simulateVerification()` is a separate **test driver**, not an integration action or identity verifier. It returns a simulated `ready`, `expired`, `revoked` or `mismatch` result. Never implement real login by replacing it with a client-side success flag.

## Passwords and the website boundary

Keeping password capability is compatible with this design. A production renderer would send the password directly to FSAi over HTTPS, through the reviewed adapter, and clear the input after submission. The backend must hash passwords using its approved password service and enforce its policy. The prototype mirrors the current 10-character policy with uppercase, lowercase, number and special character; this client validation is not a security boundary.

Passwords must not enter intake drafts, controller snapshots, browser storage, logs, analytics, session recordings or replay queues. Retrying a failed account request asks for the password again. The marketing website still executes the form code: review its scripts and dependencies, enforce an appropriate CSP, and exclude sensitive fields from recording. A compromised website could read typed credentials; moving password entry to the hosted Portal is an alternative if a customer's site cannot meet that trust requirement.

The backend design keeps any pending-intake capability limited, short-lived and in adapter memory. It is not a Portal session. Actual email proof and provider credentials are handled by FSAi and the hosted Portal. The canonical destination is configured by the brand, never an arbitrary browser-supplied redirect. See [OWASP authentication guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html).

## Google, LinkedIn and existing accounts

The provider transaction must bind the pending intake, brand, provider, initiation and approved destination. FSAi exchanges codes and verifies provider identity server-side. A returned email string is not enough: validation must follow the provider's verification semantics, issuer/audience checks and transaction binding.

| Identity result                              | Required behavior for the live implementation                                                                                      |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Verified matching provider email             | Complete the reviewed ownership/linking policy and continue at the hosted Portal. No unnecessary second confirmation email.        |
| Different provider email                     | Stop automatic attachment. Offer the original email/password path, another provider account, or a separately confirmed new intake. |
| Missing or unverified provider email         | Obtain independent email proof before attaching an email-identified intake.                                                        |
| Existing password account                    | Keep password login/recovery; link providers only after the required ownership proof.                                              |
| Existing unverified registration             | Recover safely without overwriting a password based on anonymous input.                                                            |
| Provider cancelled, denied or unavailable    | Keep the intake recoverable and offer another method.                                                                              |
| Expired, replayed or wrong-brand transaction | Reject it without establishing a session.                                                                                          |

The demo's returning-applicant scenario is an explicit testing choice. It is **not** a specification for a public email lookup endpoint. Production responses must resist account enumeration and decide returning-user routing through the reviewed auth flow.

Google's `email_verified=true` is not sufficient evidence of current ownership for a third-party address without a hosted-domain claim. Those cases need an additional ownership challenge before email-based attachment. Use stable provider subject identifiers for provider accounts. See [Google's token verification guidance](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token). LinkedIn's `email` and `email_verified` are optional; handle missing claims with independent proof. Provider sign-in is account authentication, not real-world identity verification.

Provider-specific setup and testing are still required for [Google OIDC](https://developers.google.com/identity/openid-connect/openid-connect) and [LinkedIn OIDC](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2). Follow [OAuth security best current practice](https://www.rfc-editor.org/rfc/rfc9700.html); do not assume both providers return the same claims.

## Backend work before going live

The prototype deliberately has no live adapter. The delivery sequence is:

1. Safe hosted verification/session handoff and reliable logout invalidation.
2. Public, allowlisted Portal signup definitions and isolated pending intake with expiry, validation, idempotency and abuse controls.
3. Password signup and email verification bound to that intake, including resends, existing accounts and cross-device confirmation.
4. Google/LinkedIn transaction and identity verification, explicit account ownership and safe mismatch recovery.
5. Typed SDK and live adapter, supported package release, staging checks with a registered website origin and enabled Portal brand.

Preserve the platform's actual configured form types, consent, conversion events and qualification semantics. The demo implements only text/select questions and illustrative timing/market answers. It is not a complete renderer for arbitrary production form definitions.

Email links must survive scanners without consuming proof on a passive GET. Confirmation and single-use redemption happen through the protected hosted flow. At redemption, re-check brand/applicant access and attach data atomically; do not enrich an existing applicant just because someone typed their email.

The [OpenAPI 3.1 proposal](/portal-openapi.draft.json) and [draft Redoc reference](/portal-api.draft.html) are separate from the existing [Funnel API](/api.html). The draft uses an `.invalid` server and does not define hosted auth callback internals. Exact routes, fields and error behavior remain subject to backend review. Do not generate or wire a production client from it yet.

## Prompt for an agency agent

```text
Add a Portal-brand enrollment prototype to this existing site. Read
https://franchiseai.github.io/website-integrations/portal.md first.
Use the repository's runnable example and experimental Portal demo; npm
0.1.0 does not include it. Preserve the site's design and use one stable
headless controller per enquiry. Keep email/password signup plus Google
and LinkedIn as alternatives, followed by a clearly simulated handoff to
the hosted Applicant Portal. Use fake details and a throwaway password.

Implement accessible controls, optional consent, loading/errors, retries,
back navigation, provider cancellation, email mismatch, expired-link and
returning-applicant scenarios. Never store or log passwords. Keep demo
verification controls visibly separate from the website integration.
No real accounts, email, providers or invented endpoints. Run the relevant
checks and explain the backend work still needed before a live release.
```
