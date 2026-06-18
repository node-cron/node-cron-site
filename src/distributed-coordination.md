---
outline: deep
title: Distributed Coordination
description: Run a node-cron task on a single instance per fire across a fleet of replicas. Covers the distributed option, the NODE_CRON_RUN env-var default, custom RunCoordinators (e.g. Redis) for HA, and the execution:skipped event.
---

# Distributed Coordination

The moment you run more than one copy of your app, cron gets awkward. Three replicas behind a load balancer, a PM2 cluster, a Kubernetes Deployment scaled to 4 pods, a blue/green rollout with both colors live for a minute, all of them have the same code, so all of them schedule the same job, and the nightly backup runs **four times** instead of once.

`distributed: true` solves that: the task fires on exactly **one instance per scheduled time**, across the whole fleet.

```js
import cron from 'node-cron';

cron.schedule('0 3 * * *', runNightlyBackup, {
  name: 'nightly-backup',
  distributed: true,
});
```

Two things are required and one is the question that drives everything else:

- It is **opt-in per task** (`distributed: true`); other tasks keep running everywhere.
- It needs a **`name`** (it forms the coordination key shared across instances; the auto-generated id is per-process and can't coordinate).
- And it asks one question on every fire: **"should *this* instance run *this* time?"** The thing that answers is the **run coordinator**.

## The default: one designated runner

Out of the box, node-cron answers that question with an environment variable, `NODE_CRON_RUN`, no extra dependencies, no Redis. You designate **one** instance as the runner:

```bash
# instance A
NODE_CRON_RUN=true   node app.js

# instances B, C, D
NODE_CRON_RUN=false  node app.js
```

Now the backup runs only on instance A; B, C, and D skip it. This is the simplest correct answer to "stop running my cron N times," and for many fleets it's all you need: your orchestrator already decides which pod is special (a `StatefulSet`, a single-replica `Deployment`, a dedicated worker dyno), so let it set the flag.

There is **no default value**. If a `distributed` task is scheduled and `NODE_CRON_RUN` is unset (or isn't exactly `'true'`/`'false'`), node-cron **throws at schedule time**, on startup, not silently at 3 a.m.:

```
node-cron: a `distributed` task needs NODE_CRON_RUN set to 'true' or 'false'.
Set it to 'true' on exactly one instance and 'false' on the others, or provide
a coordinator via cron.setRunCoordinator(...).
```

This is deliberate. A silent default could only do one of two wrong things, run everywhere (the duplicates you came here to fix) or run nowhere (a backup that quietly never happens). Failing loudly on deploy is the safe choice.

::: tip This is not high availability
The env-var default is a *single designated runner*. If instance A is down at 3 a.m., the backup doesn't run, B, C, and D were told `false`. For a fleet where **any** instance can take over, read on.
:::

## The guarantee

With coordination in place, node-cron guarantees **no concurrent execution across instances**, effectively *once per fire* when the instances' clocks are in sync.

It is **not** a hard exactly-once: under a crash-and-retry, or large clock skew between instances, a fire could still run more than once. Treat distributed tasks as **idempotent** (safe to run twice) and you're covered for the rare edge. This is a coordination primitive, not a transactional queue, if you need durable, exactly-once job semantics, reach for a queue like BullMQ.

## High availability: a custom run coordinator

The env-var default trades availability for simplicity. To let **any** instance run a fire, only never two at once, you provide a **run coordinator** backed by something the whole fleet shares (typically Redis). Now there's no special instance: every replica races for each fire, exactly one wins, and if the winner is down another takes over.

A coordinator is just an object that answers the question:

```ts
interface RunCoordinator {
  // true  -> this instance runs the fire identified by `key`
  // false -> skip it (another instance handles it)
  // throw -> fail closed (skip), e.g. the backend is unreachable
  shouldRun(key: string, ttlMs: number): boolean | Promise<boolean>;

  // called after the run completes (success or failure); e.g. release a lock
  onComplete?(key: string): void | Promise<void>;
}
```

Register one globally with `setRunCoordinator`, and it's used for every `distributed` task instead of the env-var default:

```js
import cron, { setRunCoordinator } from 'node-cron';
import { RedisLockCoordinator } from '@node-cron/redis-coordinator';

setRunCoordinator(new RedisLockCoordinator(redis));

cron.schedule('0 3 * * *', runNightlyBackup, {
  name: 'nightly-backup',
  distributed: true, // now HA: any instance can run it, only one wins
});
```

Under the hood a Redis coordinator turns `shouldRun` into an atomic "claim this key" (`SET key NX PX ttl`) and `onComplete` into a safe release, so for the fire keyed `nightly-backup:2026-06-17T03:00:00.000Z`, the first instance to claim it wins and the rest get `false`.

::: info `@node-cron/redis-coordinator`
The Redis-backed coordinator ships as a separate package so the core stays dependency-free. Until then, any object implementing the `RunCoordinator` interface works, the contract above is the whole API.
:::

### Per-task coordinator

A coordinator can also be set on a single task, overriding the global one:

```js
cron.schedule('*/5 * * * *', syncInventory, {
  name: 'sync-inventory',
  distributed: true,
  runCoordinator: myCoordinator, // wins over setRunCoordinator() and the env default
});
```

Resolution order: per-task `runCoordinator` → global `setRunCoordinator` → the env-var default.

## Knowing when an instance skips

When an instance is **not** the one chosen to run a fire, it emits [`execution:skipped`](/event-listening) instead of running. The context carries a `reason`:

```js
task.on('execution:skipped', (ctx) => {
  if (ctx.reason === 'coordinator-error') {
    // the coordinator failed (e.g. Redis down) and we failed closed.
    // this is the one to alert on: the fire may not have run anywhere.
    alert('cron coordination is failing', ctx);
  }
  // ctx.reason === 'not-elected' is the healthy case: another instance ran it.
});
```

| `reason`             | Meaning                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `'not-elected'`      | Healthy. Another instance was chosen for this fire.                                      |
| `'coordinator-error'`| The coordinator threw (e.g. the backend was unreachable). node-cron **failed closed** and skipped, so the fire may not have run on any instance. Alert on this. |

The instance that *does* run emits the normal [`execution:started` → `execution:finished`](/event-listening) sequence, so "did this instance run it?" is just "did I get `execution:started`?", no extra event needed.

## `distributedLease`

Lease-based coordinators (like a Redis lock) hold the claim for a safety window in case the winner crashes mid-run without releasing it. `distributedLease` (ms, default `30000`) sets that lease, and it **must exceed the task's run time**, or the lease can expire mid-run and another instance could start a second copy. The env-var default ignores it.

```js
cron.schedule('0 3 * * *', runNightlyBackup, {
  name: 'nightly-backup',
  distributed: true,
  distributedLease: 5 * 60_000, // the backup can take up to ~5 minutes
});
```

## Background tasks work too

`distributed` works for [background tasks](/background-tasks) exactly as for inline ones, you set the coordinator in your main process and it applies transparently. Internally the forked daemon can't hold the coordinator (it lives across a process boundary), so it asks the parent over IPC, and the parent runs the real coordinator. The shared backend still arbitrates across the fleet; you don't configure anything extra.

```js
// in your main process
setRunCoordinator(new RedisLockCoordinator(redis));

cron.schedule('0 3 * * *', './tasks/backup.js', {
  name: 'nightly-backup',
  distributed: true,
});
```

## A note on `maxExecutions`

[`maxExecutions`](/scheduling-options) is counted **per instance**. With a per-fire coordinator (the HA case), each instance only counts the fires it won, so the fleet total can exceed your limit. With the single-runner env-var default it behaves as expected, only the designated instance runs and counts.

## How it works internally

On each fire of a `distributed` task, node-cron builds a key from the task's `name` and the exact scheduled time (`name:fireTimeISO`), so every instance computes the **same** key for the **same** fire. It calls `shouldRun(key, ttl)`; on `true` it runs the task and then calls `onComplete(key)`; on `false` (or a thrown error) it emits `execution:skipped` and moves on. The coordinator is where cross-instance agreement happens, node-cron itself stays a scheduler.

## Next steps

- **[Events & Observability](/event-listening)**: handle `execution:skipped` and the rest of the lifecycle.
- [Background Tasks](/background-tasks): run the work in an isolated process; coordination still applies.
- [Scheduling Options](/scheduling-options): the full list of options, including `distributed`, `runCoordinator`, and `distributedLease`.
