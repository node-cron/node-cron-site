---
outline: deep
title: How to Prevent Overlapping Cron Jobs in Node.js
description: Prevent duplicate cron executions when a task runs longer than its interval. One option, no external locking, built into node-cron.
---

# How to Prevent Overlapping Cron Jobs in Node.js

A cron job scheduled to run every minute takes 90 seconds to finish. Now two copies are running at once: the first is still going, and the second just started. This is an overlapping execution, and it causes duplicate work, race conditions, and data corruption.

## The problem

Without overlap prevention, a scheduler fires on every tick regardless of whether the previous run finished:

```
minute 1: task starts ──────────────────────── still running
minute 2:               task starts (overlap!) ──────────
minute 3:                              task starts (overlap!) ───
```

## The solution: `noOverlap`

node-cron has built-in overlap prevention. Set `noOverlap: true` and a tick that fires while the previous run is still active is skipped instead of stacked:

```js
import cron from 'node-cron';

cron.schedule('* * * * *', async () => {
  await longRunningJob();
}, {
  noOverlap: true,
});
```

```
minute 1: task starts ──────────────────────── finishes
minute 2:               (skipped, previous still running)
minute 3:                                       task starts ───
```

No external locking, no Redis, no database. It works in-process with zero configuration beyond the flag.

## Detecting skipped runs

When a run is skipped due to overlap, the task emits an `execution:overlap` event. Use it for logging, metrics, or alerting:

```js
const task = cron.schedule('* * * * *', async () => {
  await longRunningJob();
}, {
  noOverlap: true,
});

task.on('execution:overlap', () => {
  console.warn('Skipped: previous execution still running');
});
```

## Combining with other features

`noOverlap` works with every other node-cron feature:

### With background tasks

```js
cron.schedule('*/5 * * * *', './tasks/heavy-sync.js', {
  noOverlap: true,
});
```

The job runs in an isolated forked process, and the scheduler still tracks whether it is active.

### With distributed coordination

```js
cron.schedule('0 * * * *', syncInventory, {
  name: 'sync-inventory',
  noOverlap: true,
  distributed: true,
});
```

Only one instance in the fleet runs each fire, and within that instance, overlapping runs are prevented.

### With events and observability

```js
const task = cron.schedule('*/30 * * * * *', processQueue, {
  noOverlap: true,
});

task.on('execution:started', () => console.log('started'));
task.on('execution:finished', (ctx) => console.log('done:', ctx.execution?.result));
task.on('execution:failed', (ctx) => console.error('failed:', ctx.execution?.error));
task.on('execution:overlap', () => console.warn('skipped: still running'));
```

## When overlap prevention is not enough

`noOverlap` prevents concurrent executions of the same task within a single process (or a single instance when combined with `distributed`). For scenarios that need more:

- **Cross-process locking without node-cron's distributed mode**: use a Redis lock or database advisory lock directly.
- **Durable job queues with retries**: use [BullMQ](https://bullmq.io) or [Sidequest](https://sidequestjs.com), which persist jobs to a backend and handle retries, priorities, and deduplication.
- **Exactly-once execution guarantees**: use a transactional queue or workflow engine.

## Next steps

- [Scheduling Options](/scheduling-options): all options including `noOverlap`, `maxExecutions`, and `maxRandomDelay`.
- [Events & Observability](/event-listening): the full list of lifecycle events.
- [How to run cron jobs across multiple servers](/run-cron-jobs-across-multiple-servers): coordinate tasks across a fleet.
