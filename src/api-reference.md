---
outline: deep
title: API Reference
description: Complete reference for the node-cron module (schedule, createTask, validate, getTasks, getTask, and setLogger), with parameters, return types, and examples.
---

# API Reference

This page documents every public function exported by the `node-cron` module. For conceptual guides, follow the links into [Task Lifecycle](/task-lifecycle), [Scheduling Options](/scheduling-options), and [Events](/event-listening).

```js
import cron, {
  schedule,
  createTask,
  validate,
  getTasks,
  getTask,
  setLogger,
} from 'node-cron';
```

Both the default export (`cron.schedule(...)`) and named exports (`schedule(...)`) are available.

## `schedule(expression, func, options?)`

Creates a task and **starts it immediately**. Returns a [`ScheduledTask`](/task-lifecycle#the-scheduledtask-interface).

### Parameters

| Name         | Type                   | Description                                                                                                   |
| ------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| `expression` | `string`               | A valid [cron expression](/cron-syntax) (e.g. `"0 0 * * *"` for daily at midnight).                          |
| `func`       | `Function \| string`   | A function to run, **or** a path to a module exporting a `task` function. A path creates a [Background Task](/background-tasks). |
| `options`    | `Options` *(optional)* | Execution options. See [Scheduling Options](/scheduling-options).                                            |

### Options

```ts
type Options = {
  name?: string;                  // human-readable identifier
  timezone?: string;              // e.g. "America/New_York"
  noOverlap?: boolean;            // skip a run if the previous one is still going
  maxExecutions?: number;         // destroy the task after N runs
  maxRandomDelay?: number;        // jitter, in ms, added before each run
  logger?: Logger;                // per-task logger (not for background tasks)
  suppressMissedWarning?: boolean // silence the "missed execution" warning
  missedExecutionTolerance?: number // ms a late run may still execute (default 1000)
};
```

Background tasks accept two extra options, `executeTimeout` and `startTimeout`, documented in [Background Tasks](/background-tasks#manual-execution-and-executetimeout).

See [Scheduling Options](/scheduling-options) for details and examples.

### Returns

A [`ScheduledTask`](/task-lifecycle) with control methods:

```js
import cron from 'node-cron';

const task = cron.schedule('* * * * *', () => {
  console.log('Running every minute');
});

task.stop();    // pause the task
task.start();   // start or resume it
task.destroy(); // remove it permanently
```

> 🛈 For **inline** tasks these methods are synchronous (`void`); for **background** tasks they return a `Promise`. See [Task Lifecycle](/task-lifecycle#inline-vs-background-sync-vs-async).

## `createTask(expression, func, options?)`

Same as `schedule`, but **does not start** the task; it's returned in the `stopped` state. Useful when you need to attach [event listeners](/event-listening) first, start conditionally, or control timing in tests.

```js
import cron from 'node-cron';

const task = cron.createTask('0 * * * *', () => {
  console.log('Running every hour');
});

task.start();
```

## `validate(expression)`

Returns `true` if the cron expression is syntactically valid, `false` otherwise.

```js
import cron from 'node-cron';

cron.validate('0 12 * * *'); // true
cron.validate('invalid');    // false
```

## `getTasks()`

Returns a `Map<string, ScheduledTask>` of every task currently registered by node-cron, keyed by task id. Tasks created with `schedule` or `createTask` are registered automatically, and a destroyed task removes itself from the registry. Useful for inspection, dashboards, or shutting everything down.

```js
import cron from 'node-cron';

const task = cron.schedule('* * * * *', () => {
  console.log('Running every minute');
});

const tasks = cron.getTasks();

console.log(tasks.has(task.id));          // true
console.log(tasks.get(task.id) === task); // true
```

You can also iterate the map directly:

```js
import cron from 'node-cron';

for (const [id, task] of cron.getTasks()) {
  console.log(id, task.name, task.getStatus());
}
```

## `getTask(id)`

Returns the registered [`ScheduledTask`](/task-lifecycle) with the given id, or `undefined` when no task exists for that id.

```js
import cron from 'node-cron';

const task = cron.schedule('* * * * *', () => {});

const sameTask = cron.getTask(task.id); // === task
sameTask?.stop();
```

## `setLogger(logger)`

Replaces the global logger node-cron uses for its internal messages (such as the missed-execution warning), routing them through your own logger.

```js
import { setLogger } from 'node-cron';

setLogger({
  info:  (msg) => myLogger.info(msg),
  warn:  (msg) => myLogger.warn(msg),
  error: (msg, err) => myLogger.error(err ?? msg),
  debug: (msg) => myLogger.debug(msg),
});
```

The argument is any object implementing the `Logger` interface (`info`, `warn`, `error`, `debug`). See the [Logging guide](/logging) for the full interface, per-task loggers, winston/pino adapters, and the missed-execution warning.

## Next steps

- [Task Lifecycle & Status](/task-lifecycle): what the returned task can do.
- [Migrating from v3](/migrating-from-v3): if you're upgrading an existing project.
