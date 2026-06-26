---
outline: deep
title: Migrating from v2
description: What changed between node-cron v2 and v3, covering the removed task.getStatus() and task.destroy() methods, the dropped boolean immediateStart argument, and the new background tasks, events, and getTasks API.
---

# Migration Guide: node-cron v2 to v3

`node-cron` v3 kept the same `schedule` / `validate` core as v2, but reshaped the task object and added background tasks, a task registry, and an event API.

This guide compares the last v2 release (**v2.0.3**) with v3 (**v3.0.x**). It covers the breaking changes you hit when bumping from v2 to v3. If you are already on v3 and heading to v4, see [Migrating from v3](/migrating-from-v3).

::: tip Already on the latest?
v2 is old. If you are jumping straight from v2 to **v4**, read this page first for the v2 to v3 changes, then [Migrating from v3](/migrating-from-v3) for v3 to v4. Some methods removed here (`getStatus`, `destroy`) come back in v4.
:::

Both v2 and v3 are CommonJS and run on Node.js >= 6, so there are no runtime or import changes. The import stays the same:

```js
const cron = require('node-cron');
```

## Breaking changes

### 1. `task.getStatus()` and `task.destroy()` were removed

In v2 the scheduled task exposed `start()`, `stop()`, `getStatus()`, and `destroy()`. In v3 the task only exposes `start()`, `stop()`, and `now()`. The `getStatus()` and `destroy()` methods are gone.

```js
// v2
const task = cron.schedule('* * * * *', () => {});
task.getStatus(); // 'scheduled' | 'running' | 'stoped' | 'destroyed' | 'failed'
task.destroy();

// v3: these methods no longer exist
const task = cron.schedule('* * * * *', () => {});
task.stop(); // use stop() instead of destroy()
```

If you relied on `getStatus()`, track state yourself from the new [`task-done`](#_4-task-events-new) event, or upgrade to [v4](/migrating-from-v3), where `getStatus()` and `destroy()` return with a richer status model.

### 2. The boolean third argument is gone

v2 accepted a boolean as the third argument to control whether the task started immediately (the old `immediateStart`), and already logged a deprecation warning for it. v3 removes it: the third argument must be an options object.

```js
// v2 (deprecated, warned)
cron.schedule('* * * * *', () => {}, false);

// v3
cron.schedule('* * * * *', () => {}, { scheduled: false });
```

`scheduled: false` creates the task without starting it. Call `task.start()` when you are ready.

## New in v3

These are additive, so they do not break v2 code, but they are the reason to upgrade.

### 3. Background tasks

In v3, passing a **file path string** instead of a function runs the task in a separate forked process. v2 only supported inline functions.

```js
// v3 only: runs ./tasks/job.js in a forked process
cron.schedule('0 0 * * *', './tasks/job.js', {
  timezone: 'America/Sao_Paulo'
});
```

### 4. Task events (new)

In v2 the scheduled task had no public event API. In v3 the task extends Node's `EventEmitter` and emits a `task-done` event after each run, so you can react to completions:

```js
const task = cron.schedule('* * * * *', () => {});

task.on('task-done', (result) => {
  console.log('Run finished:', result);
});
```

::: tip Heading to v4 next?
v4 replaces `task-done` with a richer set of `execution:*` and `task:*` events and removes the `EventEmitter` base class. See [Migrating from v3](/migrating-from-v3).
:::

### 5. `cron.getTasks()`

v3 keeps a registry of every scheduled task and exposes it through `cron.getTasks()`, which returns a `Map` of the live tasks. v2 had no such API.

```js
cron.schedule('* * * * *', () => {});

for (const [name, task] of cron.getTasks()) {
  console.log(name, task);
}
```

### 6. New options

v3 adds three options to `schedule`:

- `name`: a name for the task (also used as the `getTasks()` key; defaults to a generated id).
- `runOnInit`: run the task once immediately when it is scheduled.
- `recoverMissedExecutions`: replay runs that were missed while the event loop was blocked.

```js
cron.schedule('* * * * *', () => {}, {
  name: 'heartbeat',
  runOnInit: true,
  timezone: 'America/Sao_Paulo'
});
```

## Quick checklist

- [ ] Replace `task.getStatus()` and `task.destroy()`: use `task.stop()`, or upgrade to [v4](/migrating-from-v3) for the full status API.
- [ ] Change any `schedule(expr, fn, false)` boolean argument to `schedule(expr, fn, { scheduled: false })`.
- [ ] Optionally adopt background tasks, the `task-done` event, `getTasks()`, and the new options.

Once on v3, see [Migrating from v3](/migrating-from-v3) to continue to v4.
