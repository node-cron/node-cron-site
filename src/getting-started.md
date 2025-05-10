# Getting Started

`node-cron` is a lightweight task scheduler for Node.js, built in pure JavaScript and inspired by [GNU crontab](https://www.gnu.org/software/mcron/manual/html_node/Crontab-file.html). It allows you to schedule tasks using full cron syntax.

## Installation

Install `node-cron` using npm:

```bash
npm install --save node-cron
```

## Basic Usage
Import node-cron and schedule a task. Below are examples for both CommonJS and ES6 modules.

### CommonJS
```js
const cron = require('node-cron');

cron.schedule('* * * * *', () => {
  console.log('Running a task every minute');
});
```

### ECMAScript Modules (ESM)
```js
import cron from 'node-cron';

cron.schedule('* * * * *', () => {
  console.log('Running a task every minute');
});
```

The cron expression * * * * * runs the task every minute. See the [Cron Syntax](/cron-syntax) section for more details.


## Task Context

When using an function (InlineTask) or [BackgroundTask](/background-tasks), `node-cron` passes a `TaskContext` object as the first argument. This object contains useful metadata about the current execution:

```ts
export type TaskContext = {
  date: Date;                // Scheduled server time for the tick
  dateLocalIso: string;      // Local ISO string for display/logging
  triggeredAt: Date;         // Actual execution start time
  task?: ScheduledTask;      // Task instance (if available)
  execution?: Execution;     // Execution metadata (if available)
};

```

Example using an inline function with context:
```js
cron.schedule('* * * * *', async (ctx) => {
  console.log(`Task started at ${ctx.triggeredAt.toISOString()}`);
  console.log(`Scheduled for: ${ctx.dateLocalIso}`);

  cosole.log(`Task status ${ctx.task.getStatus()}`)
});
```

The same may be done with background tasks:

```js
// ./tasks/my-task.js
export function task() => {
  console.log(`Task started at ${ctx.triggeredAt.toISOString()}`);
  console.log(`Scheduled for: ${ctx.dateLocalIso}`);
  cosole.log(`Task status ${ctx.task.getStatus()}`)
};

```

Use the task file path to register and start the task.
```js
import cron from 'node-cron';

cron.schedule('*/5 * * * * *', './tasks/my-task.js');
```

The `TaskContext` is also passed when listining task events, see more on [Event Listening Guide](https://nodecron.com/event-listening.html#taskcontext-payload)