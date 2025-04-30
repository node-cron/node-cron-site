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

