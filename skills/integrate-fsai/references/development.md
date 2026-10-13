# Development workflow and agent tools

The docs use VitePress (guides, search, code copying) and Redoc (the [OpenAPI 3.1 reference](https://franchiseai.github.io/website-integrations/api.html)). The [raw spec](https://franchiseai.github.io/website-integrations/openapi.json) can be used by compatible API tools. It describes HTTP endpoints; the guide describes controller state and UI responsibilities.

The development tools are ordinary code tools: TypeScript autocomplete, readable Markdown contracts, a deterministic demo adapter, a full example renderer, and browser tests. There is no special agent server, MCP dependency, interactive CLI generator or separate inspector panel in this release.

## What a developer does

1. Give the agent the [landing-page prompt](https://franchiseai.github.io/website-integrations/), docs URL or optional skill.
2. Identify the platform brand type from the supplied configuration. Ask if it is unclear.
3. For Funnel, install npm 0.1.0 and use its qualification demo. For Portal, use the [repository prototype](portal.md); the experimental Portal export is not in that npm release.
4. Build fully custom UI against demo data and the customer's design system. Exercise the relevant scenarios and keyboard/mobile behavior.
5. For Funnel, supply the API base URL and published funnel selector, then verify the live adapter in a provisioned staging environment, including CORS and secure continuation email.
6. For Portal, keep the prototype network-free until the backend work and supported live release are delivered. Preserve password signup with email confirmation alongside Google/LinkedIn; the authenticated journey continues at the hosted Portal.

## Give an agent one document

[llms-full.txt](https://franchiseai.github.io/website-integrations/llms-full.txt) contains the complete versioned guides without a JavaScript shell, navigation markup or a login. [llms.txt](https://franchiseai.github.io/website-integrations/llms.txt) is a short index. Each guide is also available as raw Markdown beside its rendered HTML. Published packages carry the guide snapshot from their release. The latest web docs and repository also cover the experimental Portal prototype; those additions do not make it available in npm 0.1.0.

For skill-aware agents:

```sh
npx skills add franchiseai/website-integrations --skill integrate-fsai
```

The skill routes to bundled copies of these guides. It does not contain another implementation or a separate API contract.

## Funnel demo scenarios

```ts
import { createDemoQualificationAdapter } from '@franchiseai/website-integrations/demo';

const adapter = createDemoQualificationAdapter({
  scenario: 'submission_error',
  delayMs: 450,
});
```

| Scenario           | Expected behavior                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------- |
| `qualified`        | Saves both pages, then shows the qualified result                                             |
| `not_qualified`    | Saves both pages, then shows the alternate result                                             |
| `returning`        | Shows the returning-email notice without an application credential                            |
| `submission_error` | First page save fails once; retry uses the same created lead                                  |
| `progress_error`   | Final answers save, progress fails once; retry finishes progress without resubmitting answers |
| `unavailable`      | Initial loading fails once; loading again recovers                                            |

Create a new controller to reset a scenario. `delayMs: 0` is useful in tests. Demo outcomes are selected by the scenario, not inferred from entered answers. Demo continuation simulates an accepted request; it sends no email.

## Funnel behavior and events

TypeScript describes the complete `QualificationState` and action surface. During local demo development, inspect `state.phase`, `pageIndex`, `fieldErrors` and `error`. Avoid recording live identity, answers or credentials in console logs, recordings or analytics. The controller intentionally keeps the application credential outside its public snapshot.

`onEvent` supplies lifecycle names and page/node IDs. Use it for consent-aware measurement or a local event timeline. It supplies no answers or contact details; an event handler throwing cannot block submission. There is no automatic Google/Meta conversion delivery.

The hosted playground starts with a Funnel/Portal selector. Funnel has three design choices, scenario selectors and a reset button. Outpost adds map-prefilled answers and a dismissible qualification dialog; Common Table and Pulse embed the form inline. Changing designs preserves the current controller state. Those are demo controls, not production UI and not a requirement for agency sites.

## Portal development

Use the [Portal guide](portal.md) for the separate controller, hook, adapter and runnable example. Paper and Midnight share one enquiry state. Demo controls simulate an inbox, provider return and hosted Portal arrival; they never authenticate a person.

Test password signup/confirmation, both providers, cancellation, email mismatch, returning applicants, expired links, unavailable access and save/account-request retries. Keep the password transient and use a throwaway value. Do not apply Funnel node/page semantics or SMS consent rules to a Portal intake. Keep the Portal's optional marketing consent separate and unchecked.

The [Portal OpenAPI proposal](https://franchiseai.github.io/website-integrations/portal-openapi.draft.json) is a design artifact, separate from the supported Funnel spec. No endpoint is available just because it appears in the draft.

## Validate a custom Funnel design

Verify blank/invalid fields, both outcomes, returning visitors, save/progress/load retries, rapid double clicks, back navigation, email locking, unchecked SMS consent, and mobile layout. Preserve labels, legends, error associations, focus management and pending states. Keep consent beside the relevant phone field.

The example repository includes Playwright tests for the three Funnel presentations and the Portal prototype. Run from its root after installing dependencies:

```sh
npm --prefix examples/playground install
npm --prefix examples/playground exec -- playwright install chromium
npm --prefix examples/playground run test:e2e
```

These tests use the demo adapter. Live configuration needs the separate checks in [going live](going-live.md).
