---
title: "node-cron at scale: one fire, one instance, no queue"
date: 2026-06-18
author: Lucas Merencia
description: "The myth that node-cron is not for production fleets is outdated. With distributed: true and a run coordinator, a scheduled job fires once across N instances, no queue required. Here is how it works."
sidebar: false
---

# node-cron at scale: one fire, one instance, no queue

There is a recurring belief that node-cron is a single-box toy: fine for one process, but the moment you run more than one instance it falls apart. The reasoning goes: three replicas behind a load balancer all run the same `cron.schedule(...)`, so the nightly backup runs three times, therefore "node-cron does not scale," therefore reach for a queue or a different tool.

That belief is out of date. As of **4.4.x**, node-cron coordinates a job to fire on exactly **one instance per scheduled time** across a whole fleet.

## The problem was never node-cron

The duplicate run is not a node-cron bug. It is what happens when you run the **same schedule in N processes**: every in-process scheduler does it. The question was never "is the scheduler good," it was "who decides which instance runs this fire?" node-cron now answers that, with a small, explicit primitive.

You opt in per task:

```js
cron.schedule('0 3 * * *', runNightlyBackup, {
  name: 'nightly-backup',
  distributed: true,
});
```

Two things happen. The task asks a **run coordinator** one question on each fire, "should this instance run this one?", and only the instance that gets `true` runs it. The rest emit `execution:skipped` and move on.

## Zero dependencies out of the box

You do not need Redis to stop double-firing. The built-in default coordinates through an environment variable: set `NODE_CRON_RUN=true` on one instance and `false` on the others, and the job runs only on the designated one.

```bash
NODE_CRON_RUN=true   node app.js   # the runner
NODE_CRON_RUN=false  node app.js   # everyone else
```

No new dependency, no infrastructure. If your orchestrator already has a notion of a "primary" instance (a single-replica Deployment, a dedicated worker), this is all you need. And it fails loud: if a `distributed` task is scheduled without the variable set, node-cron throws at startup rather than silently running everywhere or nowhere.

## Redis for true high availability

The env-var default has one weakness: if the designated instance is down at 3 a.m., nothing runs. For real HA, install [`@node-cron/redis-coordinator`](/distributed-coordination#the-redis-coordinator) and any instance can win each fire, with no single point of failure:

```js
import { RedisLockCoordinator } from '@node-cron/redis-coordinator';

cron.setRunCoordinator(new RedisLockCoordinator(redis)); // your existing client
```

Now every replica races for each fire, exactly one wins (an atomic Redis lock keyed by `name:fireTime`), and if the winner crashes, the next fire is wide open for another node. You reuse the Redis you almost certainly already run; the coordinator brings no client of its own.

## "But don't I need a queue for this?"

Usually, no, and this is the crux. A queue like BullMQ solves **durable work distribution**: jobs that must survive restarts, retry with backoff, fan out to workers, apply backpressure. That is a real and different need.

"Run this scheduled job once across my fleet" is not that. It is a **coordination** problem, and coordinating a boolean ("did I win this fire?") is far lighter than standing up a queue, a worker topology, and the operational weight that comes with it. If a queue is solving only your double-fire problem, it is the wrong size of tool. node-cron plus a lock is the right one.

What you do **not** get is hard exactly-once. The guarantee is **no concurrent execution across instances**, effectively once when clocks are in sync, but a crash-and-retry or large clock skew can still run a fire twice. So make distributed jobs **idempotent** and you are covered. (If you genuinely need transactional exactly-once, that is the queue's job, not a scheduler's.)

## Heavy jobs, too

The same `distributed: true` works on [background tasks](/background-tasks), jobs that run in a forked child process so heavy work never blocks your event loop. The coordinator lives in the parent and the child coordinates through it, so a CPU-bound report can run in isolation **and** only on one instance of the fleet.

## The takeaway

node-cron is a scheduler, not a queue, and that is the point. For the common case, "run my scheduled jobs reliably, including across a fleet," it now has a first-class, honest answer that scales from one box (an env var) to an HA cluster (a Redis lock) without dragging in a queue you did not need.

- Full guide: [Distributed Coordination](/distributed-coordination)
- The Redis coordinator: [`@node-cron/redis-coordinator`](https://www.npmjs.com/package/@node-cron/redis-coordinator)
- Running NestJS? The same coordination is one option away in [`@node-cron/nestjs`](/nestjs).
