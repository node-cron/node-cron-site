---
outline: deep
title: Usage Rules & Limits
description: When to use node-cron and when not to. A decision matrix for schedule vs createTask vs background tasks, plus node-cron's limits as an in-process, non-durable, non-distributed scheduler.
---

# Usage Rules & Limits

A quick guide to picking the right tool and the right API. node-cron is an **in-process** scheduler: it runs tasks inside your Node.js process (or a forked child process for background tasks). It is small, dependency-free, and great for recurring work that lives with your app. It is **not** a durable or distributed job queue.

## Decision matrix

| Goal                                              | Use                                                                 |
| ------------------------------------------------- | ------------------------------------------------------------------- |
| Run a function on a schedule, starting now        | [`cron.schedule(expr, fn)`](/api-reference#schedule-expression-func-options) |
| Configure or attach listeners before it starts    | [`cron.createTask(...)`](/api-reference#createtask-expression-func-options) then `.start()` |
| Prevent overlapping runs                           | [`noOverlap: true`](/scheduling-options)                            |
| Run CPU-heavy, blocking, or long work              | [Background task](/background-tasks) (pass a file path)             |
| React to success, failure, or missed runs          | [`task.on('execution:*')`](/event-listening)                        |
| Run on the last day of the month                   | [`L` in the day-of-month field](/cron-syntax#last-day-of-the-month-l) |
| Run a fixed number of times                        | [`maxExecutions`](/scheduling-options)                              |
| Stagger many tasks firing at once                  | [`maxRandomDelay`](/scheduling-options)                             |
| Route internal logs through your logger            | [`setLogger` / `logger`](/logging)                                  |
| Durable, distributed, retried jobs                 | **Not node-cron.** Use [Sidequest](https://sidequestjs.com) or a queue |

## Usage rules

- Use **`cron.schedule`** when you want the task to start immediately.
- Use **`cron.createTask`** when you need to attach [event listeners](/event-listening) or inspect the task before it starts, then call `.start()`.
- Use a **[background task](/background-tasks)** (a file path instead of a function) for CPU-bound, blocking, or long-running work, so it does not block the main event loop.
- Use **`noOverlap: true`** when a run can take longer than its interval and you do not want overlapping executions.
- Attach **`execution:failed`** / **`execution:missed`** listeners to observe problems; listening to `execution:missed` also silences the default missed-execution warning.
- Set a **`timezone`** so schedules are unambiguous across environments.

## Limits: when not to use node-cron

node-cron deliberately stays small. It does **not** provide:

- **Durability.** Schedules live in memory. If the process restarts, pending runs are lost and node-cron does not "catch up" runs it missed while down.
- **Distribution or coordination.** Each process runs its own schedule independently. There is no leader election or locking, so if you run **N replicas**, a task scheduled in each one runs **N times**. Guard cluster jobs yourself (run the scheduler on a single instance, or add your own lock).
- **Persistent retries, uniqueness, priorities, or a dashboard.**

If you need any of the above (durable jobs that survive restarts, retries with backoff, exactly-once across a cluster, a monitoring UI), reach for a durable job runner such as [**Sidequest.js**](https://sidequestjs.com) or a queue backed by a datastore, rather than node-cron alone.

## Next steps

- [Quickstart](/getting-started): install and run your first task.
- [Cookbook](/cookbook): copy-paste recipes for the cases above.
