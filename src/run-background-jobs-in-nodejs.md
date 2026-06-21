---
outline: deep
title: How to Run Background Jobs in Node.js
description: Run scheduled jobs in isolated forked processes so heavy work never blocks your main event loop. Built into node-cron, no external queue needed.
---

# How to Run Background Jobs in Node.js

A CPU-heavy cron job blocks the event loop. While it runs, your HTTP server stops responding, WebSocket connections drop, and other scheduled tasks miss their window. The job finishes, but the collateral damage is already done.

## The problem

Node.js runs JavaScript on a single thread. When a scheduled task does heavy computation, file I/O, or a long synchronous operation, everything else in the process waits:

```
main thread: ──── cron fires ──── heavy job (3s) ──── blocked ────
                                  ↑ HTTP requests queue up
                                  ↑ other cron tasks miss their tick
                                  ↑ WebSocket pings time out
```

## The solution: background tasks

node-cron can run any scheduled job in an isolated forked process. Pass a **file path** instead of a function, and the job runs in its own process, completely isolated from your main event loop:

```js
// tasks/generate-report.js
export function task() {
  // This runs in a separate process.
  // Heavy computation here won't block your HTTP server.
  return generateMonthlyReport();
}
```

```js
// app.js
import cron from 'node-cron';

cron.schedule('0 2 1 * *', './tasks/generate-report.js');
```

```
main thread: ──── cron fires ──── continues serving requests ────
forked process:   ──── heavy job (3s) ──── done ────
```

Your HTTP server keeps responding. Other cron tasks fire on time. The background job runs to completion in its own process.

## Same interface, same features

A background task implements the same `ScheduledTask` interface as an inline task. The only difference: control methods return Promises because they cross a process boundary.

```js
const task = cron.schedule('0 2 * * *', './tasks/report.js');

await task.stop();      // terminates the child process
await task.start();     // re-forks and resumes
await task.destroy();   // kills the process and removes the task

task.getStatus();       // 'idle', 'running', etc.
task.getNextRun();      // next scheduled Date
```

## Events and observability

Background tasks emit the same lifecycle events, relayed from the worker to the parent:

```js
const task = cron.schedule('0 2 * * *', './tasks/report.js');

task.on('execution:started', () => console.log('report generation started'));
task.on('execution:finished', (ctx) => console.log('done:', ctx.execution?.result));
task.on('execution:failed', (ctx) => console.error('failed:', ctx.execution?.error));
```

## Manual execution

Trigger a background task immediately with `execute()`:

```js
const task = cron.schedule('0 2 * * *', './tasks/report.js');

const result = await task.execute();
```

Guard against a worker that never reports back with `executeTimeout`:

```js
const task = cron.schedule('0 2 * * *', './tasks/report.js', {
  executeTimeout: 60_000,
});
```

## Combining with other features

### With overlap prevention

```js
cron.schedule('*/5 * * * *', './tasks/sync.js', {
  noOverlap: true,
});
```

The scheduler tracks whether the forked process is still active and skips the next tick if it is.

### With distributed coordination

```js
import { setRunCoordinator } from 'node-cron';
import { RedisLockCoordinator } from '@node-cron/redis-coordinator';

setRunCoordinator(new RedisLockCoordinator(redis));

cron.schedule('0 3 * * *', './tasks/backup.js', {
  name: 'nightly-backup',
  distributed: true,
});
```

Coordination happens in the parent process over IPC. No extra configuration needed.

### With timezones

```js
cron.schedule('0 3 * * *', './tasks/backup.js', {
  timezone: 'America/Sao_Paulo',
});
```

## Writing a task file

A task file exports a `task` function. It receives a `TaskContext` with scheduling metadata:

```js
// tasks/cleanup.js
export function task(ctx) {
  console.log('scheduled for:', ctx.dateLocalIso);
  return cleanupOldRecords();
}
```

The function can be sync or async. Its return value is available in the `execution:finished` event and through `lastRun()`.

## When background tasks are not enough

Background tasks isolate work from your main event loop, but the job still runs inside your Node.js application lifecycle. For scenarios that need more:

- **Persistent job queues with retries**: [BullMQ](https://bullmq.io) or [Sidequest](https://sidequestjs.com) persist jobs to Redis/database and retry on failure.
- **Worker pools**: for CPU-bound work that needs multiple parallel workers, consider [piscina](https://github.com/piscinajs/piscina) or [workerpool](https://github.com/josdejong/workerpool).
- **External job runners**: for jobs that outlive your process, use a managed scheduler like AWS EventBridge or GCP Cloud Scheduler.

## Next steps

- [Background Tasks](/background-tasks): the full reference, including `startTimeout` and limitations.
- [How to prevent overlapping cron jobs](/prevent-overlapping-cron-jobs): prevent duplicate executions.
- [How to run cron jobs across multiple servers](/run-cron-jobs-across-multiple-servers): coordinate across instances.
