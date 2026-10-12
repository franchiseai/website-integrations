# Troubleshooting

## Nothing appears

The package intentionally renders no UI. Install a website-owned renderer or use the full example. Ensure the controller is stable and `useQualification` is mounted. For a non-React subscriber, call `load()` yourself. Astro islands must hydrate.

## Loading fails

Check `state.error` and the browser network panel. Confirm the API base URL, published slug/host and allowed website origin. The published funnel must start with a qualifier. A configured but missing form is an error, not permission to show a contact-only fallback. Render retry with `actions.load()`.

## npm cannot find the package

Use the public scope `@franchiseai/website-integrations`. Verify that your npm registry points to the public npm registry or a proxy that can resolve it. The private monorepo SDK is not a prerequisite. If a version has not yet been published, use a provided release tarball for evaluation; documentation alone is not proof of registry publication.

## Questions or answers reset on every render

Do not create the controller inside the render body without `useState` or equivalent stable ownership. Recreate it only to start a new enquiry or change configuration. Keep one controller per visitor and form instance.

## Email is read-only

This is expected after a lead is created. Retrying a failed save must reuse that lead. The returning-applicant notice offers `useDifferentEmail`; it is not an account-switch action for an already created lead.

## Answers saved but the form shows an error

`completion_error` means the final answers were saved but progress/entry resolution failed. Offer `submit()` to retry completion. Keep the answered form locked; the controller will not resubmit the answers during this recovery.

## Rate limited

Render the wait indicated by `retryAt` and permit retry after it passes. The controller enforces the delay. Do not build a retry loop around requests. For live debugging, inspect HTTP status and retry metadata without logging personal information.

## No email arrives

Demo mode never sends email. In live mode, `complete` and `resume_link_sent` are accepted/non-disclosing responses, not delivery receipts. Check the platform’s mail delivery and throttling with the responsible platform team. Do not work around this by exposing an application credential.

## My design needs one question per screen

You can present a configured page with local visual substeps. The controller validates and saves the whole configured page when `submit()` is called. Per-question server saves, changing page order, adding file uploads, or skipping required published steps require contract changes; CSS alone cannot add them.
