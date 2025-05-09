# Background Tasks

Background Tasks allows you to schedule recurring jobs that run in separate forked processes using Node’s `child_process`. This ensures that background tasks are isolated from the main application, improving reliability and performance. Each task is defined in its own file and triggered via a cron expression, offering a clean, modular approach to background automation.

## How to Use

**1. Create a Task File** 

Write a file that exports a task function. This function will contain the logic you want to run on a schedule.
```js
// ./tasks/my-task.js
exports.task = () => {
  return 'Hello from background task!';
};

```

Or using ESM

```js
// ./tasks/my-task.js
export function task() => {
  return 'Hello from background task!';
};

```

**2. Schedule the Task**

Use the BackgroundScheduledTask class to register and start the task.
```js
import cron from 'node-cron';

cron.schedule('*/5 * * * * *', './tasks/my-task.js');
```

## How It Works Internally

When a Background Task is created, it forks a new process and starts a `daemon` that handles task scheduling by loading the task and scheduling it like the regular cron scheduler. This ensures the cron job runs in isolation.

The parent and child processes communicate through events, such as `task-started`, `task-done`, and others, to keep track of the task’s status and execution.

The system implements the same interface as a basic scheduled task, providing utility functions like `start()`, `stop()`, and `destroy()`, allowing for easy lifecycle management of the task.