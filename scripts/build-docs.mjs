import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const manifest = JSON.parse(await readFile('package.json', 'utf8'));
const topics = [
  'getting-started',
  'contract',
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
await writeFile('site/public/.nojekyll', '');
await writeFile(
  'site/public/llms.txt',
  `# FS Ai Agency website integrations\n\n> @franchiseai/website-integrations ${manifest.version}: headless qualification for React/Astro. The website owns all presentation.\n\nStart with getting started and the contract. Use the demo until a published live configuration is supplied. Preserve server decisions and optional consent. Never expose application credentials.\n\n${guides.map((g) => `- [${g.markdown.split('\n')[0].replace(/^# /, '')}](${manifest.homepage}${g.slug}.md)`).join('\n')}\n\n- [Complete context](${manifest.homepage}llms-full.txt)\n- [OpenAPI 3.1](${manifest.homepage}openapi.json)\n- [Redoc reference](${manifest.homepage}api.html)\n- [Playground](${manifest.homepage}playground/)\n- [Example source](https://github.com/franchiseai/website-integrations/tree/main/examples/playground)\n`
);
await writeFile(
  'site/public/llms-full.txt',
  `# FS Ai Agency website integrations ${manifest.version}\n\nPackage: @franchiseai/website-integrations\nDocs: ${manifest.homepage}\nOpenAPI: ${manifest.homepage}openapi.json\nExample: https://github.com/franchiseai/website-integrations/tree/main/examples/playground\n\n${guides.map((g) => `${g.markdown}\n\nSource: ${manifest.homepage}${g.slug}.md\n\n---\n`).join('\n')}`
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
execFileSync(cli('vitepress'), ['build', 'site'], { stdio: 'inherit' });
for (const guide of guides) await writeFile(`docs/${guide.slug}.md`, guide.markdown);
const output = await readdir('docs');
for (const required of [
  'index.html',
  'getting-started.html',
  'api.html',
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
