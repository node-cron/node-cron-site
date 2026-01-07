import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default {
  outDir: './dist',
  srcDir: './src',
  title: "node-cron",
  description: "A Lightweight Task Scheduler for Node.js",
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
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Documentation', link: '/getting-started' },
    ],

    sidebar: [
      {
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Cron Syntax', link: '/cron-syntax' },
          { text: 'Node-Cron Module', link: '/api-reference' },
          { text: 'Scheduling Options', link: '/scheduling-options' },
          { text: 'Task Controls', link: '/task-controls' },
          { text: 'Event Listening', link: '/event-listening' },
          { text: 'Background Tasks', link: '/background-tasks' },
          { text: 'Migrating from V3', link: '/migrating-from-v3' },
         
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
}
