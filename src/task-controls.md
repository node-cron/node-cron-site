---
outline: deep
---

# Task Controls
When scheduling a task with `cron.schedule`, you pass a cron expression, a task (function or path to a file), and optional configuration.

This function returns a `ScheduledTask` instance, which provides a consistent interface for managing and introspecting both in-process and background tasks.

```js
const task = cron.schedule('* * * * *', () = > {
  //
}, { nOoverlap: true });
const task = cron.schedule('* * * * *', () => {
  // your task logic here
}, { scheduled: false });

await task.getStatus(); // 'stopped'

await task.start();     // starts the scheduler

await task.getStatus(); // 'idle'

// when task is actively running
await task.getStatus(); // 'running'

await task.stop();      // stops the scheduler

await task.execute();   // manually runs the task immediately

await task.destroy();   // stops and permanently removes the task
```

## ScheduledTask Interface
The `ScheduledTask` interface defines the contract for interacting with any task, whether it's basic or runs in a background process.

```ts
export interface ScheduledTask {
  id: string;
  name?: string;

  start(): void | Promise<void>;
  stop(): void | Promise<void>;
  getStatus(): string | Promise<string>;
  destroy(): void | Promise<void>;
  execute(): Promise<any>;
  getNextRun(): Date | null;

  on(event: TaskEvent, fn: (context: TaskContext) => void | Promise<void>): void;
  off(event: TaskEvent, fn: (context: TaskContext) => void | Promise<void>): void;
  once(event: TaskEvent, fn: (context: TaskContext) => void | Promise<void>): void;
}
```

**Note:** `on`, `off` and `once` functions are addressed at [Event Listening Guide](/event-listening)

## Method Descriptions

## Method Descriptions

---

### `start(): void | Promise<void>`

Starts the task scheduler.

- For **basic (in-process)** tasks: begins evaluating the cron expression and running the task at matched times.
- For **background** tasks: forks a dedicated process and starts a daemon to handle scheduled execution.
- Has no effect if the task is already running.

---

### `stop(): void | Promise<void>`

Stops the scheduler and prevents the task from running in the future.

- For **basic tasks**: halts the scheduler but allows any currently running job to finish.
- For **background tasks**: terminates the child process immediately.

> Note: This does not permanently remove the task — use `destroy()` for that.

---

### `getStatus(): string | Promise<string>`

Returns the current lifecycle state of the task. Typical values include:

- `'stopped'` – Scheduler is not running.
- `'idle'` – Scheduler is running, task is not currently executing.
- `'running'` – Task is actively executing.
- `'destroyed'` – Task has been permanently removed.

Useful for monitoring or debugging task state.

---

### `destroy(): void | Promise<void>`

Permanently deactivates the task and cleans up all internal resources.

- For background tasks: kills the associated process, detaches event listeners, and removes persistent state.
- After destruction, no other method (besides `getStatus`) should be called.

---

### `execute(): Promise<any>`

Manually executes the task function immediately, outside of its scheduled time.

- Useful for testing, debugging, or triggering ad-hoc runs.
- Returns a `Promise` that resolves with the task’s result, or rejects on failure.
- All appropriate lifecycle events are emitted (`execution:started`, `execution:finished`, `execution:failed`, etc.).
- If the task is destroyed or in an invalid state, the call may throw or reject.

---

### `getNextRun(): Date | null`

Returns the next scheduled run time for the task, or `null` if the scheduler is stopped or the task is destroyed.

- May return `null` if the cron expression does not yield a future match (e.g. expired schedule).

---

### `on(event: TaskEvent, fn: (context: TaskContext) => void | Promise<void>): void`

Subscribes to a specific lifecycle event.

- The callback receives a `TaskContext` object with metadata about the task and execution.
- Can be used for logging, metrics, custom side effects, or failure handling.

```ts
task.on('execution:failed', (ctx) => {
  console.error(`Task ${ctx.task?.id} failed:`, ctx.execution?.error);
});
```

### `off(event: TaskEvent, fn: (context: TaskContext) => void | Promise<void>): void`

Removes a previously registered event listener.
 - Use this to stop listening to specific task or execution events.

### `once(event: TaskEvent, fn: (context: TaskContext) => void | Promise<void>): void`
Subscribes to an event once. The callback is automatically removed after the first invocation.
 - Useful for temporary hooks or one-time monitoring.