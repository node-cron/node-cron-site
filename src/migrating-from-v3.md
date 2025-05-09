# Migration Guide: node-cron v3 to v4

`node-cron` v4 represents a significant update, both in terms of internal optimizations and the move to TypeScript. This version improves task scheduling performance and provides a more flexible API for handling scheduled tasks.

## Internal Changes:
- **Improved Scheduling Algorithm**: In v4, the internal scheduling mechanism has been optimized. Previously, the system checked the cron expression every second. Now, the delay between checks is dynamically calculated based on the cron expression, leading to more efficient task scheduling and reduced unnecessary checks.
 For example, if your task is scheduled to run every 5 minutes, the internal timer will only check the cron expression at intervals that make sense for the task's schedule, rather than checking every secod. This reduces CPU overhead and increases the efficiency of the scheduler.

- **TypeScript Adoption**: `node-cron` v4 has been rewritten in TypeScript, providing better type safety and enabling richer editor support for developers. This update ensures that you can catch potential errors earlier in the development process, thanks to the strict type checking TypeScript provides.

## Breaking Changes and How to Migrate from v3 to v4
`node-cron` **v4** introduces a more powerful and flexible API. This guide outlines the breaking changes and how to migrate your tasks from v3 to v4.

### 1. Task Creation and Options
#### v3:

In v3, you used the scheduled and runOnInit options to control the behavior of tasks.

```js
const task = cron.schedule('* * * * *', async () => {
  console.log('Running every minute');
}, {
  scheduled: true,
  runOnInit: true,
  timezone: 'America/Sao_Paulo'
});
```

#### v4:

In v4, the scheduled and runOnInit options are removed. By default, tasks are scheduled and started immediately when created. If you need a task that is initially stopped, use the createTask function.

```js
const task = cron.schedule('* * * * *', async () => {
  console.log('Running every minute');
}, {
  timezone: 'America/Sao_Paulo'
});

// To imediate execute the task after scheduling
task.execute();
```

If you need a stopped task (one that doesn’t start immediately), use createTask instead:

```js
const task = cron.createTask('* * * * *', async () => {
  console.log('This task is manually started');
}, {
  noOverlap: true
});

// The task will not run until `task.start()` is called.
task.start();
```

### 2. Task Options (Options vs CronScheduleOptions)
#### v3:

v3 used the following options for scheduling tasks:

```js
/**
 * @typedef {Object} CronScheduleOptions
 * @prop {boolean} [scheduled] if a scheduled task is ready and running to be
 *  performed when the time matches the cron expression.
 * @prop {boolean}[runOnInit] run the task when scheduling
 * @prop {string} [timezone] the timezone to execute the task in.
 */
```
#### v4:

In v4, the task scheduling options have been streamlined into a single Options type, with updated field names. Notably, the `scheduled` and `runOnInit` fields are removed and replaced with the following:
```js
export type Options = {
  name?: string;
  timezone?: string;
  noOverlap?: boolean;
  maxExecutions?: number;
};
```

Key updates:
  - name: You can now specify a name for the task (useful for debugging or logging).
  - timezone: Defines the timezone in which the cron expression should be interpreted.
  - noOverlap: Prevents overlapping task executions.
  - maxExecutions: Limits the number of executions before the task is automatically destroyed.


### 3. Task Lifecycle Events
#### v3:

In v3, events were emitted through the EventEmitter pattern, and you could listen to events using `.on()`, `.once()`, and `.off()`.

#### v4:

In v4, the event system has been simplified. The `ScheduledTasks` are no longer exteding `EventEmitter`. Instead, events are handled via the on/once/off methods on the ScheduledTask directly. Each event listener receives a `TaskContext` with runtime metadata.
Example in v3 (Old API):

```js
const task = cron.schedule('* * * * *', async () => {
  console.log('Running every minute');
});

task.on('task-started', (event) => {
  console.log('Task started:', event);
});
```

```js
Example in v4 (New API):

const task = cron.schedule('* * * * *', async () => {
  console.log('Running every minute');
});

task.on('task:started', (context) => {
  console.log('Task started:', context);
});
```

New Event Names:
- task-started -> task:started
- task-stopped -> task:stopped
- task-destroyed -> task:destroyed

See [Listening Events Guide](/event-listening) for more info

