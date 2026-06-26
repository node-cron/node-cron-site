---
outline: deep
title: Migrating from v3
description: What changed between node-cron v3 and v4, covering the Node.js 20 and ESM requirements, the TypeScript rewrite, smarter scheduling, the streamlined Options type, createTask, the new method names, and the rebuilt event system.
---

# Migration Guide: node-cron v3 to v4

`node-cron` v4 is a significant update, both in internal optimizations and in the move to TypeScript. It improves scheduling performance and provides a more flexible API for handling scheduled tasks.

This guide compares the last v3 release (**v3.0.3**) with the current v4 line (**v4.5.x**), so it covers everything you hit when you bump the major.

## Before you start: new requirements

Two environment-level changes affect every project, regardless of which APIs you use:

- **Node.js >= 20.** v3 supported Node as old as 6. v4 requires Node.js 20 or newer. Upgrade your runtime before bumping the package.
- **ESM-first, with CommonJS still supported.** v4 ships as a dual package (`"type": "module"`) with both ESM and CommonJS builds plus type declarations. Both of these keep working:

```js
// ESM (default export)
import cron from 'node-cron';

// CommonJS
const cron = require('node-cron');
```

v4 also exposes **named exports**, which v3 did not:

```js
import { schedule, createTask, validate, getTasks } from 'node-cron';
```

## Internal changes

- **Smarter scheduling.** v3 checked the cron expression every second. v4 dynamically calculates the delay until the next matching time and sleeps until then, instead of waking up once per second. For a task that runs every 5 minutes, the scheduler no longer does ~300 needless checks between runs. This lowers CPU overhead.
- **TypeScript rewrite.** v4 is written in TypeScript and ships type declarations, so you get type safety and richer editor support out of the box.

## Breaking changes and how to migrate

### 1. Task creation and options

#### v3

In v3 you used the `scheduled` and `runOnInit` options to control startup behavior.

```js
const task = cron.schedule('* * * * *', async () => {
  console.log('Running every minute');
}, {
  scheduled: true,
  runOnInit: true,
  timezone: 'America/Sao_Paulo'
});
```

#### v4

The `scheduled` and `runOnInit` options are removed. By default, a task created with `cron.schedule` is started immediately. To run the function once right after scheduling, call `task.execute()`:

```js
const task = cron.schedule('* * * * *', async () => {
  console.log('Running every minute');
}, {
  timezone: 'America/Sao_Paulo'
});

// Immediately run the task once, in addition to its schedule.
task.execute();
```

If you need a task that does **not** start on creation (the old `scheduled: false`), use `cron.createTask` and start it yourself:

```js
const task = cron.createTask('* * * * *', async () => {
  console.log('This task is manually started');
}, {
  noOverlap: true
});

// The task will not run until start() is called.
task.start();
```

### 2. Task options (`Options` vs `CronScheduleOptions`)

#### v3

```js
/**
 * @typedef {Object} CronScheduleOptions
 * @prop {boolean} [scheduled] whether the task is started when created.
 * @prop {boolean} [runOnInit] run the task once when scheduling.
 * @prop {boolean} [recoverMissedExecutions] replay runs missed while blocked.
 * @prop {string}  [timezone] the timezone to execute the task in.
 * @prop {string}  [name] a name for the task.
 */
```

#### v4

Options are streamlined into a single `Options` type with updated field names. The v3 fields `scheduled`, `runOnInit`, and `recoverMissedExecutions` are all **removed**.

```ts
export type Options = {
  name?: string;
  timezone?: string;
  noOverlap?: boolean;
  maxExecutions?: number;
  maxRandomDelay?: number;
  logger?: Logger;
  suppressMissedWarning?: boolean;
};
```

Field reference:
  - `name`: A human-readable identifier for the task (useful for debugging or logging).
  - `timezone`: The timezone in which the cron expression is interpreted.
  - `noOverlap`: Prevents a run from starting while a previous run is still going.
  - `maxExecutions`: Limits the number of executions before the task is automatically destroyed.
  - `maxRandomDelay`: Adds random jitter (ms) before each run.
  - `logger`: A per-task [logger](/logging) (not supported for background tasks).
  - `suppressMissedWarning`: Silences the missed-execution warning.

See [Scheduling Options](/scheduling-options) for the full reference.

#### What happened to `recoverMissedExecutions`?

