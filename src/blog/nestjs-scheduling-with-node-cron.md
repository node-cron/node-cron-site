---
title: "NestJS scheduling, upgraded: a drop-in @nestjs/schedule replacement"
date: 2026-06-19
author: Lucas Merencia
description: "@nestjs/schedule covers @Cron, @Interval and @Timeout and stops there. @node-cron/nestjs is a drop-in replacement, same decorators, one-line import swap, that adds distributed scheduling, background tasks in a forked process, lifecycle events and jitter."
sidebar: false
head:
  - - meta
    - name: keywords
      content: "nestjs cron, nestjs scheduler, @nestjs/schedule alternative, nestjs distributed cron, nestjs background job, nestjs scheduled tasks, node-cron nestjs"
  - - meta
    - property: "og:type"
      content: article
  - - meta
    - property: "og:title"
      content: "NestJS scheduling, upgraded: a drop-in @nestjs/schedule replacement"
  - - meta
    - property: "og:description"
      content: "Keep @Cron/@Interval/@Timeout, swap one import, and gain distributed scheduling, background tasks, events and jitter in NestJS."
---

# NestJS scheduling, upgraded: a drop-in `@nestjs/schedule` replacement

`@nestjs/schedule` is what most NestJS apps reach for, and for a single instance running a few jobs it is fine. It gives you `@Cron`, `@Interval` and `@Timeout`, wired into DI, and that is the whole story. The ceiling shows up the moment your app grows:

- You scale to **more than one replica**, and every job fires on every instance.
- You have a **heavy job** that blocks the event loop, and there is no way to isolate it.
- You want to **observe** runs (succeeded? failed? how long?), and there are no events.
- You need **per-task timezones** that survive DST, jitter, or an execution cap, and they are not there.

[`@node-cron/nestjs`](/nestjs) is a drop-in replacement backed by [node-cron](/). Same decorators, same `ScheduleModule`, same `SchedulerRegistry`. You migrate by **swapping one import**:

```ts
- import { ScheduleModule, Cron, Interval, Timeout, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
+ import { ScheduleModule, Cron, Interval, Timeout, CronExpression, SchedulerRegistry } from '@node-cron/nestjs';
```

Your decorated methods, the `CronExpression` values, and `ScheduleModule.forRoot()` stay exactly as they are. Here is what that swap buys you.

## Run once across a fleet

This is the big one. Three replicas behind a load balancer all run the same `@Cron`, so the nightly job runs three times. The usual reaction is "node-cron does not scale, reach for a queue." Neither is right: it is a coordination problem, and `@node-cron/nestjs` solves it with one option.

```ts
@Cron('0 3 * * *', { name: 'nightly-backup', distributed: true })
handleBackup() {
  // runs on exactly one instance per fire
}
```

Out of the box, a `NODE_CRON_RUN` env var designates one runner (zero dependencies). For real high availability, where any instance can win each fire and it survives a node going down, pass a Redis coordinator to the module:

```ts
ScheduleModule.forRoot({ coordinator: new RedisLockCoordinator(redis) })
```

`@nestjs/schedule` has no equivalent. (The full story is in [Distributed Coordination](/distributed-coordination).)

## Heavy jobs in their own process

Decorate a property with `@BackgroundCron` and the job runs in a **forked child process**, so a CPU-heavy report never stalls your API:

```ts
@Injectable()
export class ReportTask {
  @BackgroundCron('0 * * * *', { name: 'report' })
  taskFile = __filename; // the task lives in `export const task` in this file
}
```

It works with `distributed: true` too: heavy **and** once-per-fire across the fleet.

## Observability for free

Because `SchedulerRegistry.getCronJob(name)` returns a node-cron `ScheduledTask` (not the `cron` package's `CronJob`), you can subscribe to lifecycle events and drive the job:

```ts
const task = this.registry.getCronJob('nightly-backup');
task.on('execution:failed', (ctx) => alert(ctx.execution?.error));
task.getNextRun();   // Date | null
task.execute();      // run it now, off-schedule
```

## Migrating: the two things that differ

The decorators are identical, so most apps need no code changes. Two intentional differences are worth a grep:

1. **`getCronJob(name)` returns a `ScheduledTask`.** Update calls to the old `CronJob` API: `nextDate()` becomes `getNextRun()`, `running` becomes `getStatus()`/`isBusy()`, `fireOnTick()` becomes `execute()`.
2. **`utcOffset` is ignored** (with a warning). node-cron schedules by IANA timezone, which is more robust across DST. Use `timeZone: 'America/Sao_Paulo'` instead of a raw offset.

That is the whole migration. Full details, options, and the `SchedulerRegistry` equivalence table are in the [NestJS guide](/nestjs).

## When `@nestjs/schedule` is enough

If you run a single instance, never block the loop, and do not care about events, the built-in is fine, no need to switch. The case for `@node-cron/nestjs` is everything past that: fleets, heavy jobs, observability. And since it is a one-line swap, you do not have to decide up front; adopt it when you hit the wall.

- Guide: [`@node-cron/nestjs`](/nestjs)
- Running across replicas? [Distributed Coordination](/distributed-coordination)
