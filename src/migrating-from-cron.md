---
outline: deep
title: Migrating from cron
description: How to move from the cron package to node-cron. The two similarly named packages compared, plus a complete API mapping for CronJob, timeZone, onComplete, runOnInit, and the task lifecycle methods.
---

# Migrating from the `cron` package

The npm ecosystem has two popular, separately maintained packages with similar names: **`node-cron`** (this project) and **`cron`**. They are not forks or versions of each other, they have different authors and different APIs.

Both are valid choices. If you searched for "node-cron" and landed on the other one, or you are running the `cron` package and want to move to `node-cron`, this page shows how to port your code. Your cron **expressions** carry over unchanged (both support standard syntax with an optional seconds field), only the **API** is different.

## What changes when you move

Moving to `node-cron` changes a few concrete things in how you write the code:

- **No runtime dependencies** — `node-cron` ships zero dependencies.
- **Event-based lifecycle** — `execution:finished`, `execution:failed`, and more, instead of a single `onComplete` callback.
- **Built-in options** for common needs: overlap protection (`noOverlap`), execution caps (`maxExecutions`), and jitter (`maxRandomDelay`).
- **First-class TypeScript types.**

These are differences in shape, not a scorecard. Pick what fits your project.

## Installation

```bash
npm uninstall cron
npm install node-cron
```

## The core difference: constructor vs `schedule`

The `cron` package builds a job with a positional constructor and a boolean to start it. `node-cron` uses a single `schedule` call that starts immediately, plus an options object.

**Before (`cron`):**

```js
const { CronJob } = require('cron');

const job = new CronJob(
  '0 */5 * * * *',           // cronTime
  () => doWork(),            // onTick
  null,                      // onComplete
  true,                      // start
  'America/Sao_Paulo'        // timeZone
);
```

**After (`node-cron`):**

```js
import cron from 'node-cron';

const task = cron.schedule('0 */5 * * * *', () => doWork(), {
  timezone: 'America/Sao_Paulo',
});
```

`cron.schedule(...)` starts the task right away. If you need a task that does **not** start immediately (the `start: false` case), use `createTask` and start it yourself:

```js
const task = cron.createTask('0 */5 * * * *', () => doWork());
// later
task.start();
```

## Option mapping

| `cron` package | `node-cron` | Notes |
| --- | --- | --- |
| `timeZone: 'America/Sao_Paulo'` | `{ timezone: 'America/Sao_Paulo' }` | IANA name, same values. |
| `start` (4th constructor arg) | `cron.schedule` (starts) / `cron.createTask` (manual) | No boolean flag. |
| `onComplete` (3rd arg) | `task.on('execution:finished', ...)` | Event instead of callback. |
| `runOnInit: true` | call the function yourself before scheduling | Removed by design, see below. |
| `utcOffset: -180` | `{ timezone: 'America/Sao_Paulo' }` | Prefer an IANA timezone over a raw offset. |
| `context` (this binding) | use a closure / arrow function | No separate context arg. |
| `unrefTimeout` | not applicable | node-cron manages its own timers. |

## Lifecycle methods

| `cron` package | `node-cron` |
| --- | --- |
| `job.start()` | `task.start()` |
| `job.stop()` | `task.stop()` |
| (no direct equivalent) | `task.destroy()` removes the task permanently |
| `job.running` | `task.getStatus()` → `'stopped' \| 'idle' \| 'running' \| 'destroyed'` |
| `job.nextDate()` | `task.getNextRuns(1)[0]` |
| `job.nextDates(n)` | `task.getNextRuns(n)` |

## Error handling

In the `cron` package an error thrown inside `onTick` surfaces inside the library. In `node-cron`, subscribe to the failure event:

```js
const task = cron.schedule('* * * * *', async () => {
  await mightThrow();
});

task.on('execution:failed', (ctx) => {
  console.error('job failed:', ctx.execution?.error);
});
```

Other lifecycle events you can listen to: `task:started`, `task:stopped`, `task:destroyed`, `execution:started`, `execution:finished`, `execution:missed`, `execution:overlap`, `execution:maxReached`.

## `runOnInit` replacement

The `cron` package can fire once on startup with `runOnInit: true`. `node-cron` does not have this flag, run the work yourself, then schedule it:

```js
async function job() { /* ... */ }

await job();                       // run once on startup
cron.schedule('0 * * * *', job);   // then on schedule
```

## Preventing overlapping runs

If your `onTick` was long-running and you guarded against overlap manually, `node-cron` has it built in:

```js
cron.schedule('* * * * *', longJob, { noOverlap: true });
```

A run is skipped (and an `execution:overlap` event is emitted) if the previous one is still in progress.

## Full before / after example

**Before (`cron`):**

```js
const { CronJob } = require('cron');

const job = new CronJob(
  '0 0 3 * * *',
  async function () {
    try {
      await runBackup();
    } catch (err) {
      console.error(err);
    }
  },
  null,
  true,
  'America/Sao_Paulo'
);
```

**After (`node-cron`):**

```js
import cron from 'node-cron';

const task = cron.schedule('0 0 3 * * *', () => runBackup(), {
  name: 'nightly-backup',
  timezone: 'America/Sao_Paulo',
  noOverlap: true,
});

task.on('execution:failed', (ctx) => console.error(ctx.execution?.error));
```

## Need help?

If something in your `cron` setup does not map cleanly, [open an issue](https://github.com/node-cron/node-cron/issues) and we will help you port it.
