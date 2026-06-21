---
outline: deep
title: Cron Syntax
description: How node-cron interprets cron expressions, covering fields, allowed values, ranges, steps, lists, named months and weekdays, plus a copy-paste table of common schedules.
---

# Cron Syntax

A cron expression is how you tell node-cron *when* a task should run. `node-cron` uses the standard cron format with **five or six fields**, where the leading **seconds** field is optional.

```plaintext
# ┌────────────── second (optional)
# │ ┌──────────── minute
# │ │ ┌────────── hour
# │ │ │ ┌──────── day of month
# │ │ │ │ ┌────── month
# │ │ │ │ │ ┌──── day of week
# │ │ │ │ │ │
# * * * * * *
```

When you provide **five** fields, the seconds field defaults to `0` (the task runs at the start of the matched minute). Provide **six** fields to schedule down to the second.

## Allowed values per field

| Field          | Values                              |
| -------------- | ----------------------------------- |
| second         | `0-59` (optional)                   |
| minute         | `0-59`                              |
| hour           | `0-23`                              |
| day of month   | `1-31` (or `L` for the last day)    |
| month          | `1-12` (or names, e.g. `Jan`, `Sep`)|
| day of week    | `0-7` (or names; `0` and `7` are Sunday; [`2#3`](#nth-weekday), [`5L`](#last-weekday-of-the-month-weekdayl)) |

Each field also accepts `*` (any value), ranges, steps, and comma-separated lists, described below.

## Common schedules

Copy-paste reference for the expressions you'll reach for most often:

| Expression       | Runs                                  |
| ---------------- | ------------------------------------- |
| `* * * * *`      | Every minute                          |
| `*/5 * * * *`    | Every 5 minutes                       |
| `0 * * * *`      | Every hour, on the hour               |
| `0 0 * * *`      | Every day at midnight                 |
| `0 3 * * *`      | Every day at 03:00                    |
| `0 9 * * 1-5`    | At 09:00, Monday through Friday       |
| `0 0 1 * *`      | At midnight on the 1st of each month  |
| `0 0 L * *`      | At midnight on the last day of each month |
| `0 0 * * 0`      | At midnight every Sunday              |
| `0 0 12 * * 1#1` | At 12:00 on the first Monday of every month |
| `0 0 18 * * 5L`  | At 18:00 on the last Friday of every month  |
| `*/30 * * * * *` | Every 30 seconds (6-field form)       |

## Building expressions

### Lists: multiple specific values

Use commas to run a task at several specific values in a field.

```js
import cron from 'node-cron';

// Runs at minutes 1, 2, 4, and 5 of every hour
cron.schedule('1,2,4,5 * * * *', () => {
  console.log('Running at minutes 1, 2, 4, and 5 of each hour');
});
```

> This expression has five fields, so the **seconds** field is omitted and defaults to `0`.

### Ranges: a continuous interval

Use a dash (`-`) to define an inclusive range.

```js
import cron from 'node-cron';

// Runs every minute from minute 1 to minute 5 (inclusive) of every hour
cron.schedule('1-5 * * * *', () => {
  console.log('Running every minute from 1 to 5');
});
```

This is equivalent to `1,2,3,4,5`, a cleaner way to express consecutive values.

### Steps: periodic intervals

Use a slash (`/`) after a wildcard or range to define a step.

```js
import cron from 'node-cron';

// Every 2 minutes (even minutes: 0, 2, 4, ...)
cron.schedule('*/2 * * * *', () => {
  console.log('Running every 2 minutes (even minutes)');
});

// Every 2 minutes starting from 1 (odd minutes: 1, 3, 5, ...)
cron.schedule('1-59/2 * * * *', () => {
  console.log('Running every 2 minutes starting from 1 (odd minutes)');
});
```

- `*/2` means "every 2 units" across the field's full range (`0-59` for minutes), covering all even minutes.
- `1-59/2` means "every 2 units starting from 1", covering all odd minutes.

### Names: months and weekdays

For readability, use full or abbreviated names instead of numbers for months and days of the week.

```js
import cron from 'node-cron';

// Every minute on Sundays in January and September
cron.schedule('* * * January,September Sunday', () => {
  console.log('Running on Sundays in January and September');
});

// Same schedule using short names
cron.schedule('* * * Jan,Sep Sun', () => {
  console.log('Running on Sundays in Jan and Sep');
});
```

### Last day of the month: `L`

In the **day of month** field, `L` (or lowercase `l`) means the last calendar day of the month. node-cron resolves it per month, so it lands on the 28th, 29th, 30th, or 31st as appropriate, including leap years.

```js
import cron from 'node-cron';

// Runs at 12:00 on the last day of every month
cron.schedule('0 0 12 L * *', () => {
  console.log('Running on the last day of the month');
});
```

You can combine `L` with explicit days in a list:

```js
import cron from 'node-cron';

// Runs at midnight on the 15th and on the last day of every month
cron.schedule('0 0 15,L * *', () => {
  console.log('Running on the 15th and the last day');
});
```

> Bare `L` is valid **only** in the day of month field. In the day of week field, use the `<weekday>L` form described below.

### Nth weekday: `#` {#nth-weekday}

In the **day of week** field, `<weekday>#<nth>` matches the nth occurrence of that weekday in the month. The weekday is `0-7` (Sunday through Saturday, where `0` and `7` are both Sunday), and the occurrence is `1-5`.

```js
import cron from 'node-cron';

// Runs at 12:00 on the first Monday of every month
cron.schedule('0 12 * * 1#1', () => {
  console.log('First Monday of the month');
});

// Runs at 09:00 on the 3rd Tuesday of every month
cron.schedule('0 9 * * 2#3', () => {
  console.log('Third Tuesday of the month');
});
```

If the nth occurrence does not exist in a given month (e.g. `0#5` in a month with only four Sundays), that month is simply skipped.

### Last weekday of the month: `<weekday>L` {#last-weekday-of-the-month-weekdayl}

In the **day of week** field, `<weekday>L` matches the last occurrence of that weekday in the month.

```js
import cron from 'node-cron';

// Runs at 18:00 on the last Friday of every month
cron.schedule('0 18 * * 5L', () => {
  console.log('Last Friday of the month');
});

// Runs at midnight on the last Sunday of every month
cron.schedule('0 0 * * 0L', () => {
  console.log('Last Sunday of the month');
});
```

> Invalid forms like `8#1`, `2#6`, `2#0`, `8L`, `L5`, or bare `L` in the weekday field are rejected by [`validate`](#validating-expressions).

## Validating expressions

Not sure an expression is valid? Check it before scheduling:

```js
import cron from 'node-cron';

cron.validate('0 12 * * *'); // true
cron.validate('not a cron'); // false
```

For tooling and richer error messages, two more helpers go beyond a boolean:

- [`validateDetailed(expr)`](/api-reference#validatedetailed-expression) returns **every** problem (which field, value, and why) without throwing.
- [`parse(expr)`](/api-reference#parse-expression) returns the decomposed fields, or throws on the first invalid one.

```js
import { validateDetailed } from 'node-cron';

validateDetailed('99 12 * * 9').errors;
// [ { field: 'minute', value: '99', ... }, { field: 'dayOfWeek', value: '9', ... } ]
```

See [`validate`](/api-reference#validate-expression), [`validateDetailed`](/api-reference#validatedetailed-expression), and [`parse`](/api-reference#parse-expression) in the API reference.

## Next steps

Now that you can describe *when* a task runs, learn how to manage it once it's running:

- **[Task Lifecycle & Status](/task-lifecycle)**: start, stop, inspect, and destroy tasks.
- [Scheduling Options](/scheduling-options): timezones, overlap prevention, and limits.
