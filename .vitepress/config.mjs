import { defineConfig } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  outDir: './dist',
  srcDir: './src',
  title: "node-cron",
  description: "A Lightweight Task Scheduler for Node.js",
  sitemap: {
    hostname: 'https://nodecron.com'
  },
  lastUpdated: true,
  head: [
    [
      'script',
      { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-M6MDH0HR0C' }
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-M6MDH0HR0C');`
    ]
  ],
  vite: {
    plugins: [llmstxt()]
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Quickstart', link: '/getting-started' },
      { text: 'NestJS', link: '/nestjs' },
      { text: 'API Reference', link: '/api-reference' },
      { text: 'Blog', link: '/blog/' },
    ],

    sidebar: [
      {
        text: 'Get Started',
        items: [
          { text: 'Introduction', link: '/' },
          { text: 'Quickstart', link: '/getting-started' },
          { text: 'Usage Rules & Limits', link: '/usage-rules' },
        ]
      },
      {
        text: 'Core Concepts',
        items: [
          { text: 'Cron Syntax', link: '/cron-syntax' },
          { text: 'Task Lifecycle & Status', link: '/task-lifecycle' },
          { text: 'Scheduling Options', link: '/scheduling-options' },
          { text: 'Timezones & DST', link: '/timezones-and-dst' },
        ]
      },
      {
        text: 'Scaling Up',
        items: [
          { text: 'Events & Observability', link: '/event-listening' },
          { text: 'Background Tasks', link: '/background-tasks' },
          { text: 'Distributed Coordination', link: '/distributed-coordination' },
          { text: 'Logging', link: '/logging' },
        ]
      },
      {
        text: 'Integrations',
        items: [
          { text: 'NestJS', link: '/nestjs' },
        ]
      },
      {
        text: 'Recipes',
        items: [
          { text: 'Cookbook', link: '/cookbook' },
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'API Reference', link: '/api-reference' },
          { text: 'Migrating from v3', link: '/migrating-from-v3' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'npm', link: 'https://www.npmjs.com/package/node-cron' },
      { icon: 'github', link: 'https://github.com/node-cron/node-cron' }
    ],

    footer: {
      message: 'Released in 2016 under the ISC License.',
      copyright: 'Made with 💚 by @merencia'
    }
  }
})
