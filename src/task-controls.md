---
outline: deep
---

# Task Controls
When scheduling a task with `cron.schedule` function it accepts a cron expression, a task (either as a function or a path to a task file), and optional configuration.

```js
const task = cron.schedule('* * * * *', () = > {
  //
}, { scheduled: false });

task.getStatus(); // stopped

task.start();     // starts the scheduler

task.getStatus(); // idle

// when task is running
task.getStatus(); // running

task.stop() // stops the scheduler

task.execute(); // manually performs the task

task.destroy() // stops the scheduler and releases the resources
```

This function returns an object that implements the ScheduledTask interface. Whether you're using a simple in-process task or a background task that runs in a separate process, the returned object provides the same set of utility methods for managing the task's lifecycle and triggering it manually.

## ScheduledTask Interface
The ScheduledTask interface defines a standard contract for scheduled task behavior. This allows your code to interact with any scheduled task in a consistent way — starting, stopping, executing, or destroying it, regardless of the underlying implementation.

```ts
export interface ScheduledTask {
  start(): void;
  stop(): void;
  getStatus(): string;
  destroy(): void;
  execute(event?: CronEvent): Promise<any>;
}
```

## Method Descriptions

### `start(): void`
Begins the task scheduler.  
For background tasks, this also forks a new process and starts a daemon responsible for managing the schedule and execution.

### `stop(): void`
Stops the task from running in the future:
- For **basic (in-process)** tasks, it halts the scheduler but allows any currently running job to finish.
- For **background tasks**, it terminates the child process immediately — stopping the scheduler **and** any running job.

### `getStatus(): string`
Returns the current lifecycle status of the task. Typical values include:
- `'running'` – task is actively executing.
- `'idle'` – task is scheduled but not currently running.
- `'stopped'` – scheduler is inactive.
- `'destroyed'` – task has been permanently removed.

### `destroy(): void`
Fully removes the task and cleans up its resources.  
For background tasks, this also kills the process, detaches listeners, and deletes any persistent metadata.

### `execute(event?: any): Promise<any>`
Manually executes the task immediately, regardless of its schedule.  
Returns a `Promise` with the result of the execution or rejects if the task is not active or running (e.g., in a background task with no active process).
