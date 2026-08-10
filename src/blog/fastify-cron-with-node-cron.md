---
title: "Real cron jobs in Fastify: a drop-in @fastify/schedule alternative"
date: 2026-06-19
author: Lucas Merencia
description: "@fastify/schedule schedules interval jobs with toad-scheduler. @node-cron/fastify is the official node-cron plugin: same register + fastify.scheduler + lifecycle, but with real cron expressions, distributed scheduling, background tasks, timezones and events."
sidebar: false
head:
  - - meta
    - name: keywords
      content: "fastify cron, fastify scheduler, @fastify/schedule alternative, fastify scheduled tasks, fastify cron plugin, fastify distributed cron, node-cron fastify"
  - - meta
    - property: "og:type"
      content: article
  - - meta
    - property: "og:title"
      content: "Real cron jobs in Fastify: a drop-in @fastify/schedule alternative"
  - - meta
    - property: "og:description"
      content: "Same register + fastify.scheduler + lifecycle as @fastify/schedule, but real cron expressions, distributed scheduling, background tasks and events."
---

# Real cron jobs in Fastify: a drop-in `@fastify/schedule` alternative

Fastify's ecosystem option for scheduling is [`@fastify/schedule`](https://github.com/fastify/fastify-schedule), which wraps `toad-scheduler`. You describe jobs as interval `Job` objects (`{ minutes: 5 }`), and that covers the basics. What it does not give you: real **cron expressions**, running a job **once across a fleet**, **background tasks** in a separate process, IANA **timezones**, or per-execution **events**.

[`@node-cron/fastify`](/fastify) is the **official** node-cron plugin for Fastify. It keeps everything familiar, the same `register`, the same `fastify.scheduler` decorator, the same start-on-`ready` / stop-on-`close` lifecycle, but is backed by node-cron, so a job is a cron expression and the whole node-cron feature set comes with it.

## The same shape you already know

```ts
import Fastify from 'fastify';
import { fastifyNodeCron } from '@node-cron/fastify';

const app = Fastify();

await app.register(fastifyNodeCron, {
  tasks: [
    { cron: '0 3 * * *', name: 'nightly-backup', run: () => runBackup() },
  ],
});
```

Jobs declared in `tasks` start when Fastify is ready and are torn down on close, exactly like `@fastify/schedule`. You can also schedule imperatively from a route through the decorator:

```ts
app.post('/reports/enable', async () => {
  app.scheduler.schedule('*/5 * * * *', () => sendReport(), { name: 'report' });
  return { scheduled: true };
});
```

## What you gain

**Real cron expressions, with seconds.** `'0 3 * * *'` for 3 AM daily, `'*/20 * * * * *'` for every 20 seconds. No mapping intervals to job objects.

**Run once across a fleet.** Mark a job `distributed: true` and pass a coordinator; it fires on one instance per scheduled time, surviving the loss of any node.

```ts
await app.register(fastifyNodeCron, {
  runCoordinator: new RedisLockCoordinator(redis),
  tasks: [{ cron: '0 3 * * *', name: 'nightly-backup', distributed: true, run: () => runBackup() }],
});
```

**Background tasks.** Point `run` at a file path and the job runs in a forked child process, so heavy work never blocks Fastify's event loop.

**Events and control.** `schedule()` returns a node-cron `ScheduledTask`:

```ts
const task = app.scheduler.schedule('* * * * *', () => work(), { name: 'work' });
task.on('execution:failed', (ctx) => app.log.error(ctx.execution?.error));
task.getNextRun();
```

Plus IANA timezones (DST-correct), overlap control (`noOverlap`), and execution caps (`maxExecutions`).

## Migrating from `@fastify/schedule`

Registration, the decorator name, and the lifecycle are unchanged. The one thing that changes is how you describe a job: a cron expression instead of a `toad-scheduler` `Job`.

```ts
// Before
import { fastifySchedule } from '@fastify/schedule';
import { AsyncTask, SimpleIntervalJob } from 'toad-scheduler';

await app.register(fastifySchedule);
const task = new AsyncTask('poll', () => pollForData());
app.scheduler.addSimpleIntervalJob(new SimpleIntervalJob({ minutes: 5 }, task));
```

```ts
// After
import { fastifyNodeCron } from '@node-cron/fastify';

await app.register(fastifyNodeCron);
app.scheduler.schedule('*/5 * * * *', () => pollForData(), { name: 'poll' });
```

An interval of `{ minutes: 5 }` becomes `'*/5 * * * *'`; for sub-minute work use the 6-field form with seconds.

## When to switch

If your scheduling needs are a couple of fixed intervals on one instance, `@fastify/schedule` is perfectly fine. Reach for `@node-cron/fastify` when you want true cron expressions, run across replicas, isolate heavy work, or observe executions, and since registration and lifecycle are identical, switching is mostly a find-and-replace.

- Guide: [`@node-cron/fastify`](/fastify)
- Running across replicas? [Distributed Coordination](/distributed-coordination)
