# Maintaining and releasing

The public repository is a curated distribution of the integration maintained with the platform. It contains the built package, documentation, optional skill and runnable website example. It does not contain the private platform source or backend configuration.

## One source for documentation

Each topic starts as Markdown. VitePress renders the guides and Redocly renders the OpenAPI 3.1 reference. The build also creates raw Markdown, `llms.txt`, `llms-full.txt`, package documentation and skill references from the same inputs. Change the maintained source and regenerate; do not make incompatible corrections in one generated copy. Published package versions contain their own documentation snapshot. The Pages site follows the latest repository version.

## Development verification

In the platform repository, build the SDK and package, run the controller/transport tests, type-check and lint affected workspaces, and build/test the playground. The transport is shared with the hosted funnel; validate that the hosted funnel still compiles when it changes. Export only the allowlisted integration files.

The packed release must install in an empty project without private workspace dependencies. Check its JavaScript entry points, declaration resolution and runnable example. Inspect `npm pack --dry-run` before publication. A package that only works through workspace symlinks is not ready.

## Public repository

The root package contains prebuilt JavaScript and declarations; consumers do not rebuild platform internals. Install the root and `examples/playground` dependencies to run the example against the included package. The Pages output is in `docs/`, with `.nojekyll`, and is served from `main:/docs`. It contains VitePress guides, a Redoc reference, the OpenAPI document and the built network-free playground. Sources live in `site/` and `openapi.json`. Run `npm run docs:dev` for VitePress development or `npm run docs:build` to lint the OpenAPI spec and rebuild all documentation. The brand theme extends the standard VitePress theme; it does not replace its search or navigation.

## Publish

A maintainer with npm organization access publishes from the curated repository after verification:

```sh
npm pack --dry-run
npm publish --access public
```

npm may require interactive second-factor approval. Credentials stay in the maintainer's npm configuration, never in the repository. Increment the version for later releases; published version contents cannot be replaced. Verify the registry version and perform a fresh install after publishing. Tag the matching public repository commit only after the corresponding npm publication succeeds.

This release does not configure an automated npm publisher or save a long-lived token in GitHub. Organization maintainers can separately configure trusted publishing for future releases.
