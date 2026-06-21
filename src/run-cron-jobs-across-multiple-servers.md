---
outline: deep
title: How to Run Cron Jobs Across Multiple Servers in Node.js
description: Prevent duplicate cron executions across replicas, pods, or instances. node-cron's distributed mode ensures one execution per scheduled fire across your fleet.
---

# How to Run Cron Jobs Across Multiple Servers

You deploy three replicas of your Node.js app behind a load balancer. All three have the same code, the same schedule, and the same cron job. At 3 a.m., the nightly backup runs three times instead of once.

This happens in every multi-instance setup: PM2 cluster mode, Kubernetes Deployments, blue/green rollouts, auto-scaling groups. The scheduler doesn't know about other copies of itself.

## The problem

```
instance A: 0 3 * * * → runs backup
instance B: 0 3 * * * → runs backup (duplicate)
instance C: 0 3 * * * → runs backup (duplicate)
```

## The solution: `distributed: true`

node-cron has built-in distributed coordination. Set `distributed: true` and only one instance executes each scheduled fire:

```js
import cron from 'node-cron';

cron.schedule('0 3 * * *', runNightlyBackup, {
  name: 'nightly-backup',
  distributed: true,
});
```

```
instance A: 0 3 * * * → runs backup ✓
instance B: 0 3 * * * → skipped (not elected)
instance C: 0 3 * * * → skipped (not elected)
```

Two things are required:
- A **`name`** for the task (it forms the coordination key shared across instances)
- A way to decide which instance runs: the default uses an **env-var flag**, or you can plug in a **Redis coordinator** for high availability

## Option 1: Designated runner (env-var)

The simplest setup. Designate one instance as the runner:

```bash
# instance A (the runner)
NODE_CRON_RUN=true node app.js

# instances B, C, D
NODE_CRON_RUN=false node app.js
```

This works well when your orchestrator already decides which pod is special: a StatefulSet, a single-replica Deployment, a dedicated worker dyno.

If `NODE_CRON_RUN` is unset, node-cron throws at schedule time (on startup, not silently at 3 a.m.), so a misconfigured deploy fails loudly.

::: warning Trade-off
The env-var default is a single designated runner. If instance A is down at 3 a.m., the backup doesn't run. For high availability, use a coordinator.
:::

## Option 2: Redis coordinator (high availability)

With a Redis coordinator, every replica races for each fire, exactly one wins, and if the winner is down another takes over:

```bash
npm install @node-cron/redis-coordinator
```

```js
import { createClient } from 'redis';
import cron, { setRunCoordinator } from 'node-cron';
import { RedisLockCoordinator } from '@node-cron/redis-coordinator';

const redis = createClient();
await redis.connect();

setRunCoordinator(new RedisLockCoordinator(redis));

cron.schedule('0 3 * * *', runNightlyBackup, {
  name: 'nightly-backup',
  distributed: true,
  distributedLease: 5 * 60_000,
});
```

No special instance needed. Works with both [ioredis](https://github.com/redis/ioredis) and [node-redis](https://github.com/redis/node-redis) v4.

## Knowing when an instance skips

When an instance is not elected to run, it emits `execution:skipped`:

```js
task.on('execution:skipped', (ctx) => {
  if (ctx.reason === 'coordinator-error') {
    alert('coordination backend is down', ctx);
  }
});
```

| Reason | Meaning |
| --- | --- |
| `not-elected` | Healthy. Another instance ran this fire. |
| `coordinator-error` | The coordinator failed (e.g. Redis down). The fire may not have run anywhere. Alert on this. |

## Custom coordinators

The Redis coordinator is one implementation of the `RunCoordinator` interface. You can back coordination with anything your fleet shares:

```ts
interface RunCoordinator {
  shouldRun(key: string, ttlMs: number): boolean | Promise<boolean>;
  onComplete?(key: string): void | Promise<void>;
}
```

Postgres, etcd, DynamoDB, or any distributed lock mechanism works.

## Combining with other features

### With overlap prevention

```js
cron.schedule('0 * * * *', syncInventory, {
  name: 'sync-inventory',
  distributed: true,
  noOverlap: true,
});
```

One instance runs each fire, and within that instance, overlapping runs are prevented.

### With background tasks

```js
setRunCoordinator(new RedisLockCoordinator(redis));

cron.schedule('0 3 * * *', './tasks/backup.js', {
  name: 'nightly-backup',
  distributed: true,
});
```

The forked daemon asks the parent over IPC, and the parent runs the coordinator. No extra configuration.

## When distributed coordination is not enough

node-cron's distributed mode guarantees no concurrent execution across instances when clocks are in sync. It is not a hard exactly-once: under a crash-and-retry or large clock skew, a fire could run more than once. Treat distributed tasks as idempotent.

For stronger guarantees:
- **Durable job queues**: [BullMQ](https://bullmq.io), [Sidequest](https://sidequestjs.com)
- **Workflow orchestration**: [Temporal](https://temporal.io), [Inngest](https://inngest.com)

## Next steps

- [Distributed Coordination](/distributed-coordination): the full reference, including lease tuning and clock skew.
- [How to prevent overlapping cron jobs](/prevent-overlapping-cron-jobs): overlap prevention within a single instance.
- [How to run background jobs in Node.js](/run-background-jobs-in-nodejs): isolate heavy work in forked processes.
