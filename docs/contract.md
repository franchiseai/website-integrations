# Funnel contract and presentation rules

> This guide covers **Funnel brands**. Portal enrollment uses a separate [experimental contract and password/provider flow](portal.md); npm 0.1.0 does not provide a live Portal integration.

The core is framework independent. `createQualificationController(options)` returns a subscribable controller. `useQualification(controller)` is only a React bridge: it subscribes and calls `load()` on mount. It returns `{ state, actions }`.

| State            | Meaning                                                                                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `phase`          | `idle`, `loading`, `load_error`, `editing`, `submitting`, `completion_error`, `outcome`, `continuing`, `complete`, `resume_link_sent`, or `portal_required` |
| `definition`     | Brand/node identity and configured pages/questions; null before loading                                                                                     |
| `pageIndex`      | Current zero-based configured page                                                                                                                          |
| `identity`       | First name, last name and email supplied in this enquiry                                                                                                    |
| `identityLocked` | The email is fixed after a lead was successfully created; names remain editable                                                                             |
| `answers`        | Question ID to string, number, boolean, string array, null or undefined                                                                                     |
| `fieldErrors`    | Question ID or contact key to human-readable validation message                                                                                             |
| `error`          | A recoverable request-level message; display it even when field errors are off-page                                                                         |
| `retryAt`        | Earliest allowed retry as epoch milliseconds, or null; actions enforce the wait                                                                             |
| `smsConsent`     | Affirmative opt-in, false initially and reset when changing phone or page                                                                                   |
| `outcome`        | Server result: `qualified` or `not_qualified`, after successful progress persistence                                                                        |
| `next`           | Server-resolved next node; the current package does not render it                                                                                           |
| `portalUrl`      | Portal link only when the server identifies an existing applicant                                                                                           |

| Action                      | Behaviour                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------ |
| `load()`                    | Loads definition; supports retry after `load_error`                                  |
| `setIdentity(key, value)`   | Edits contact details; a created lead's email cannot change                          |
| `setAnswer(fieldId, value)` | Updates a question on the current page                                               |
| `setSmsConsent(boolean)`    | Updates consent; never preset to true                                                |
| `back()`                    | Returns to an earlier page without losing answers                                    |
| `submit()`                  | Validates, captures a lead, saves the page, then advances or completes qualification |
| `continue()`                | From an outcome, requests the existing secure continuation email                     |
| `useDifferentEmail()`       | Returns from a returning-applicant notice to the first page                          |

Submissions are guarded synchronously, so a rapid double click cannot start two in-flight creates. If creation succeeds but saving fails, retry reuses that lead. If saving qualification succeeds but recording progress fails, `completion_error` asks the presentation to offer `submit()` again; retry completes progress without resubmitting answers, and editing remains locked during that recovery. A network failure during the create request itself has an ambiguous outcome; retry may produce the returning-email path, which safely verifies ownership rather than adopting a guessed email.

`resume_link_sent` is an intentionally non-disclosing response. Do not imply that an account is confirmed to exist. The existing endpoint may throttle email delivery and still return this response. `complete` means the continuation request was accepted, not proof of email delivery or completion of the full application.

## Design freedom and behavioural boundaries

Layout, page width, typography, imagery, field presentation, animation, and result presentation belong entirely to the website. A single configured page can be presented as an inline form, a modal, a conversational UI, or one question at a time. The current controller saves the configured page as a unit: local presentation steps do not change server page boundaries.

Render the three pinned contact fields on the first page using `FUNNEL_CONTACT_BLOCK_FIELDS`. Authored questions do not replace that contact block. Use the published question IDs, types, required flags and choices. Supported types are short/long text, currency, number, date, URL, email, phone, multiselect, singleselect, boolean, and dropdown. Monetary/number input may be a number or a formatted string accepted by SDK validation. Multiselect answers are string arrays; boolean answers are booleans.

Place optional SMS consent only when `definition.smsOptInEnabled` and `funnelSmsConsentAnchorFieldId(page.questions)` returns a phone field. Render the exact `FUNNEL_SMS_CONSENT_COPY` adjacent to that field and bind it to `smsConsent`. Changing the number retracts the prior opt-in. Never make SMS consent a condition of submitting the form.

Represent loading, errors, returning applicants, both outcomes, and continuation as well as the happy path. Keep inputs labelled, group choices with a legend, associate errors with their fields, and manage focus on page changes/errors. Use `aria-busy` during writes. Disable pending actions, and use `retryAt` to explain a rate-limit wait. The example's visual styles are optional; those interactions remain necessary in replacement layouts.

## Attribution and events

`readQualificationAttribution(queryString)` allowlists UTM source/medium/campaign/term/content and `gclid`/`fbclid`, ignoring credentials and unrelated parameters. Pass the result once for this enquiry. The controller does not scrape the host URL, write cookies, load ad tags, send ad conversions, or store answers in browser storage.

`onEvent` receives `loaded`, `lead_created`, `page_saved`, `qualified`, `not_qualified`, `continuation_requested`, `resume_link_sent`, or `submission_failed`, with node/page IDs. These are lifecycle callbacks, not the hosted funnel analytics schema. Observer exceptions cannot prevent submission. Wire consent-aware platform analytics separately; do not send answers or application credentials into analytics.

## Continuation and production scope

There is no cross-origin application-ID redirect. After saving qualification progress, `continue()` uses the existing returning-lead endpoint to request a secure resume email. Following that email uses the established hosted funnel's token redemption and server-resolved next step. The prototype does not redeem tokens itself or restore an enquiry on reload. Do not serialize the controller snapshot into public HTML, logs or query strings.

Before production promotion: exercise the adapter against a provisioned staging brand including CORS, email and published-flow changes; define durable sessions and a secure immediate handoff if required; integrate measurement with the host's consent handling; and migrate the standalone qualifier to the same controller to remove workflow duplication. These are known next steps, not capabilities implied by the demo.
