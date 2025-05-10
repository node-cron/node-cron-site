# Event Listening

Scheduled tasks — both basic and background — support lifecycle event subscriptions through the `.on()`, `.once()`, and `.off()` methods.

These events let you react to key moments in a task’s lifecycle, such as when it starts, finishes, fails, or is destroyed. Every listener receives a `TaskContext` object containing detailed metadata about the task and its execution.

## Available Events

| Event                  | Payload       | Description                                                          |
| ---------------------- | ------------- | -------------------------------------------------------------------- |
| `task:started`         | `TaskContext` | Emitted when the task is started via `.start()`.                     |
| `task:stopped`         | `TaskContext` | Emitted when the task is stopped via `.stop()`.                      |
| `task:destroyed`       | `TaskContext` | Emitted when the task is destroyed via `.destroy()`.                 |
| `execution:started`    | `TaskContext` | Emitted right before the task callback is executed.                  |
| `execution:finished`   | `TaskContext` | Emitted after the task successfully finishes.                        |
| `execution:failed`     | `TaskContext` | Emitted when the task throws an error.                               |
| `execution:missed`     | `TaskContext` | Emitted when a scheduled execution is missed.                        |
| `execution:overlap`    | `TaskContext` | Emitted when a scheduled execution is skipped due to an ongoing one. |
| `execution:maxReached` | `TaskContext` | Emitted when `maxExecutions` is reached. The task is destroyed.      |



## Example

```js
const task = cron.schedule('* * * * *', async (context) => {
  console.log('Running task at', context.date);
  return 'done';
});

task.on('execution:started', (ctx) => {
  console.log('Execution started at', ctx.date, 'Reason:', ctx.execution?.reason);
});

task.on('execution:finished', (ctx) => {
  console.log('Execution finished. Result:', ctx.execution?.result);
});

task.on('execution:failed', (ctx) => {
  console.error('Execution failed with error:', ctx.execution?.error?.message);
});

task.on('execution:maxReached', (ctx) => {
  console.warn(`Task "${ctx.task?.id}" reached max executions.`);
});
```

## TaskContext Payload

Every event now provides a `TaskContext` object for consistent access to timing and execution metadata.

### Type Definition

```ts
export type TaskContext = {
  date: Date;
  dateLocalIso: string;
  triggeredAt: Date;
  task?: ScheduledTask;
  execution?: Execution;
}
```

#### Field Descriptions

| Field          | Type            | Description                                                               |
| -------------- | --------------- | ------------------------------------------------------------------------- |
| `date`         | `Date`          | Timestamp when the task was scheduled to run (or did run).                |
| `dateLocalIso` | `string`        | Human-readable local timestamp string, using the provided timezone.       |
| `triggeredAt`  | `Date`          | Actual time the event was emitted. Useful for debugging latency or drift. |
| `task`         | `ScheduledTask` | Reference to the task instance.                                           |
| `execution`    | `Execution?`    | Execution info if relevant to the event (null for non-execution events).  |


### Execution Type

This structure is embedded in TaskContext.execution and represents a single run of a task:

```js
export type Execution = {
  id: string;
  reason: 'invoked' | 'scheduled';
  startedAt?: Date;
  finishedAt?: Date;
  error?: Error;
  result?: any;
}
```
#### Execution Fields
| Field        | Type     | Description                                                       |
| ------------ | -------- | ----------------------------------------------------------------- |
| `id`         | `string` | Unique ID for this execution.                                     |
| `reason`     | `string` | Why the task was triggered — either `'invoked'` or `'scheduled'`. |
| `startedAt`  | `Date?`  | Time execution started.                                           |
| `finishedAt` | `Date?`  | Time execution finished.                                          |
| `error`      | `Error?` | Error thrown, if any.                                             |
| `result`     | `any?`   | Return value of the task if successful.                           |


## Notes
 - All event listeners receive a `TaskContext`, even for events like task:stopped or execution:missed.
 - Always attach listeners before calling `.start()` to avoid missing early events.
 - Background tasks emit the same events with the same context, relayed from the worker process.