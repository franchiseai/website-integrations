# FranchiseAI website integrations

Headless franchise qualification for custom React and Astro websites. You own the HTML, CSS and interaction design; the integration manages validation, lead capture, page saves and server-controlled qualification.

**For developers:** [Read the docs](https://franchiseai.github.io/website-integrations/) · [Try the three designs](https://franchiseai.github.io/website-integrations/playground/)

**For agents:** [Start here](https://franchiseai.github.io/website-integrations/llms.txt) · [Complete plain-text guide](https://franchiseai.github.io/website-integrations/llms-full.txt)

```sh
npm install @franchiseai/website-integrations react@^19 react-dom@^19
```

The package includes TypeScript declarations, a React hook, a framework-independent controller, a live adapter using the existing public platform API, and a separate network-free demo adapter. It has no UI, CSS, router, admin credentials or dependency on private packages. Version 0.1 is an initial qualification integration; live customer provisioning and email delivery must be verified for the target site.

Give your coding agent this prompt:

> Read https://franchiseai.github.io/website-integrations/llms-full.txt. Add a franchise enquiry to this website using @franchiseai/website-integrations. Use the demo adapter first, match our design, and handle every documented state. Use the example renderer as a reference, not a required layout. Do not connect a live funnel until I provide its published slug and API base URL.

An optional installable skill points to the same documentation:

```sh
npx skills add franchiseai/website-integrations --skill integrate-fsai
```

You can use the documentation directly without installing a skill. The skill contains the same versioned Markdown references so agents can work offline after installation.

The documentation uses **VitePress** for guides and **Redoc** for the API reference. [Download the OpenAPI 3.1 specification](https://franchiseai.github.io/website-integrations/openapi.json).

## Guides

- [Get started with React or Astro](docs/getting-started.md)
- [State, actions and design boundaries](docs/contract.md)
- [Demo scenarios and development tools](docs/development.md)
- [Connect a published funnel](docs/going-live.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Maintain and release the package](docs/maintaining.md)

## Run the example locally

Clone this public repository, then run:

```sh
npm install
npm --prefix examples/playground install
npm --prefix examples/playground run dev
```

Open the URL printed by Vite. Common Table, Pulse and Outpost demonstrate three presentations of the same integration. Outpost starts with an interactive sample-territory map and opens qualification in a modal with the chosen place prefilled. All example submissions are simulated; no emails or leads are created. `examples/playground/src/QualificationForm.tsx` is a complete website-owned renderer that you can copy and restyle.

## Scope

Qualification only. Sessions are held in memory. Continuation requests a secure email through the existing hosted funnel. No immediate authenticated redirect, file uploads, signing, booking, persistent browser session, or ad conversion delivery is included. The demo proves UI/controller behavior; it does not prove a customer’s live backend, CORS or email configuration.
