---
outline: deep
title: Logging
description: Route node-cron's internal messages through your own logger with setLogger or the per-task logger option, integrate winston/pino, silence output, and control the missed-execution warning.
---

# Logging

node-cron writes a few internal messages, most notably a warning when a
scheduled execution is missed (usually caused by blocking I/O or high CPU in
the same process). You can route these messages through your own logger and
control the missed-execution warning.

## The `Logger` interface

A logger is any object that implements these four methods. You don't need to
extend or `implements` anything; any matching object works (structural typing).

```ts
interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string | Error, err?: Error): void;
  debug(message: string | Error, err?: Error): void;
}
```

> 🛈 `error` and `debug` may receive either a `string` or an `Error`, so handle
> both in your adapter.

## Setting a global logger

Use `setLogger` to replace the built-in console logger for the whole module:

```js
import cron, { setLogger } from 'node-cron';

setLogger({
  info:  (msg) => myLogger.info(msg),
  warn:  (msg) => myLogger.warn(msg),
  error: (msg) => myLogger.error(msg),
  debug: (msg) => myLogger.debug(msg),
});
```

In CommonJS:

```js
const cron = require('node-cron');
cron.setLogger({ /* ... */ });
```

### Using winston / pino

Both expose `info`/`warn`/`error`/`debug`, so they are almost a drop-in:

```js
import pino from 'pino';
import { setLogger } from 'node-cron';

const log = pino();

setLogger({
  info:  (m) => log.info(m),
  warn:  (m) => log.warn(m),
  error: (m, e) => log.error(e ?? m),
  debug: (m) => log.debug(m),
});
```

### Silencing all output

Pass a logger whose methods do nothing:

```js
import { setLogger } from 'node-cron';

const noop = () => {};
setLogger({ info: noop, warn: noop, error: noop, debug: noop });
```

## Per-task logger

You can also override the logger for a single task with the `logger` option. It
takes precedence over the global logger for that task:

```js
const task = cron.schedule('* * * * *', () => {}, {
  logger: myTaskLogger,
});
```

> 🛈 The per-task `logger` is **not** supported for [Background Tasks](/background-tasks),
> because it cannot cross the worker process boundary. For background tasks, use
> the global `setLogger` (the parent process does the logging from the worker's
> events) or call `setLogger` inside the task file itself.

## Suppressing the "missed execution" warning

When a scheduled execution is missed, node-cron logs:

```
[NODE-CRON] [WARN] missed execution at <time>! Possible blocking IO or high CPU ...
```

This warning is intentional. It surfaces environments where blocking I/O or CPU
pressure is causing node-cron to miss runs. It is suppressed automatically when
you take ownership of the signal, in either of two ways:

### 1. Listen to the `execution:missed` event

If a listener is attached, node-cron assumes you are handling it and stays quiet:

```js
const task = cron.schedule('* * * * *', () => {});

task.on('execution:missed', (ctx) => {
  // you decide what to do: log it, alert, ignore, etc.
  metrics.increment('cron.missed', { date: ctx.date });
});
```

See [Event Listening](/event-listening) for the full event list and payload.

### 2. Opt out explicitly with `suppressMissedWarning`

If you simply want the warning off (without listening), set the option:

```js
const task = cron.schedule('* * * * *', () => {}, {
  suppressMissedWarning: true,
});
```

> ⚠️ Suppressing the warning hides a real signal: your task may be missing
> executions due to blocking I/O or high CPU. Prefer fixing the root cause, or
> running the job as a [Background Task](/background-tasks), before silencing it.

## Next steps

- **[Cookbook](/cookbook)**: practical, copy-paste recipes for common jobs.
- [API Reference](/api-reference): the full surface of the node-cron module.
