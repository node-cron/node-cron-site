# Scheduling Options

When you create a scheduled task using `cron.schedule(expression, task, options)`, you can pass an optional configuration object to control its behavior.

## Type Definition

```ts
export type Options = {
  name?: string;
  timezone?: string;
  noOverlap?: boolean;
  maxExecutions?: number;
  maxRandomDelay?: number;
};
```

## Field Descriptions

| Field            | Type      | Description                                                                 |
|------------------|-----------|-----------------------------------------------------------------------------|
| `name`           | `string`  | Optional identifier for the task. Useful for debugging, logging, or display in UIs. |
| `timezone`       | `string`  | The timezone in which the cron expression should be interpreted. This should be a valid timezone name as recognized by `Intl.DateTimeFormat` (e.g., `"America/Sao_Paulo"`, `"UTC"`, `"Europe/London"`). Defaults to system timezone if not specified. |
| `noOverlap`      | `boolean` | If `true`, prevents overlapping runs. If a task is still executing when the next scheduled time arrives, the new run is skipped. Defaults to `false`|
| `maxExecutions`  | `number`  | Sets a limit on how many times the task should execute. After reaching this count, the task is automatically destroyed. |
| `maxRandomDelay` | `number`  | (Jitter) Adds up to the specified number of milliseconds of random delay before executing each scheduled run. Useful to prevent “thundering herd” effects when many tasks are scheduled at the same time. Default is 0 (no delay). |

> 🛈 Unlike older versions, `scheduled` and `runOnInit` are no longer used. By default, tasks are scheduled and started immediately upon creation. If you need a task that is initially stopped, use the `createTask` function. To manually run a task immediately after scheduling, simply call `task.execute()` after the task has been scheduled.


## Examples

### 1. Basic Scheduling with Default Options

This example schedules a task to run every minute with the default options.

```js
const task = cron.schedule('* * * * *', async () => {
  console.log('Task is running every minute');
});
```

In this case, the task will run immediately upon creation, using the system's timezone, without preventing overlapping runs or limiting the number of executions.

### 2. Scheduling with a Custom Timezone

This example schedules a task with a custom timezone (America/Sao_Paulo), ensuring the cron expression is evaluated in that timezone.

```js
const task = cron.schedule('* * * * *', async () => {
  console.log('Running every minute in Sao Paulo timezone');
}, {
  timezone: 'America/Sao_Paulo'
});

``` 
Here, the task will run at the top of each minute based on the specified timezone.

### 3. Preventing Overlap Between Task Executions

This example schedules a task that prevents overlap, meaning if a task is still running and the next scheduled time arrives, it will be skipped.

```js
const task = cron.schedule('* * * * *', async () => {
  console.log('Running every minute without overlap');
}, {
  noOverlap: true
});
```

With noOverlap: true, if the task takes more than a minute to execute, the next scheduled execution will be skipped to avoid overlapping.

### 4. Limiting Task Executions

In this example, the task will stop running after it has executed a specified number of times (maxExecutions).

```js
const task = cron.schedule('* * * * *', async () => {
  console.log('This will run only 5 times');
}, {
  maxExecutions: 5
});
```

This task will automatically be destroyed after it has executed 5 times.


### 5. Creating a Stopped Task (via createTask)

If you need a task to be initially stopped (not run right away), you can use the createTask function. This example shows how to create a task that starts only when explicitly told to.

```js
const task = cron.createTask('* * * * *', async () => {
  console.log('This task is manually started');
}, {
  noOverlap: true
});

// Task is not started immediately; it will run only when `.start()` is called.
task.start();
```
This will create a task that is stopped by default. You can control when it starts by calling task.start().


### 6. Manually Running a Task After Scheduling

If you want to manually run a task immediately after scheduling, you can call task.execute().

```js
const task = cron.schedule('* * * * *', async () => {
  console.log('Running the task every minute');
});

// Manually run the task right after it's scheduled
task.execute();
```

In this case, the task will run immediately after it has been scheduled, even though the cron expression is set to run every minute.