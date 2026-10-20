# Offerings: consumer enquiries

Offerings connects your agency website to location teams. It is separate from franchise recruitment (Funnel) and applicant enrollment (Portal). Property management and catering share the same contract; the website owns all presentation. Version 0.2.0 adds `/offerings` and `/offerings/demo` exports without changing the existing exports. This source is a release candidate until platform staging, package publication and deployment have been verified.

## Start with the demo

```ts
import {
  createOfferingsController,
  useOfferings,
} from '@franchiseai/website-integrations/offerings';
import { createDemoOfferingsAdapter } from '@franchiseai/website-integrations/offerings/demo';
const controller = createOfferingsController(
  createDemoOfferingsAdapter({ industry: 'property', scenario: 'retry' })
);
await controller.load();
await controller.choose({ offeringId: 'property', locationId: 'location-1' });
```

In React, create the controller once and subscribe with `useOfferings(controller)`. Render `state.definition.form.fields`, preserving stable IDs. Call `contact`, `answer` and `submit`; render errors and the receipt. The controller supplies no styling. The playground at `?offerings` offers distinct property-management and catering presentations and deterministic standard, lost-response retry, changed-form, disabled-location, ambiguous-territory and unmatched-address scenarios. Submit another enquiry after receipt to test a repeat customer; a later request gets a new key.

## Connect a website

```ts
import {
  createLiveOfferingsAdapter,
  createOfferingsController,
} from '@franchiseai/website-integrations/offerings';
const controller = createOfferingsController(
  createLiveOfferingsAdapter({
    apiBaseUrl: 'https://YOUR-BACKEND',
    brandId: 'YOUR-PROVISIONED-BRAND-UUID',
  })
);
```

Head office must provision the brand, origins, reusable forms, offerings, location publication and intake configuration. Supply the complete HTTPS origin (scheme and hostname, including port when present); local HTTP is restricted to localhost/127.0.0.1. No admin key, session token or cookie belongs in the website. The public adapter deliberately disables stored-token fallback and credentials. Server integrations may omit Origin; an origin list is browser configuration, not authentication. Apply edge abuse controls in addition to backend IP rate limits.

## Public contract

All endpoints are JSON POST requests under `/offerings/public`. `locations` takes `{brandId}` and returns only published profiles with stable location IDs, public contact/address fields and intake status. `location` takes `{brandId,locationId}` for a dedicated location page and returns the same allowlisted profile, or an unavailable response. Hidden profiles are absent; a published profile can have intake disabled. `offerings` lists enabled named services. `resolve` takes brandId, offeringId, optional explicit locationId and optional structured address `{address1,city,state,postalCode,country}`. Canadian provinces use `ON` or `ca_on`; country is `CA` (US is also supported).

An explicit eligible location takes precedence even outside its territory. Address routing uses only one unambiguous eligible territory/location; boundaries, overlaps, failed geocoding and no match go to head office. Never choose the nearest location yourself. Resolve returns the effective form, opaque version and destination. Central requests use the brand form. Do not infer internal routing reasons from the public response.

`submit` sends the same selection/address plus version, a fresh UUID idempotencyKey, contact `{name,email,phone}` (public email required; phone nullable), and answers keyed by field ID. It returns only `{receiptId,status:'received'}`. A typed email is not identity verification: the API never returns customer history or an existing customer record. The receipt means persisted intake, not a booking, a won outcome or delivered email.

## Validation and recovery

Supported questions are text, textarea, number, date (`YYYY-MM-DD`), select and checkbox. Render required markers, preserve boolean false and number zero, and validate the current server definition. The backend is authoritative. Form definitions include resolved inherited fields; keep the opaque version unchanged on submission. Existing enquiries retain their question/contact snapshots.

On an uncertain network failure, retry the exact payload with the exact idempotency key. The controller locks edits while a request is uncertain and coalesces simultaneous submits. Do not call `newEnquiry` or `reloadForm` merely because a network response was lost: that could create another opportunity. Use `reloadForm` only after a verified `OFFERING_CHANGED` refusal, then ask the user to review retained answers and fields that could not be retained. The controller retains answers only for matching stable IDs and compatible types/choices.

`LOCATION_UNAVAILABLE` requires a new explicit selection; never silently reroute. `OFFERING_UNAVAILABLE` means intake/configuration is unavailable. `INVALID_ANSWERS` includes field errors. `IDEMPOTENCY_CONFLICT` means a key was reused with changed content. Rate limits use HTTP 429 and Retry-After. The SDK exposes machine-readable failure information in the error data.

Cache location profiles briefly (suggested maximum five minutes), but resolve again before a new enquiry and respect submission-time refusals. Never cache customer data, idempotency receipts in a shared cache, or staff endpoints. Show a loading state, retry option and an accessible confirmation. Persist a pending payload/key securely if your site must survive page reloads; the default controller keeps it in memory only.

## Staff configuration and launch duties

Configuration inherits brand → controlling franchisee organisation → location. Overrides are explicit per field; resetting removes the override. Upstream removal/type conflicts require administrator review. Public visibility and intake are separate. Organisation settings are brand-specific. Staff can record missing-email customers and manual enquiries without sending an automatic acknowledgement.

Deploy the generated migration and backend before enabling staff UI and publishing the package. Set OFFERINGS_EMAIL_FROM to a verified transactional sender and run the existing Inngest workers; the durable minute drain retries failed deliveries. Staff control new-enquiry and follow-up channels in Offerings notification preferences. Staff email links use the configured dashboard URL or the brand's active franchisee portal domain; a missing portal domain leaves email delivery queued for retry. Messages contain no customer details; the workspace rechecks access when opened. Customer acknowledgements are separate from staff preferences. Queue acceptance does not establish provider delivery. Monitor pending deliveries and last_error during rollout.

Before release, verify a provisioned staging brand end to end: explicit location, Canadian routing, central queue, duplicate retry, later repeat customer, changed form, disabled location, organisation override/reset, scoped history, transfer, revoked access, owner/date/status updates and preference-controlled notifications. Install the packed package in a fresh project without private workspace dependencies. Preserve Funnel and Portal smoke tests. Publication and shared-environment migrations require the maintainer's release process; this guide does not perform them.

The initial public profile uses existing location name, address and phone fields, plus optional description, public email and website. The customer confirmed that no richer location-page example is available now; extra content is a future refinement, not a blocker for this agreed field list. Measure receipt, assignment, stale work, recorded follow-up changes and outcomes. Won is a recorded outcome, not collected revenue; these measures do not prove causal revenue improvement.
