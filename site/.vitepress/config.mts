import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'FS Ai Agency',
  appearance: false,
  description: 'Website integrations. Your design, connected to FranchiseAI.',
  base: '/website-integrations/',
  outDir: '../docs',
  head: [
    [
      'link',
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/website-integrations/logo.svg',
      },
    ],
  ],
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'FS Ai Agency',
    search: { provider: 'local' },
    nav: [
      { text: 'Guides', link: '/getting-started' },
      { text: 'API reference ↗', link: '/api.html', target: '_self' },
      { text: 'Playground ↗', link: '/playground/', target: '_self' },
      { text: 'For agents', link: '/development' },
    ],
    sidebar: [
      {
        text: 'WEBSITE INTEGRATIONS',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'Get started', link: '/getting-started' },
          { text: 'Contract & presentation', link: '/contract' },
          { text: 'Development tools', link: '/development' },
          { text: 'Going live', link: '/going-live' },
          { text: 'Troubleshooting', link: '/troubleshooting' },
        ],
      },
      {
        text: 'REFERENCE',
        items: [
          { text: 'OpenAPI reference ↗', link: '/api.html', target: '_self' },
          { text: 'Download OpenAPI', link: '/openapi.json', target: '_self' },
          { text: 'Agent context ↗', link: '/llms-full.txt', target: '_self' },
          { text: 'Maintaining & releasing', link: '/maintaining' },
        ],
      },
    ],
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/franchiseai/website-integrations',
      },
    ],
    footer: {
      message: 'Your design. Connected to FranchiseAI.',
      copyright: 'FS Ai Agency · Website integrations v0.1.0',
    },
    outline: { level: [2, 3] },
  },
});
