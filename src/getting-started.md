---
title: Quickstart
description: Install node-cron and run your first scheduled task in five minutes, in CommonJS and ESM, plus what actually happens when a task runs.
---

# Quickstart

`node-cron` is a lightweight task scheduler for Node.js, written in TypeScript and inspired by [GNU crontab](https://www.gnu.org/software/mcron/manual/html_node/Crontab-file.html). It runs recurring tasks on a schedule you describe with standard cron syntax, and has **zero runtime dependencies**.

This page gets you from zero to a running task in five minutes. By the end you'll have scheduled a task, seen it run, and know where to go next.

## 1. Install

```bash
npm install node-cron
```

`node-cron` ships both CommonJS and ESM builds and bundled TypeScript types, so it works out of the box in any modern Node.js project.

> Requires **Node.js 20 or newer**. Tested on Node 20, 22, and 24.

## 2. Schedule your first task

Import node-cron and schedule a function to run every minute.

::: code-group

```js [ESM]
import cron from 'node-cron';

cron.schedule('* * * * *', () => {
  console.log('Running a task every minute');
});
```

```js [CommonJS]
const cron = require('node-cron');

cron.schedule('* * * * *', () => {
  console.log('Running a task every minute');
});
```

:::

That's it. The `* * * * *` expression means "every minute". Run the file and you'll see the message print at the top of each minute.

## 3. What just happened

`cron.schedule(expression, task)` does two things:

1. **Creates** a scheduled task from your cron expression and function.
2. **Starts** it immediately, so it begins matching the clock right away.

It returns a [`ScheduledTask`](/task-lifecycle) object you can hold onto to control the task later:

```js
import cron from 'node-cron';

const task = cron.schedule('* * * * *', () => {
  console.log('tick');
});

task.stop();    // pause it
task.start();   // resume it
task.destroy(); // remove it for good
```

> 💡 Want a task that does **not** start right away? Use [`cron.createTask`](/api-reference#createtask-expression-func-options) instead of `cron.schedule`. Same arguments, but you call `.start()` yourself.

## 4. Tasks receive a context

Every task function is called with a `TaskContext` describing the run, useful for logging and metrics:

```js
import cron from 'node-cron';

cron.schedule('* * * * *', (ctx) => {
  console.log(`scheduled for: ${ctx.dateLocalIso}`);
  console.log(`started at:    ${ctx.triggeredAt.toISOString()}`);
});
```

The full `TaskContext` shape, and the events that carry it, is covered in [Events & Observability](/event-listening#taskcontext).

## Next steps

You've scheduled, run, and controlled a task. Now learn to express *exactly* when it should run:

- **[Cron Syntax](/cron-syntax)**: ranges, steps, lists, and named months/weekdays.
- [Task Lifecycle & Status](/task-lifecycle): what `start`, `stop`, and `getStatus` actually do.
- [Scheduling Options](/scheduling-options): timezones, overlap prevention, and execution limits.
