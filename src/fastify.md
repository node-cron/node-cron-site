---
outline: deep
title: Fastify (@node-cron/fastify)
description: Schedule jobs in Fastify with @node-cron/fastify, the official node-cron plugin. Register it like @fastify/schedule and get real cron expressions, distributed-ready scheduling, background tasks in a forked process, timezones and per-execution events.
---

# Fastify

[`@node-cron/fastify`](https://www.npmjs.com/package/@node-cron/fastify) is the **official** Fastify plugin for node-cron. It registers like [`@fastify/schedule`](https://github.com/fastify/fastify-schedule), the same `fastify.register`, the same `fastify.scheduler` decorator, the same start-on-ready / stop-on-close lifecycle, but backed by node-cron, so jobs are described with **real cron expressions** and you get distributed-ready scheduling, background tasks, timezones and per-execution events.

## `@fastify/schedule` vs `@node-cron/fastify`

| | `@fastify/schedule` (toad-scheduler) | `@node-cron/fastify` (node-cron) |
| --- | --- | --- |
| `register` + `fastify.scheduler` + lifecycle | yes | yes (same) |
| Job definition | toad-scheduler `Job` objects | cron expressions (with seconds) |
| [Run once across a fleet](/distributed-coordination) | no | `distributed: true` + a coordinator |
| [Background tasks](/background-tasks) (forked process) | no | `run: '<file path>'` |
| IANA timezones (DST-correct) | no | `timezone` option |
| Per-execution [events](/event-listening) | no | `task.on('execution:*')` |
| Overlap control / execution caps | limited | `noOverlap`, `maxExecutions` |

## Install

`fastify` (v5) and `node-cron` are peer dependencies, so the plugin shares the single copy your app already has:

```bash
npm install @node-cron/fastify node-cron fastify
```

## Quick start

Register the plugin and declare jobs in `tasks`. They're created on registration and **start when Fastify emits `onReady`**, then are **destroyed on `onClose`**.

```ts
import Fastify from 'fastify';
import { fastifyNodeCron } from '@node-cron/fastify';

const app = Fastify();

await app.register(fastifyNodeCron, {
  tasks: [
    {
      cron: '0 3 * * *', // every day at 03:00
      name: 'nightly-backup',
      run: async () => {
        await runBackup();
      },
    },
  ],
});

await app.listen({ port: 3000 });
```

## Scheduling imperatively

The plugin decorates the instance as `fastify.scheduler` (alias `fastify.cron`, the same object), so you can schedule from a route or another plugin:

```ts
app.post('/reports/enable', async () => {
  app.scheduler.schedule('*/5 * * * *', () => sendReport(), { name: 'report' });
  return { scheduled: true };
});
```

## Plugin options

```ts
await app.register(fastifyNodeCron, {
  tasks: [ /* FastifyNodeCronTaskDefinition[] */ ],
  runCoordinator,   // RunCoordinator for distributed tasks (process-wide)
  logger,           // custom logger (process-wide); defaults to the Fastify logger
  autoStart: true,  // start tasks on onReady (default true)
});
```

| Option | Type | Description |
| --- | --- | --- |
| `tasks` | `FastifyNodeCronTaskDefinition[]` | Jobs to register at startup. Each is `{ cron, run, ...options }`, where `options` is any [node-cron task option](/scheduling-options). |
| `runCoordinator` | `RunCoordinator` | Coordinator for `distributed: true` tasks. See [Distributed Coordination](/distributed-coordination). |
| `logger` | `Logger` | Custom [logger](/logging), applied process-wide. |
| `autoStart` | `boolean` | When `false`, nothing starts automatically; drive it via `app.scheduler.start()` / `stop()`. Defaults to `true`. |

A task definition is node-cron's options plus `cron` and `run`:

```ts
{
  cron: '0 3 * * *',          // required: the cron expression
  run: () => doWork(),        // required: an inline function OR a file path (background task)
  name: 'nightly-backup',     // any node-cron option from here on
  timezone: 'America/Sao_Paulo',
  distributed: true,
  noOverlap: true,
  maxExecutions: 10,
}
```

## The `scheduler` decorator

`fastify.scheduler` exposes a small node-cron-native API:

```ts
app.scheduler.schedule(expression, run, options?); // -> ScheduledTask
app.scheduler.getTask(id);                          // by node-cron id
app.scheduler.getTaskByName(name);                  // by your name
app.scheduler.getTasks();                           // Map<id, ScheduledTask>
app.scheduler.start();   // start owned tasks
app.scheduler.stop();    // stop owned tasks (keep them)
app.scheduler.close();   // destroy owned tasks
app.scheduler.cron;      // the underlying node-cron instance
```

`schedule` returns a node-cron [`ScheduledTask`](/task-lifecycle), so you get its full API, including [lifecycle events](/event-listening):

```ts
const task = app.scheduler.schedule('* * * * *', () => work(), { name: 'work' });

task.on('execution:started', () => app.log.info('work started'));
task.on('execution:failed', (ctx) => app.log.error(ctx.execution?.error));

task.getNextRun(); // Date | null
```

## Background tasks

Point `run` at a **file path** instead of a function and the job runs in a [forked child process](/background-tasks), so heavy or blocking work never stalls Fastify's event loop. The file must `export const task`:

```ts
// backup.task.js  —  export const task = async (ctx) => { /* heavy work */ };

await app.register(fastifyNodeCron, {
  tasks: [
    { cron: '0 3 * * *', name: 'backup', run: new URL('./backup.task.js', import.meta.url).pathname },
  ],
});
```

Use an absolute path to the compiled file (`__filename` in CommonJS, or `fileURLToPath(import.meta.url)` / `new URL(...).pathname` in ESM). See [Background Tasks](/background-tasks) for the details.

## Distributed scheduling

To run a job once per fire across a fleet, pass a [run coordinator](/distributed-coordination) to the plugin and mark the job `distributed: true`:

```ts
import { RedisLockCoordinator } from '@node-cron/redis-coordinator';

await app.register(fastifyNodeCron, {
  runCoordinator: new RedisLockCoordinator(redis),
  tasks: [
    { cron: '0 3 * * *', name: 'nightly-backup', distributed: true, run: () => runBackup() },
  ],
});
```

The plugin makes a task **coordination-ready**; the per-fire, fleet-wide election is the coordinator's job. Without one, `distributed` tasks fall back to node-cron's `NODE_CRON_RUN` env-var default (a single designated runner). The full model is in [Distributed Coordination](/distributed-coordination).

## Migrating from `@fastify/schedule`

Registration, the decorator name, and the lifecycle are the same. What changes is how you describe a job: a **cron expression** instead of a toad-scheduler `Job`.

```ts
// Before — @fastify/schedule + toad-scheduler
import { fastifySchedule } from '@fastify/schedule';
import { AsyncTask, SimpleIntervalJob } from 'toad-scheduler';

await app.register(fastifySchedule);
const task = new AsyncTask('poll', () => pollForData());
app.scheduler.addSimpleIntervalJob(new SimpleIntervalJob({ minutes: 5 }, task));
```

```ts
// After — @node-cron/fastify
import { fastifyNodeCron } from '@node-cron/fastify';

await app.register(fastifyNodeCron);
app.scheduler.schedule('*/5 * * * *', () => pollForData(), { name: 'poll' });
```

Interval jobs map to cron expressions. For sub-minute work, node-cron's 6-field expression has seconds, e.g. `'*/20 * * * * *'` for every 20 seconds.

## Next steps

- [Events & Observability](/event-listening): react to `execution:finished`, `failed`, `missed`, and more.
- [Distributed Coordination](/distributed-coordination): run a job once across a fleet.
- [Background Tasks](/background-tasks): how the forked daemon behind a file-path `run` works.
- [Scheduling Options](/scheduling-options): every task option you can pass.
