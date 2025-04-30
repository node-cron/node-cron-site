import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default {
  outDir: './dist',
  srcDir: './src',
  title: "Node-Cron",
  description: "A Lightweight Task Scheduler for Node.js",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
    ],

    sidebar: [
      {
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Cron Syntax', link: '/cron-syntax' },
          { text: 'Task Controls', link: '/task-controls' },
          { text: 'Listening to Task Events', link: '/event-listening' },
          { text: 'Background Tasks', link: '/background-tasks' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'npm', link: 'https://www.npmjs.com/package/node-cron' },
      { icon: 'github', link: 'https://github.com/noce-cron/node-cron' }
    ],

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
    ]
  }
}
