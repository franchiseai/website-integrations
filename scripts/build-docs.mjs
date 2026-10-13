import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const manifest = JSON.parse(await readFile('package.json', 'utf8'));
const topics = [
  'getting-started',
  'contract',
  'portal',
  'development',
  'going-live',
  'troubleshooting',
  'maintaining',
];
const guides = await Promise.all(
  topics.map(async (slug) => ({
    slug,
    markdown: await readFile(`site/${slug}.md`, 'utf8'),
  }))
);
await mkdir('site/public', { recursive: true });
await mkdir('skills/integrate-fsai/references', { recursive: true });
for (const guide of guides) {
  await rm(`site/public/${guide.slug}.md`, { force: true });
  await writeFile(
    `skills/integrate-fsai/references/${guide.slug}.md`,
    guide.markdown
  );
}
await cp('openapi.json', 'site/public/openapi.json');
await cp('portal-openapi.draft.json', 'site/public/portal-openapi.draft.json');
await writeFile('site/public/.nojekyll', '');
await writeFile(
  'site/public/llms.txt',
  `# FS Ai Agency website integrations\n\n> @franchiseai/website-integrations ${manifest.version}: Funnel qualification for React/Astro. Repository-only Portal enrollment prototype; not in npm 0.1.0. The website owns all presentation.\n\nFirst identify Funnel versus Portal from supplied configuration; ask if unclear. For Funnel, read getting started and the contract; use the demo until a published live configuration is supplied. For Portal, read portal.md and use only the repository prototype, preserving password signup with email confirmation and Google/LinkedIn alternatives. No live Portal adapter exists. Preserve server decisions and optional consent. Never expose application credentials.\n\n${guides.map((g) => `- [${g.markdown.split('\n')[0].replace(/^# /, '')}](${manifest.homepage}${g.slug}.md)`).join('\n')}\n\n- [Complete context](${manifest.homepage}llms-full.txt)\n- [Funnel OpenAPI 3.1](${manifest.homepage}openapi.json)\n- [Portal OpenAPI draft — not deployed](${manifest.homepage}portal-openapi.draft.json)\n- [Redoc reference](${manifest.homepage}api.html)\n- [Playground](${manifest.homepage}playground/)\n- [Example source](https://github.com/franchiseai/website-integrations/tree/main/examples/playground)\n`
);
await writeFile(
  'site/public/llms-full.txt',
  `# FS Ai Agency website integrations ${manifest.version}\n\nPublished npm 0.1.0 supports Funnel only. Repository Portal enrollment is a network-free prototype, not a live integration. Identify the brand type before choosing an adapter; preserve email/password plus Google/LinkedIn for Portal.\n\nPackage: @franchiseai/website-integrations\nDocs: ${manifest.homepage}\nOpenAPI: ${manifest.homepage}openapi.json\nExample: https://github.com/franchiseai/website-integrations/tree/main/examples/playground\n\n${guides.map((g) => `${g.markdown}\n\nSource: ${manifest.homepage}${g.slug}.md\n\n---\n`).join('\n')}`
);
const cli = (name) => path.join(root, 'node_modules/.bin', name);
execFileSync(cli('redocly'), ['lint', 'openapi.json'], { stdio: 'inherit' });
execFileSync(
  cli('redocly'),
  [
    'build-docs',
    'openapi.json',
    '--output',
    'site/public/api.html',
    '--disableGoogleFont',
  ],
  { stdio: 'inherit' }
);
execFileSync(cli('redocly'), ['lint', 'portal-openapi.draft.json'], {
  stdio: 'inherit',
});
execFileSync(
  cli('redocly'),
  [
    'build-docs',
    'portal-openapi.draft.json',
    '--output',
    'site/public/portal-api.draft.html',
    '--disableGoogleFont',
  ],
  { stdio: 'inherit' }
);
execFileSync(cli('vitepress'), ['build', 'site'], { stdio: 'inherit' });
for (const guide of guides)
  await writeFile(`docs/${guide.slug}.md`, guide.markdown);
const output = await readdir('docs');
for (const required of [
  'index.html',
  'getting-started.html',
  'api.html',
  'portal.html',
  'portal-api.draft.html',
  'portal-openapi.draft.json',
  'openapi.json',
  'llms.txt',
  'llms-full.txt',
  'logo.svg',
  '.nojekyll',
]) {
  if (!output.includes(required))
    throw new Error(`Missing docs output: ${required}`);
}
console.log(
  'VitePress guides, Redoc reference, OpenAPI and agent context built.'
);
