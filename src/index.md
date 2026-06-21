---
# https://vitepress.dev/reference/default-theme-home-page
layout: home
title: "node-cron: Job Scheduling for Node.js"
description: Schedule recurring tasks, prevent overlapping runs, coordinate across instances, and run heavy jobs in background processes. Zero dependencies, written in TypeScript.

hero:
  name: "Node-Cron"
  text: "Job Scheduling for Node.js"
  tagline: Schedule tasks with cron expressions. Prevent overlaps. Coordinate across instances. Run jobs in background processes. Zero dependencies.
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
  - title: 🔁 Cron Scheduling
    details: Schedule recurring tasks with standard cron expressions, from seconds through weekdays, with ranges, steps, lists, and named months/weekdays.
    link: /cron-syntax
  - title: 🛡️ Overlap Prevention
    details: Long-running task still going when the next tick fires? noOverlap skips the run instead of stacking executions. One flag, no custom locking.
    link: /prevent-overlapping-cron-jobs
  - title: 🌐 Distributed Coordination
    details: Running multiple replicas? Ensure each scheduled fire executes on exactly one instance, with env-var flags or a Redis coordinator.
    link: /run-cron-jobs-across-multiple-servers
  - title: ⚙️ Background Processes
    details: Move heavy jobs into isolated forked processes so a slow task never blocks your main event loop.
    link: /run-background-jobs-in-nodejs
  - title: 🕹️ Runtime Control
    details: Start, stop, destroy, and inspect tasks at runtime with a single consistent interface, plus lifecycle events for observability.
    link: /task-lifecycle
  - title: 🪶 Zero Dependencies
    details: Pure JavaScript, written in TypeScript. No native bindings, no external packages. Production-ready and tiny.
---


## From one line to production

> These docs cover **node-cron v4**.

node-cron is designed to grow with you. The same `schedule` call you write on day one is the one you keep; you just add options as your needs grow.

```js
import cron from 'node-cron';

// Day one: run something every minute.
cron.schedule('* * * * *', () => {
  console.log('Hello from node-cron');
});
```

Later, the same task can run in a specific timezone, skip overlapping runs, coordinate across a fleet, and run in its own process:

```js
import cron from 'node-cron';

const task = cron.schedule('0 3 * * *', './tasks/nightly-backup.js', {
  name: 'nightly-backup',
  timezone: 'America/Sao_Paulo',
  noOverlap: true,
  distributed: true,
});

task.on('execution:failed', (ctx) => {
  console.error('backup failed:', ctx.execution?.error);
});
```

## When to use node-cron

- Recurring jobs on a schedule (cron expressions with second-level precision)
- Overlap prevention for long-running tasks
- Coordinating scheduled tasks across multiple instances or replicas
- Running heavy jobs in isolated background processes
- Runtime control: start, stop, inspect, and observe tasks programmatically

::: tip Need more than cron?
Check out [**Sidequest.js**](https://sidequestjs.com), a distributed job runner for Node.js inspired by Oban and Sidekiq. Retries, priorities, schedules, uniqueness, and a web dashboard. Works with Postgres, MySQL, SQLite and MongoDB.
:::

## When to consider something else

- **Durable job queues with retries and priorities**: use [Sidequest](https://sidequestjs.com), [BullMQ](https://bullmq.io), or [Agenda](https://github.com/agenda/agenda)
- **Persistent workflow orchestration**: use [Temporal](https://temporal.io) or [Inngest](https://inngest.com)
- **Exactly-once guarantees across crashes**: node-cron coordinates but does not persist state to a database; a queue or workflow engine is a better fit

## Explore the docs

Follow the journey in order, or jump straight to what you need:

1. **[Quickstart](/getting-started)**: install and run your first task in five minutes.
2. **[Cron Syntax](/cron-syntax)**: learn how to express *when* a task should run.
3. **[Task Lifecycle & Status](/task-lifecycle)**: start, stop, and inspect tasks at runtime.
4. **[Scheduling Options](/scheduling-options)**: timezones, overlap prevention, limits, and jitter.
5. **[Events & Observability](/event-listening)**: react to every moment in a task's life.
6. **[Background Tasks](/background-tasks)**: run jobs in isolated processes.
7. **[Distributed Coordination](/distributed-coordination)**: run a task on one instance per fire across a fleet.
8. **[Logging](/logging)**: route node-cron's output through your own logger.
9. **[Cookbook](/cookbook)**: copy-paste recipes for common jobs.

## Common problems

- [How to prevent overlapping cron jobs](/prevent-overlapping-cron-jobs)
- [How to run cron jobs across multiple servers](/run-cron-jobs-across-multiple-servers)
- [How to run background jobs in Node.js](/run-background-jobs-in-nodejs)
