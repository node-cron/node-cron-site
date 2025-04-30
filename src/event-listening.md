# Listening to Task Events

All scheduled tasks — both basic and background — extend `EventEmitter` and emit lifecycle events that you can listen to using `.on()` or `.once()`.

These events let you respond to specific moments in a task’s execution — like when it starts, finishes, or is stopped manually or automatically.

---

## Available Events

| Event                          | Payload?     | Description                                                                 |
|-------------------------------|--------------|-----------------------------------------------------------------------------|
| `task-started`                | `CronEvent` | Emitted right before the task function is executed. Includes context like execution time and reason. |
| `task-done`                   | `any`       | Emitted after the task finishes. Passes the return value of the task.      |
| `scheduler-started`           | None        | Emitted when the scheduler is started via `.start()`.                      |
| `scheduler-stopped`           | None        | Emitted when the scheduler is stopped via `.stop()`.                       |
| `scheduler-destroyed`         | None        | Emitted when the task is permanently destroyed via `.destroy()`.           |
| `task-execution-limit-reached` | None        | Emitted when `maxExecutions` (if defined) is reached. The task is destroyed. |


## Example

```js
const task = cron.schedule('* * * * *', (event) => {
  console.log('Running task at', event.date);
  return 'done';
});

task.on('task-started', (event) => {
  console.log('Task started:', event.reason);
});

task.on('task-done', (result) => {
  console.log('Task finished. Result:', result);
});

task.on('scheduler-started', () => {
  console.log('Scheduler started');
});

task.on('task-execution-limit-reached', () => {
  console.warn('Max executions reached. Task will be destroyed.');
});
```

##  CronEvent Payload

The task-started event provides a CronEvent payload with metadata about the task execution. This is useful for logging, debugging, or implementing custom logic based on the execution context.

### Type Definition

```ts
export type CronEvent = {
  date: Date;
  missedExecutions: number;
  matchedDate?: string;
  reason: string;
  task?: ScheduledTask;
};
```

#### Field Descriptions

| Field             | Type              | Description                                                                 |
|------------------|-------------------|-----------------------------------------------------------------------------|
| `date`           | `Date`            | The exact timestamp when the task was triggered, respecting the server timezone.|
| `missedExecutions` | `number`        | The number of scheduled executions that were missed (e.g., due to downtime). |
| `matchedDate`    | `string` (optional) | A human-readable string showing the matched cron time at the defined timezone.|
| `reason`         | `string`          | The reason the task was executed. Can be `'manual'`, `'time-matched'`, or `'initial'`. |
| `task`           | `ScheduledTask` (optional) | A reference to the task instance that was executed. Useful for introspection or advanced handling. |

#### Sample Payload
```js
{
  date: 2025-04-30T14:05:35.165Z,
  missedExecutions: 0,
  matchedDate: 'Wed, 04/30/2025, 11:05:35',
  reason: 'time-matched',
  task: ScheduledTask { ... }
}
```

## Notes

- Events like task-started and task-done include useful payloads. Others are purely signals.
- All event listeners should be added before starting the task to avoid missing early signals.
- Background tasks emit the same events, but they’re relayed from the child process and may experience slight delays.