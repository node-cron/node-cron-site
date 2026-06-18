---
outline: deep
title: Background Tasks
description: Run node-cron jobs in isolated forked processes so heavy work never blocks your main event loop. Covers task files, scheduling, events, and executeTimeout.
---

# Background Tasks

When a job is CPU-heavy or long-running, executing it inline can block your main event loop, and node-cron will warn you about [missed executions](/logging#suppressing-the-missed-execution-warning). **Background tasks** solve this by running the job in a separate forked process (via Node's `child_process`), isolated from your application.

You opt into a background task simply by passing a **file path** instead of a function to `cron.schedule`. Everything else (the lifecycle, events, and most options) works exactly the same.

## 1. Create a task file

Write a module that exports a `task` function. This holds the logic to run on schedule.

::: code-group

```js [ESM]
// ./tasks/my-task.js
export function task() {
  return 'Hello from a background task!';
}
```

```js [CommonJS]
// ./tasks/my-task.js
exports.task = () => {
  return 'Hello from a background task!';
};
```

:::

The task function receives the same [`TaskContext`](/event-listening#taskcontext) as an inline task:

```js
// ./tasks/my-task.js
export function task(ctx) {
  console.log('scheduled for:', ctx.dateLocalIso);
}
```

## 2. Schedule it by path

Pass the path where you'd pass a function. Relative paths are resolved from the file that calls `schedule`.

```js
import cron from 'node-cron';

const task = cron.schedule('*/5 * * * * *', './tasks/my-task.js');
```

node-cron forks a process, loads your task file, and schedules it there.

## Control and events

A background task implements the same [`ScheduledTask`](/task-lifecycle) interface as an inline task, with one difference: because it crosses a process boundary, its control methods are **asynchronous** and return Promises.

```js
import cron from 'node-cron';

const task = cron.schedule('*/5 * * * * *', './tasks/my-task.js');

await task.stop();    // terminates the child process
await task.start();   // re-forks and resumes
await task.destroy(); // kills the process and removes the task

task.getStatus();     // synchronous: 'idle', 'running', etc.
```

It emits the [same lifecycle events](/event-listening), relayed from the worker to the parent process:

```js
task.on('execution:failed', (ctx) => {
  console.error('background job failed:', ctx.execution?.error?.message);
});
```

## Manual execution and `executeTimeout`

Call `execute()` to run the task immediately. The task **must be started first** (the process needs to exist):

```js
import cron from 'node-cron';

const task = cron.schedule('0 3 * * *', './tasks/backup.js');
const result = await task.execute();
```

By default `execute()` waits as long as the task needs. To guard against a worker that never reports back, set `executeTimeout` (milliseconds), and `execute()` then rejects if the run doesn't finish in time:

```js
import cron from 'node-cron';

const task = cron.schedule('0 3 * * *', './tasks/backup.js', {
  executeTimeout: 60_000, // reject if a manual execute() exceeds 60s
});
```

## Start handshake and `startTimeout`

Starting a background task forks the daemon and imports your task file. If the file doesn't load and start within `startTimeout` (default `5000` ms), `start()` rejects with a timeout error. A task file with a large dependency graph, or one that is transpiled on load, can legitimately need longer:

```js
import cron from 'node-cron';

const task = cron.schedule('0 3 * * *', './tasks/backup.js', {
  startTimeout: 20_000, // allow a slow-loading task file more time to boot
});
```

If the file fails to load (missing file, or a runtime that can't run it, e.g. an `enum` in a `.ts` file under Node's strip-only TypeScript support), `start()` rejects with the **real** error so you can see what went wrong, rather than a generic timeout. Make sure the task file runs on its own first (e.g. `node ./tasks/backup.js`); if it needs a loader such as `tsx` or `ts-node`, the forked process needs it too, or use a compiled `.js` file.

## Limitations

- **Per-task `logger` is not supported.** A logger is a function-bearing object and can't cross the process boundary. The worker forwards its events to the parent, which does the logging using the **global** logger. Use [`setLogger`](/logging#setting-a-global-logger), or call `setLogger` inside the task file itself. See [Logging](/logging#per-task-logger).
- The task function lives in its **own file**; you can't pass an inline closure.
- Data passed across the boundary is serialized, so event payloads contain plain data (errors are reconstructed on the parent side).

## How it works internally

When a background task starts, node-cron forks a process and launches a small **daemon** that loads your task file and schedules it with the same scheduler used for inline tasks. Parent and child communicate over `child_process` messages (`task:start`, `task:stop`, `task:execute`, and event relays), keeping status and execution in sync across the boundary. Stopping or destroying the task terminates the child process.

## Next steps

- **[Logging](/logging)**: essential for background tasks, since logging happens in the parent.
- [Distributed Coordination](/distributed-coordination): run a background task on one instance per fire across a fleet.
- [Cookbook](/cookbook): practical recipes, including a backup job.
