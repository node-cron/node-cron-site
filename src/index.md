---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Node-Cron"
  text: "A Lightweight Task Scheduler for Node.js"
  tagline: Schedule Tasks with Ease and Precision in Node.js
  image:
    src: /node-cron.png
    alt: node-cron
  actions:
    - theme: brand
      text: Getting Started
      link: /getting-started

features:
  - title: 🔁 Cron Syntax Scheduling
    details: Easily schedule recurring tasks using standard cron syntax — minutes, hours, days, months, and weekdays.
  - title: 🪶 Zero Dependencies
    details: Lightweight and production-ready. Pure JavaScript with no native or external dependencies.
  - title: 🕹️ Full Runtime Control
    details: Start, stop, or destroy scheduled tasks dynamically using simple methods like `.start()`, `.stop()`, and `.destroy()`.
  - title: ⚙️ Runs in Background Without Blocking
    details: Executes tasks in the background without blocking the Node.js event loop — ideal for non-disruptive automation.
---


::: tip Need more than cron?
🚀 Check out [**Sidequest.js**](https://sidequestjs.com), a distributed job runner for Node.js inspired by Oban and Sidekiq.

- Supports retries, priorities, schedules, and uniqueness
- Works with Postgres, MySQL, SQLite and MongoDB
- Includes a clean web dashboard for real-time monitoring
:::