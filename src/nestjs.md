---
outline: deep
title: NestJS (@node-cron/nestjs)
description: Use node-cron in NestJS with @node-cron/nestjs, a drop-in replacement for @nestjs/schedule. Keep the same @Cron, @Interval and @Timeout decorators and gain distributed scheduling, background tasks in a forked process, lifecycle events, jitter and DST-correct timezones that @nestjs/schedule does not have.
---

# NestJS

NestJS ships its own scheduler, [`@nestjs/schedule`](https://docs.nestjs.com/techniques/task-scheduling) (backed by the `cron` package). It gives you `@Cron`, `@Interval` and `@Timeout`, and stops there.

[`@node-cron/nestjs`](https://www.npmjs.com/package/@node-cron/nestjs) is a **drop-in replacement** backed by node-cron: the **same** decorators, the same `ScheduleModule` and `SchedulerRegistry`, plus everything node-cron adds, distributed scheduling, background tasks in a forked process, lifecycle events, execution caps and jitter. Migrating is a **one-line import swap**.

## `@nestjs/schedule` vs `@node-cron/nestjs`

| | `@nestjs/schedule` | `@node-cron/nestjs` |
| --- | --- | --- |
| `@Cron` / `@Interval` / `@Timeout` | yes | yes (same API) |
| `CronExpression` enum | yes | yes (identical values) |
| `SchedulerRegistry` | yes | yes (returns a node-cron [`ScheduledTask`](/task-lifecycle)) |
| Skip overlapping runs | `waitForCompletion` | `waitForCompletion` / `noOverlap` |
| Lifecycle [events](/event-listening) (`execution:finished`, …) | no | yes |
| [Run once across a fleet](/distributed-coordination) | no | `distributed: true` |
| Per-fire HA coordination (Redis) | no | [`@node-cron/redis-coordinator`](/distributed-coordination#the-redis-coordinator) |
| [Background tasks](/background-tasks) (forked process) | no | `@BackgroundCron` |
| Cap executions / random jitter | no | `maxExecutions`, `maxRandomDelay` |
| DST-correct IANA timezones | partial | yes ([Timezones & DST](/timezones-and-dst)) |

## Install

`node-cron` is a peer dependency, so install it alongside the package (the NestJS peers are already in your app):

```bash
npm install @node-cron/nestjs node-cron
```

It supports NestJS 9, 10 and 11, and needs **node-cron >= 4.4.1**.

## Quickstart

Import `ScheduleModule.forRoot()` once, then decorate provider methods. This is identical to `@nestjs/schedule`.

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@node-cron/nestjs';
import { TasksService } from './tasks.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [TasksService],
})
export class AppModule {}
```

```ts
// tasks.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, Interval, Timeout, CronExpression } from '@node-cron/nestjs';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_30_SECONDS)
  handleCron() {
    this.logger.log('Called every 30 seconds');
  }

  @Interval(10_000)
  handleInterval() {
    this.logger.log('Called every 10 seconds');
  }

  @Timeout(5_000)
  handleTimeout() {
    this.logger.log('Called once, 5 seconds after startup');
  }
}
```

The decorated methods run inside your NestJS process with full dependency injection, exactly as they do with `@nestjs/schedule`.

## `@Cron` options

`@Cron(expression, options)` accepts everything `@nestjs/schedule` does, plus node-cron's extras:

```ts
@Cron('0 3 * * *', {
  name: 'nightly-backup',     // look it up via SchedulerRegistry
  timeZone: 'America/Sao_Paulo',
  waitForCompletion: true,    // alias: noOverlap — skip a run if the previous is still going
  initialDelay: 2_000,        // delay the first run after bootstrap (ms)

  // node-cron extras:
  distributed: true,          // run once across a fleet (see below)
  distributedLease: 5 * 60_000,
  maxExecutions: 10,          // destroy the job after N runs
  maxRandomDelay: 1_000,      // jitter (ms) to spread fleet load
})
handleCron() {}
```

See [Scheduling Options](/scheduling-options) for the full semantics of each.

## Inspecting and controlling jobs: `SchedulerRegistry`

Inject `SchedulerRegistry` and look a job up by `name`. The key upgrade: `getCronJob(name)` returns a node-cron [`ScheduledTask`](/task-lifecycle), so you get its full API.

```ts
import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@node-cron/nestjs';

@Injectable()
export class JobsService {
  constructor(private readonly registry: SchedulerRegistry) {}

  inspect() {
    const task = this.registry.getCronJob('nightly-backup');

    task.getNextRun();   // Date | null
    task.getStatus();    // 'idle' | 'running' | 'stopped' | 'destroyed'
    task.getNextRuns(3); // preview the next 3 fire times

    task.on('execution:failed', (ctx) => {
      // observe failures, missed runs, skipped (distributed) runs, etc.
    });

    return task.execute(); // run it now, off-schedule
  }
}
```

These methods come from [Task Lifecycle & Status](/task-lifecycle) and [Events & Observability](/event-listening).

## Background tasks

A `@BackgroundCron` runs in a **forked child process** with its own event loop, so heavy or blocking work never stalls your NestJS process. This is a node-cron feature `@nestjs/schedule` does not have.

Unlike `@Cron` (a method whose body runs inline), `@BackgroundCron` decorates a **property whose value is the path to the task file**. The cleanest layout keeps the task and its schedule in one self-referencing file:

```ts
// report.task.ts
import { Injectable } from '@nestjs/common';
import { BackgroundCron, type TaskContext } from '@node-cron/nestjs';

