# Development workflow and agent tools

The docs use VitePress (guides, search, code copying) and Redoc (the [OpenAPI 3.1 reference](https://franchiseai.github.io/website-integrations/api.html)). The [raw spec](https://franchiseai.github.io/website-integrations/openapi.json) can be used by compatible API tools. It describes HTTP endpoints; the guide describes controller state and UI responsibilities.

The development tools are ordinary code tools: TypeScript autocomplete, readable Markdown contracts, a deterministic demo adapter, a full example renderer, and browser tests. There is no special agent server, MCP dependency, interactive CLI generator or separate inspector panel in this release.

## What a developer does

1. Give the agent the docs URL or install the optional skill.
2. Install the package in the customer website.
3. Build the UI against demo data and the customer’s design system.
4. Exercise every scenario and check keyboard/mobile behavior.
5. Supply the platform API base URL and published funnel slug, then switch to the live adapter in a provisioned staging environment.
6. Verify the live configuration and secure continuation email before shipping the website.

## Give an agent one document

[llms-full.txt](https://franchiseai.github.io/website-integrations/llms-full.txt) contains the complete versioned guides without a JavaScript shell, navigation markup or a login. [llms.txt](https://franchiseai.github.io/website-integrations/llms.txt) is a short index. Each guide is also available as raw Markdown beside its rendered HTML. The package carries these Markdown guides for local/offline reading.

For skill-aware agents:

```sh
npx skills add franchiseai/website-integrations --skill integrate-fsai
```

The skill routes to bundled copies of these guides. It does not contain another implementation or a separate API contract.

## Demo scenarios

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

## Inspect behavior

TypeScript describes the complete `QualificationState` and action surface. During local demo development, inspect `state.phase`, `pageIndex`, `fieldErrors` and `error`. Avoid recording live identity, answers or credentials in console logs, recordings or analytics. The controller intentionally keeps the application credential outside its public snapshot.

`onEvent` supplies lifecycle names and page/node IDs. Use it for consent-aware measurement or a local event timeline. It supplies no answers or contact details; an event handler throwing cannot block submission. There is no automatic Google/Meta conversion delivery.

The hosted playground has design/scenario selectors and a reset button. Those are demo controls, not production UI and not a requirement for agency sites.

## Validate a custom design

Verify blank/invalid fields, both outcomes, returning visitors, save/progress/load retries, rapid double clicks, back navigation, email locking, unchecked SMS consent, and mobile layout. Preserve labels, legends, error associations, focus management and pending states. Keep consent beside the relevant phone field.

The example repository includes Playwright tests for the two presentations. Run from its root after installing dependencies:

```sh
npm --prefix examples/playground install
npm --prefix examples/playground exec -- playwright install chromium
npm --prefix examples/playground run test:e2e
```

These tests use the demo adapter. Live configuration needs the separate checks in [going live](going-live.md).
