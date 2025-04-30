import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default {
  outDir: './dist',
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
          { text: 'Background Tasks', link: '/background-tasks' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'npm', link: 'https://www.npmjs.com/package/node-cron' },
      { icon: 'github', link: 'https://github.com/noce-cron/node-cron' }
    ],

    markdown:{
      toc: {
        level: [2,3,4]
      },
    },
  }
}