// (A) Runs in the forked CHILD process. A plain function, no Nest DI here:
//     node-cron imports this compiled file and calls `task`.
export const task = async (ctx: TaskContext) => {
  // heavy, isolated work
};

// (B) Runs in the MAIN process. The property holds this file's own path.
@Injectable()
export class ReportTask {
  @BackgroundCron('0 * * * *', { name: 'report' })
  taskFile = __filename;
}
```

Register `ReportTask` in a module's `providers` and that's it: on bootstrap it's added to `SchedulerRegistry`, forked, started, and cleaned up on shutdown.

::: warning A few rules
- The task file **must `export const task`** — that named export is what the child runs. The `@Injectable` class is ignored by the child.
- Point the property at the **compiled `.js`**: `__filename` (CommonJS, the `nest build` default) or `fileURLToPath(import.meta.url)` (ESM).
- `export const task` gets **no Nest DI** (it's a separate process). It can use `process.env` and open its own connections. If it truly needs DI, bootstrap a lean standalone context inside `task` with `NestFactory.createApplicationContext` (do not bootstrap your full `AppModule`, or its `ScheduleModule` re-schedules everything in the child).
:::

All `@Cron` options work here too, including `distributed`. See [Background Tasks](/background-tasks) for how the forked daemon works.

## Distributed scheduling

To run a job **once per fire across a fleet**, give the module a [run coordinator](/distributed-coordination) and mark the job `distributed: true`. For high-availability, per-fire coordination, use [`@node-cron/redis-coordinator`](/distributed-coordination#the-redis-coordinator):

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@node-cron/nestjs';
import { RedisLockCoordinator } from '@node-cron/redis-coordinator';
import { createClient } from 'redis';

const redis = createClient();
await redis.connect();

@Module({
  imports: [
    ScheduleModule.forRoot({ coordinator: new RedisLockCoordinator(redis) }),
  ],
})
export class AppModule {}
```

```ts
@Cron('0 3 * * *', { name: 'nightly-backup', distributed: true })
handleBackup() {
  // runs on exactly one instance per fire
}
```

Without a coordinator, `distributed` jobs fall back to node-cron's `NODE_CRON_RUN` env-var default (a single designated runner). The full model, the guarantee, and the `execution:skipped` event are covered in [Distributed Coordination](/distributed-coordination).

## Migrating from `@nestjs/schedule`

For most apps, migrating is a **single line**, swap the import:

```ts
- import { ScheduleModule, Cron, Interval, Timeout, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
+ import { ScheduleModule, Cron, Interval, Timeout, CronExpression, SchedulerRegistry } from '@node-cron/nestjs';
```

Your decorated methods, the `CronExpression` values, and `ScheduleModule.forRoot()` all stay the same. Two things differ on purpose:

### `getCronJob(name)` returns a node-cron `ScheduledTask`

This is the upgrade, but it's a different shape than the `cron` package's `CronJob`. Update any code that read the old API:

| `@nestjs/schedule` (`CronJob`) | `@node-cron/nestjs` (`ScheduledTask`) |
| --- | --- |
| `job.nextDate()` / `job.nextDates(n)` | [`task.getNextRun()`](/task-lifecycle#getnextrun) / [`task.getNextRuns(n)`](/task-lifecycle#getnextruns-count) |
| `job.running` (boolean) | [`task.getStatus()`](/task-lifecycle#getstatus) (`'running'` / `'idle'` / `'stopped'`) or [`task.isBusy()`](/task-lifecycle#isbusy) |
| `job.lastDate()` | not stored; observe runs via [`task.on('execution:finished', …)`](/event-listening) |
| `job.start()` / `job.stop()` | `task.start()` / `task.stop()` (same) |
| `job.fireOnTick()` | [`task.execute()`](/task-lifecycle#execute) |

### `utcOffset` is not supported

node-cron schedules by IANA timezone, not by raw offset. If a `@Cron` sets `utcOffset`, it is **ignored with a warning** and the job still runs:

```
WARN [Scheduler] Cron job "..." sets `utcOffset`, which node-cron does not
support. It is ignored; use `timeZone` instead.
```

Replace `utcOffset: -180` with `timeZone: 'America/Sao_Paulo'` (or the relevant IANA name). This is more robust anyway, it follows daylight-saving transitions correctly. See [Timezones & DST](/timezones-and-dst).

Everything else, decorators, options you already used, registry method names (`getCronJob`, `addCronJob`, `deleteCronJob`, …), behaves the same.

## Next steps

- [Events & Observability](/event-listening): react to `execution:finished`, `failed`, `missed`, and more on any job.
- [Distributed Coordination](/distributed-coordination): the full guide to `distributed: true` and coordinators.
- [Background Tasks](/background-tasks): how the forked daemon behind `@BackgroundCron` works.
- [Cookbook](/cookbook): a complete NestJS recipe.
