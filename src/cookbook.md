---
outline: deep
title: Cookbook
description: Practical, copy-paste node-cron recipes for daily backups, periodic cleanup, timezone-aware health checks, jitter, retry on failure, run-once jobs, and graceful shutdown.
---

# Cookbook

Practical recipes for common scheduling jobs. Each one is self-contained: copy it, adjust the expression and the work, and run.

New to the API? Start with the [Quickstart](/getting-started) and [Cron Syntax](/cron-syntax).

## Daily backup at 3 AM (background)

Heavy jobs belong in a [background task](/background-tasks) so they don't block your event loop. Run it in a fixed timezone so "3 AM" is unambiguous.

```js
// app.js
import cron from 'node-cron';

const backup = cron.schedule('0 3 * * *', './tasks/backup.js', {
  name: 'daily-backup',
  timezone: 'America/Sao_Paulo',
  noOverlap: true,
});

backup.on('execution:failed', (ctx) => {
  console.error('backup failed:', ctx.execution?.error?.message);
});
```

```js
// tasks/backup.js
export async function task() {
  await dumpDatabase();
  await uploadToStorage();
}
```

## Periodic cleanup every 15 minutes

```js
import cron from 'node-cron';

cron.schedule('*/15 * * * *', async () => {
  const removed = await deleteExpiredSessions();
  console.log(`cleaned up ${removed} expired sessions`);
});
```

## Timezone-aware health check on weekdays

Run only during business hours (09:00–17:00, Mon–Fri) in a specific timezone.

```js
import cron from 'node-cron';

cron.schedule('0 9-17 * * 1-5', async () => {
  const ok = await pingService();
  if (!ok) await notifyOnCall();
}, {
  name: 'business-hours-healthcheck',
  timezone: 'Europe/London',
});
```

## Spread load with jitter

When many instances run the same hourly job, stagger them with up to 30s of random delay to avoid a thundering herd.

```js
import cron from 'node-cron';

cron.schedule('0 * * * *', async () => {
  await refreshSharedCache();
}, {
  maxRandomDelay: 30_000,
});
```

## Retry on failure

React to `execution:failed` and re-run the task with a backoff. `execute()` triggers an immediate, off-schedule run.

```js
import cron from 'node-cron';

const task = cron.schedule('*/10 * * * *', async () => {
  await syncRemoteData(); // throws on failure
});

const MAX_RETRIES = 3;
let attempts = 0;

task.on('execution:failed', async (ctx) => {
  if (attempts >= MAX_RETRIES) {
    attempts = 0;
    console.error('giving up after retries:', ctx.execution?.error?.message);
    return;
  }
  attempts++;
  const delay = 1000 * 2 ** attempts; // exponential backoff
  console.warn(`retry ${attempts} in ${delay}ms`);
  setTimeout(() => task.execute().catch(() => {}), delay);
});

task.on('execution:finished', () => {
  attempts = 0; // reset after a clean run
});
```

## Run exactly once

Set `maxExecutions: 1` and the task destroys itself after a single run. Combine with `execute()` for an immediate one-shot.

```js
import cron from 'node-cron';

// Runs once at the next minute boundary, then self-destructs.
cron.schedule('* * * * *', () => {
  console.log('one-time job');
}, {
  maxExecutions: 1,
});
```

## Inspect everything that's scheduled

`getTasks()` returns every registered task, handy for a status endpoint or dashboard.

```js
import cron from 'node-cron';

function listTasks() {
  return [...cron.getTasks().values()].map((task) => ({
    id: task.id,
    name: task.name,
    status: task.getStatus(),
    nextRun: task.getNextRun(),
  }));
}

console.table(listTasks());
```

## Graceful shutdown

Stop and destroy every task when the process is terminating. `destroy()` is async for background tasks, so await them all.

```js
import cron from 'node-cron';

async function shutdown() {
  await Promise.all(
    [...cron.getTasks().values()].map((task) => task.destroy())
  );
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
```

## NestJS: a scheduled job you can also trigger on demand

With [`@node-cron/nestjs`](/nestjs) you schedule with the familiar decorators and still get node-cron's task API. Here a job runs every 30 seconds, and an endpoint triggers it off-schedule and reports when it's next due, using `SchedulerRegistry`.

```ts
// tasks.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@node-cron/nestjs';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_30_SECONDS, { name: 'sync' })
  sync() {
    this.logger.log('syncing…');
  }
}
```

```ts
// sync.controller.ts
import { Controller, Post, Get } from '@nestjs/common';
import { SchedulerRegistry } from '@node-cron/nestjs';

@Controller('sync')
export class SyncController {
  constructor(private readonly registry: SchedulerRegistry) {}

  @Post() // run it now, without waiting for the schedule
  runNow() {
    return this.registry.getCronJob('sync').execute();
  }

  @Get('next')
  next() {
    return { nextRun: this.registry.getCronJob('sync').getNextRun() };
  }
}
```

For a job that should run on only one instance across a fleet, add `distributed: true` and a coordinator, see the [NestJS guide](/nestjs#distributed-scheduling).

## Fastify: scheduled jobs as a plugin

With [`@node-cron/fastify`](/fastify) you declare jobs when registering the plugin (they start on `onReady`, stop on `onClose`) and can schedule more imperatively from a route via `fastify.scheduler`.

```ts
import Fastify from 'fastify';
import { fastifyNodeCron } from '@node-cron/fastify';

const app = Fastify();

await app.register(fastifyNodeCron, {
  tasks: [
    { cron: '0 3 * * *', name: 'nightly-backup', run: () => runBackup() },
  ],
});

// schedule on demand, and inspect via the decorator
app.post('/reports/enable', async () => {
  app.scheduler.schedule('*/5 * * * *', () => sendReport(), { name: 'report' });
  return { nextRun: app.scheduler.getTaskByName('report')?.getNextRun() };
});

await app.listen({ port: 3000 });
```

## Next steps

- [API Reference](/api-reference): every function in the module.
- [Events & Observability](/event-listening): the events these recipes hook into.
