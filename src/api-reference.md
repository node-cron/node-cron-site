# Node-Cron Module
This page documents all public methods available in the node-cron module, including usage examples, parameter descriptions, and behavior notes.

## 🔹 `schedule(expression, func, options?)`

Schedules a task to be executed based on a cron expression.

### Parameters
| Name         | Type                   | Description                                                                  |
| ------------ | ---------------------- | ---------------------------------------------------------------------------- |
| `expression` | `string`               | A valid cron expression (e.g., `"0 0 * * *"` to run at midnight daily)       |
| `func`       | `Function \| string`   | A function to execute, or a path to a module that exports a `task` function. By passing a path node-cron is going to create [Background Task](background-tasks) |
| `options`    | `Options` *(optional)* | Additional options to control execution (see below)                          |

#### Options
```ts
type Options = {
  name?: string;
  timezone?: string;       // E.g., "America/New_York"
  noOverlap?: boolean;     // Prevents overlapping executions
  maxExecutions?: number;  // Maximum number of times the task should run
};
```

#### Returns

Returns a ScheduledTask instance with control methods:

```ts
import cron from 'node-cron';

const task = cron.schedule('* * * * *', () => {
  console.log('Running every minute');
});

task.stop();    // Pauses the task
task.start();   // Starts or resumes the task
task.destroy(); // Completely removes the task

```

See more on [Task Controls Guide](/task-controls)


## 🔹 `createTask(expression, func, options?)`

Creates a task instance without automatically starting it. Useful for cases where you need more control (e.g., starting later, conditionally, or in tests).

```ts
import cron from 'node-cron';

const task = cron.createTask('0 * * * *', () => {
  console.log('Running every hour');
});
task.start();
```

## 🔹 `validate(expression: string): boolean`

Validates whether a given cron expression is syntactically correct.
Example
```ts
import cron from 'node-cron';

cron.validate('0 12 * * *'); // true
cron.validate('invalid');    // false
```

Returns true if the expression is valid, false otherwise.