v3 could replay runs that were missed while the event loop was blocked. v4 removes that option. Instead, a missed run emits an [`execution:missed`](/event-listening) event, and node-cron logs a one-time warning you can silence with `suppressMissedWarning`. v4 does not replay missed runs automatically; if you need that behavior, handle the `execution:missed` event yourself. See [Logging](/logging#suppressing-the-missed-execution-warning).

### 3. Task methods

The task object returned by `schedule` and `createTask` changed shape.

| v3 | v4 | Notes |
|---|---|---|
| `task.now()` | `task.execute()` | Manually run the task once. Now returns a `Promise`. |
| `task.start()` | `task.start()` | Unchanged. |
| `task.stop()` | `task.stop()` | Unchanged. |
| (none) | `task.destroy()` | Stop permanently and remove from the registry. |
| (none) | `task.getStatus()` | Returns `'stopped'`, `'idle'`, `'running'`, or `'destroyed'`. |
| (none) | `task.getNextRun()` / `task.getNextRuns(n)` | Next fire time(s). |
| (none) | `task.lastRun()` | The last run's date, result, or error. |

The biggest rename to watch for: **`task.now()` is now `task.execute()`**. Search your codebase for `.now(` calls on tasks.

### 4. Task events

This is the largest API change, and the v3-to-v4 mapping is not one-to-one.

#### v3

v3's `ScheduledTask` extended Node's `EventEmitter`. The one public event was **`task-done`**, emitted after each run:

```js
const task = cron.schedule('* * * * *', async () => {
  console.log('Running every minute');
});

task.on('task-done', (result) => {
  console.log('Run finished:', result);
});
```

#### v4

`ScheduledTask` no longer extends `EventEmitter`. It exposes `on`, `once`, and `off` directly, and every listener receives a [`TaskContext`](/event-listening) with runtime metadata instead of a bare value. Event names now use a `namespace:event` convention and are split into two families:

**Lifecycle events** (the task itself):

- `task:started`
- `task:stopped`
- `task:destroyed`

**Execution events** (a single run of the task):

- `execution:started`
- `execution:finished`
- `execution:failed`
- `execution:missed`
- `execution:overlap`
- `execution:maxReached`
- `execution:skipped`

The old `task-done` maps to the execution events: a successful run is now `execution:finished`, and a failure is `execution:failed`.

```js
const task = cron.schedule('* * * * *', async () => {
  console.log('Running every minute');
});

// v3: task.on('task-done', result => ...)
task.on('execution:finished', (context) => {
  console.log('Run finished at', context.date, context.execution?.result);
});

task.on('execution:failed', (context) => {
  console.error('Run failed:', context.execution?.error);
});
```

Each listener receives a `TaskContext`:

```ts
type TaskContext = {
  date: Date;            // the scheduled time this fired for
  dateLocalIso: string;  // that time as a local ISO 8601 string
  triggeredAt: Date;     // when the listener was actually invoked
  task?: ScheduledTask;  // the task that emitted the event
  execution?: Execution; // run details, present for execution:* events
};
```

See the [Events & Observability guide](/event-listening) for the full event and `TaskContext` reference.

### 5. Background tasks (task files)

Passing a file path instead of a function still creates a background task that runs in a forked process:

```js
cron.schedule('0 0 * * *', './tasks/daily-backup.js', {
  timezone: 'America/New_York'
});
```

What changed:

- Background tasks now implement the **same `ScheduledTask` interface** as inline tasks (`start`, `stop`, `destroy`, `execute`, events). The v3-only methods `task.pid()` and `task.isRunning()` are gone; use `task.getStatus()` instead.
- The `logger` option is **not supported** for background tasks, since the task runs in a separate process.

### 6. Registry lookups

`cron.getTasks()` still returns a `Map` of the live tasks, and v4 adds `cron.getTask(id)` to fetch one by id. The map is now keyed by the task `id` rather than the v3 task name, so update any code that looked tasks up by key.

## Quick checklist

- [ ] Upgrade to Node.js 20+.
- [ ] Remove `scheduled`, `runOnInit`, and `recoverMissedExecutions` from your options.
- [ ] Replace `task.now()` with `task.execute()`.
- [ ] For tasks that should start stopped, switch `schedule(..., { scheduled: false })` to `createTask(...)` then `.start()`.
- [ ] Migrate `task.on('task-done', ...)` to `execution:finished` / `execution:failed`, and update listeners to read from `TaskContext`.
- [ ] Replace any `task.pid()` / `task.isRunning()` calls on background tasks with `task.getStatus()`.
- [ ] If you relied on missed-run recovery, handle `execution:missed` yourself.

See the [Events & Observability guide](/event-listening) and [Scheduling Options](/scheduling-options) for more detail.
