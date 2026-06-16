---
# https://vitepress.dev/reference/default-theme-home-page
layout: home
title: node-cron, A Lightweight Task Scheduler for Node.js
description: Schedule recurring tasks in Node.js with full cron syntax. Zero dependencies, runtime control, background processes, events, and logging. Start in one line, scale when you need to.

hero:
  name: "Node-Cron"
  text: "A Lightweight Task Scheduler for Node.js"
  tagline: One line to your first scheduled task, with room to grow into timezones, background processes, events, and observability.
  image:
    src: /node-cron.png
    alt: node-cron
  actions:
    - theme: brand
      text: Quickstart
      link: /getting-started
    - theme: alt
      text: Cron Syntax
      link: /cron-syntax
    - theme: alt
      text: API Reference
      link: /api-reference

features:
  - title: 🔁 Standard Cron Syntax
    details: Schedule recurring tasks with the cron expressions you already know, from seconds through weekdays, ranges, steps, lists, and month/day names.
    link: /cron-syntax
  - title: 🪶 Zero Dependencies
    details: Pure JavaScript, written in TypeScript. No native bindings, no external packages. Production-ready and tiny.
  - title: 🕹️ Full Runtime Control
    details: Start, stop, destroy, and inspect tasks at runtime with a single consistent interface, plus lifecycle events for observability.
    link: /task-lifecycle
  - title: ⚙️ Background Processes
    details: Move heavy jobs into isolated forked processes so a slow task never blocks your main event loop.
    link: /background-tasks
---


## From one line to production

node-cron is designed to grow with you. The same `schedule` call you write on day one is the one you keep; you just add options as your needs grow.

```js
import cron from 'node-cron';

// Day one: run something every minute.
cron.schedule('* * * * *', () => {
  console.log('Hello from node-cron');
});
```

Later, the same task can run in a specific timezone, skip overlapping runs, report failures, and run in its own process, all without changing how you think about it:

```js
import cron from 'node-cron';

const task = cron.schedule('0 3 * * *', './tasks/nightly-backup.js', {
  name: 'nightly-backup',
  timezone: 'America/Sao_Paulo',
  noOverlap: true,
});

task.on('execution:failed', (ctx) => {
  console.error('backup failed:', ctx.execution?.error);
});
```

Follow the journey in order, or jump straight to what you need:

1. **[Quickstart](/getting-started)**: install and run your first task in five minutes.
2. **[Cron Syntax](/cron-syntax)**: learn how to express *when* a task should run.
3. **[Task Lifecycle & Status](/task-lifecycle)**: start, stop, and inspect tasks at runtime.
4. **[Scheduling Options](/scheduling-options)**: timezones, overlap prevention, limits, and jitter.
5. **[Events & Observability](/event-listening)**: react to every moment in a task's life.
6. **[Background Tasks](/background-tasks)**: run jobs in isolated processes.
7. **[Logging](/logging)**: route node-cron's output through your own logger.
8. **[Cookbook](/cookbook)**: copy-paste recipes for common jobs.


::: tip Need more than cron?
🚀 Check out [**Sidequest.js**](https://sidequestjs.com), a distributed job runner for Node.js inspired by Oban and Sidekiq.

- Supports retries, priorities, schedules, and uniqueness
- Works with Postgres, MySQL, SQLite and MongoDB
- Includes a clean web dashboard for real-time monitoring
:::
