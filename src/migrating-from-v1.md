---
outline: deep
title: Migrating from v1
description: What changed between node-cron v1 and v2, covering the move from the boolean immediateStart argument to an options object, the new timezone support, and the new task.getStatus() method.
---

# Migration Guide: node-cron v1 to v2

`node-cron` v2 is a small, mostly additive step up from v1. The headline change is **timezone support**, and the third argument to `schedule` moved from a boolean to an options object.

This guide compares the last v1 release (**v1.2.1**) with v2 (**v2.0.x**). If you are already on v2 and heading further, see [Migrating from v2](/migrating-from-v2) and then [Migrating from v3](/migrating-from-v3).

Both versions are CommonJS, so the import is unchanged (v2 adds an explicit Node.js >= 6 requirement):

```js
const cron = require('node-cron');
```

## What to change

### The third argument is now an options object

In v1, the third argument to `schedule` was a boolean, `immediateStart`. In v2 it is an options object. The boolean form still works in v2 but logs a deprecation warning, so update it:

```js
// v1
cron.schedule('* * * * *', () => {}, false);

// v2
cron.schedule('* * * * *', () => {}, { scheduled: false });
```

`scheduled: false` creates the task without starting it, the same as passing `false` in v1. Call `task.start()` when you are ready. If you never passed the third argument, no change is needed: tasks still start immediately by default.

## New in v2

These are additive, so they do not break v1 code, but they are the reason to upgrade.

### Timezone support

v1 had no timezone handling: tasks always ran in the server's local time. v2 adds a `timezone` option so the cron expression is interpreted in the zone you choose:

```js
cron.schedule('0 1 * * *', () => {
  console.log('Runs at 01:00 in America/Sao_Paulo');
}, {
  timezone: 'America/Sao_Paulo'
});
```

### `task.getStatus()`

v2 adds a `getStatus()` method to the scheduled task, alongside the existing `start()`, `stop()`, and `destroy()`:

```js
const task = cron.schedule('* * * * *', () => {});
task.getStatus(); // 'scheduled' | 'running' | 'stoped' | 'destroyed' | 'failed'
```

::: tip Heading to v3 next?
`getStatus()` and `destroy()` are later removed in v3 and then reintroduced with a richer model in v4. See [Migrating from v2](/migrating-from-v2) for that hop.
:::

## Quick checklist

- [ ] Change any boolean third argument, `schedule(expr, fn, false)`, to `schedule(expr, fn, { scheduled: false })`.
- [ ] Optionally adopt the `timezone` option and `task.getStatus()`.

Once on v2, see [Migrating from v2](/migrating-from-v2) to continue toward v3 and v4.
