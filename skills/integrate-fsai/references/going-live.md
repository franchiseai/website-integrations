# Connect a published funnel

You need the platform API base URL, the customer’s published funnel slug (or configured funnel host), and the customer website’s origin permitted by backend CORS. These are configuration values, not administrator credentials. Obtain the values from your platform team rather than guessing production URLs.

```ts
import {
  createQualificationController,
  createLiveQualificationAdapter,
  readQualificationAttribution,
} from '@franchiseai/website-integrations';

const controller = createQualificationController({
  adapter: createLiveQualificationAdapter({
    apiBaseUrl: 'https://YOUR-PLATFORM-API',
    site: { slug: 'YOUR-PUBLISHED-FUNNEL' },
  }),
  attribution: readQualificationAttribution(hostPageQueryString),
  onEvent(event) {
    // Forward permitted non-sensitive events to the site's measurement layer.
  },
});
```

`hostPageQueryString` is an explicit string supplied by your wrapper after hydration, or from the host framework. It is not a package global. Use `{ host: 'franchise.customer.example' }` instead of `slug` only when that host is configured as the platform’s funnel host. The agency website domain is not automatically a funnel selector.

Retain the controller across renders just as in the demo. The default adapter sends no cookies, admin token, or stored platform session token. It uses the existing SDK transport and endpoint contracts bundled into the package. Consumers do not need the internal SDK.

## Supported published configuration

The published funnel must start with a qualifier. This package will not skip an earlier content/signature step. A configured qualifier form must be available and have pages. When there is no configured qualifier form, the flow collects the required contact block only. A missing configured form fails closed.

The server controls qualification and the next node. The website may change presentation but must preserve field IDs, choices, required fields, page boundaries and optional consent behavior. The package uses existing `/funnel` endpoints for site information, forms, leads, submissions, progress and entry resolution. This integration adds no backend routes or database migrations; the deployed backend must already support those contracts.

## What happens on continuation

The first successful submit creates a lead. Each configured page is saved. After the last page, the integration records progress and resolves the next step on the server. `continue()` requests a secure resume email using the existing returning-lead behavior. The email opens the established hosted funnel.

An accepted request is not proof of delivery: the server may throttle email sends while returning the same non-disclosing response. Do not build a link containing the application ID, infer that an account exists, or redirect straight to an authenticated application based on the local result.

## Before the website goes live

Use a provisioned staging funnel to verify its published entry, actual question types, both server outcomes, CORS from the website origin, new and returning applicant behavior, save/progress recovery, consent recording and secure-email delivery. The demo and package tests do not verify these environment-dependent facts.

This version holds the enquiry in memory. Refreshing loses local progress and a returning visitor verifies ownership via email. Persistent sessions and immediate secure handoff require further platform work. The existing hosted qualifier has not yet been migrated to this controller.

## Existing SDK consumers

Internal callers can pass their existing typed `funnel` service to `createSdkQualificationAdapter({ funnel, site })`. That advanced entry point uses the caller's transport configuration. Agency websites should use `createLiveQualificationAdapter` for the explicit public, no-session transport.
