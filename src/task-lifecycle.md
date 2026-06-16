---
outline: deep
title: Task Lifecycle & Status
description: How a node-cron task moves through stopped, idle, running, and destroyed, and how to control it with start, stop, destroy, execute, getStatus, and getNextRun.
---

# Task Lifecycle & Status

Both `cron.schedule` and `cron.createTask` return a `ScheduledTask`: a single, consistent interface for controlling and inspecting a task, whether it runs inline (in your process) or as a [background task](/background-tasks) (in a forked process).

This page explains the states a task moves through and the methods you use to drive it.

## The lifecycle states

Every task is always in exactly one of four states:

| Status        | Meaning                                                        |
| ------------- | -------------------------------------------------------------- |
| `stopped`     | Scheduler is not running. The task will not fire.              |
| `idle`        | Scheduler is running and waiting for the next match.           |
| `running`     | The task function is currently executing.                      |
| `destroyed`   | The task is permanently removed and cannot be restarted.       |

They transition like this:

```
          start()              (match fires)
stopped ──────────▶ idle ──────────────────▶ running
   ▲                 │  ◀──────────────────────┘
   │                 │      (execution ends)
   └─────────────────┘
        stop()

   any state ──── destroy() ────▶ destroyed   (terminal)
```

- `cron.schedule(...)` returns a task already in **`idle`** (it auto-starts).
- `cron.createTask(...)` returns a task in **`stopped`** until you call `.start()`.
- Once **`destroyed`**, a task is gone; only `getStatus()` remains meaningful.

Read the current state at any time with [`getStatus()`](#getstatus).

## Inline vs. background: sync vs. async

The control methods share one interface but differ in return type:

- **Inline tasks** (a function) act **synchronously**: `start()`, `stop()`, and `destroy()` return `void`.
- **Background tasks** (a file path) cross a process boundary, so the same methods return a **`Promise`** you should `await`.

The interface reflects this with `void | Promise<void>`, so writing `await task.stop()` is safe for both; it just resolves immediately for inline tasks.

```js
import cron from 'node-cron';

// Inline: synchronous
const task = cron.schedule('* * * * *', () => {});
task.getStatus(); // 'idle'
task.stop();
task.getStatus(); // 'stopped'

// Background: asynchronous
const bg = cron.schedule('* * * * *', './tasks/job.js');
await bg.stop();          // wait for the forked process to terminate
bg.getStatus();           // 'stopped'
```

## The ScheduledTask interface

```ts
export interface ScheduledTask {
  id: string;
  name?: string;

  start(): void | Promise<void>;
  stop(): void | Promise<void>;
  destroy(): void | Promise<void>;
  execute(): Promise<any>;
  getStatus(): string;
  getNextRun(): Date | null;

  on(event: TaskEvent, fn: (context: TaskContext) => void | Promise<void>): void;
  off(event: TaskEvent, fn: (context: TaskContext) => void | Promise<void>): void;
  once(event: TaskEvent, fn: (context: TaskContext) => void | Promise<void>): void;
}
```

The `on`, `off`, and `once` methods are covered in [Events & Observability](/event-listening).

## Methods

### `start()`

Starts the scheduler, moving the task from `stopped` to `idle`.

- **Inline tasks:** begins evaluating the cron expression and runs the function at matched times.
- **Background tasks:** forks a dedicated process and starts a daemon that handles scheduling.
- Has no effect if the task is already running.

### `stop()`

Stops the scheduler and prevents future runs, moving the task to `stopped`.

- **Inline tasks:** halts scheduling, but a run already in progress is allowed to finish.
- **Background tasks:** terminates the child process.
- This does **not** remove the task; use [`destroy()`](#destroy) for that. A stopped task can be started again.

### `destroy()`

Permanently deactivates the task and releases its resources, moving it to `destroyed`.

- **Background tasks:** kills the associated process and detaches listeners.
- After destruction, don't call any method other than `getStatus()`.
- The task is also removed from the module registry (so it no longer appears in [`getTasks()`](/api-reference#gettasks)).

### `execute()`

Runs the task function **immediately**, outside its schedule. Always returns a `Promise`.

```js
import cron from 'node-cron';

const task = cron.schedule('0 3 * * *', async () => {
  return doBackup();
});

// Trigger a run right now without waiting for 03:00
const result = await task.execute();
```

- Useful for testing, debugging, or ad-hoc runs.
- Resolves with the task's return value, or rejects if it throws.
- Emits the same lifecycle events as a scheduled run, with `execution.reason === 'invoked'`.

### `getStatus()`

Returns the current state as a string: `'stopped'`, `'idle'`, `'running'`, or `'destroyed'`. Synchronous for both task types.

```js
import cron from 'node-cron';

const task = cron.schedule('* * * * *', () => {});
console.log(task.getStatus()); // 'idle'
```

### `getNextRun()`

Returns the next scheduled run time as a `Date`, or `null` if the task is stopped, destroyed, or its expression yields no future match.

```js
import cron from 'node-cron';

const task = cron.schedule('0 * * * *', () => {});
console.log(task.getNextRun()); // e.g. 2026-06-16T15:00:00.000Z
```

## Creating a stopped task

When you need a task that doesn't start immediately (to attach listeners first, start it conditionally, or control timing in tests), use `cron.createTask` and start it yourself:

```js
import cron from 'node-cron';

const task = cron.createTask('* * * * *', () => {
  console.log('manually started');
});

task.getStatus(); // 'stopped'
task.start();
task.getStatus(); // 'idle'
```

## Next steps

- **[Scheduling Options](/scheduling-options)**: fine-tune behavior with timezones, overlap prevention, and limits.
- [Events & Observability](/event-listening): react to the lifecycle transitions described here.
