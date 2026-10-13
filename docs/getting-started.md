# Get started

## Choose the brand type first

| Brand type | Integration                                                                                                      | Where to start                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Funnel     | Headless qualification and secure continuation email; npm 0.1.0 includes demo and live adapters.                 | Follow the React/Astro setup below, then verify the customer's published Funnel configuration.       |
| Portal     | Initial details, email/password or Google/LinkedIn, then hosted Portal continuation; repository-only simulation. | Follow the [Portal guide](portal.md). There is no live Portal adapter or Portal export in npm 0.1.0. |

Use the supplied platform configuration to choose. If the brand type is unknown, ask before selecting an adapter. A custom website can use either journey; its appearance does not determine the platform brand type. The [landing-page prompt](https://franchiseai.github.io/website-integrations/) routes an agent through this choice.

## Funnel: install the package

Install the package in a React 19 project. For Astro, use a React island with Astro's React integration configured. The published package includes all required platform behavior; do not install the private platform SDK.

```sh
npm install @franchiseai/website-integrations react@^19 react-dom@^19
```

## Start with a complete example

The [playground source](https://github.com/franchiseai/website-integrations/tree/main/examples/playground) contains a runnable Vite app with three Funnel designs and a separate Portal prototype. The following setup is for Funnel brands. Its `QualificationForm.tsx` renders every phase, current question type, validation errors, keyboard controls, consent and outcomes. Copy it into your site as a starting point, or replace all its markup. No presentation components come from the integration package.

After copying `QualificationForm.tsx` into your project, this wrapper is complete:

```tsx
import { useState } from 'react';
import {
  createQualificationController,
  useQualification,
} from '@franchiseai/website-integrations';
import { createDemoQualificationAdapter } from '@franchiseai/website-integrations/demo';
import { QualificationForm } from './QualificationForm';

export function FranchiseEnquiry() {
  const [controller] = useState(() =>
    createQualificationController({
      adapter: createDemoQualificationAdapter({ scenario: 'qualified' }),
    })
  );
  const { state, actions } = useQualification(controller);
  return <QualificationForm state={state} actions={actions} design="table" />;
}
```

Copy relevant example styles or apply your own CSS. The `design` prop belongs only to this example renderer, not to the package API. The example themes use a parent `table`, `pulse` or `outpost` class; inspect `App.tsx` and `OutpostExperience.tsx` for their surrounding layouts. Outpost demonstrates an external map selection feeding `actions.setAnswer()` and a native dialog that preserves the controller when closed.

## Compose from scratch

Read `state.definition?.pages[state.pageIndex]` to obtain the configured page. Render the pinned contact fields on page zero and render its questions with their published IDs, choices, required flags and types. Bind contact fields to `actions.setIdentity`, answers to `actions.setAnswer`, and form submit to `actions.submit`. Display `fieldErrors` and the request-level `error`. Every phase in the [contract](contract.md) needs a corresponding view or control state.

Call actions from event handlers, never during render. Keep the controller stable across renders; create a new one when the published site changes. A controller represents one visitor's enquiry and must never be shared between requests on a server. React Strict Mode mounting is supported.

## Astro

Mount the React wrapper in an island:

```astro
---
import { FranchiseEnquiry } from '../components/FranchiseEnquiry';
---
<section class="franchise-enquiry">
  <h2>Build your next chapter</h2>
  <FranchiseEnquiry client:load />
</section>
```

The package does not read browser globals on initial render. If your own wrapper reads `window` during initialization, move that read after hydration or use `client:only="react"`. Do not serialize filled controller snapshots into server-rendered HTML. The supplied runnable example and browser tests use React/Vite; Astro integration is documented but has not been exercised in an Astro app.

## Without the React hook

The controller supports `getSnapshot()`, `subscribe(listener)` and `load()` directly. Subscribe to state changes, call `load`, and unsubscribe when your view unmounts. All mutations go through controller actions. React remains a package peer dependency in this release.

Next: use the [demo scenarios](development.md), then follow [going live](going-live.md).
