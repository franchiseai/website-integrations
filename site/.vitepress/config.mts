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
  // Link previews (Slack, iMessage, LinkedIn): one site image, and each page's own title and description.
  transformHead({ pageData, siteData }) {
    const url = new URL(pageData.relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '.html'), 'https://franchiseai.github.io/website-integrations/').toString();
    const title = pageData.title ? `${pageData.title} | ${siteData.title}` : siteData.title;
    const description = pageData.frontmatter.description || pageData.description || siteData.description;
    const image = 'https://franchiseai.github.io/website-integrations/og.png';
    return [
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:site_name', content: siteData.title }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:image', content: image }],
      ['meta', { property: 'og:image:width', content: '1200' }],
      ['meta', { property: 'og:image:height', content: '630' }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:image', content: image }],
    ];
  },
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
          { text: 'Portal brands · Prototype', link: '/portal' },
          { text: 'Offerings · Consumer enquiries', link: '/offerings' },
          { text: 'Going live', link: '/going-live' },
          { text: 'Review Sites', link: '/review-sites' },
          { text: 'Troubleshooting', link: '/troubleshooting' },
        ],
      },
      {
        text: 'FOR BRANDS',
        items: [{ text: 'Your domain', link: '/your-domain' }],
      },
      {
        text: 'REFERENCE',
        items: [
          { text: 'OpenAPI reference ↗', link: '/api.html', target: '_self' },
          { text: 'Download OpenAPI', link: '/website-integrations/openapi.json', target: '_self' },
          { text: 'Agent context ↗', link: '/website-integrations/llms-full.txt', target: '_self' },
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
      copyright: 'FS Ai Agency · Website integrations v0.2.0 release candidate',
    },
    outline: { level: [2, 3] },
  },
});
