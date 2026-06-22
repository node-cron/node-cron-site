---
outline: deep
title: Plain English to Cron (cron-translate)
description: Translate plain English schedules like "every weekday at 6pm" into cron expressions for node-cron, and turn cron expressions back into readable English. Zero-dependency, TypeScript-native.
---

# Plain English to Cron

[`cron-translate`](https://github.com/node-cron/cron-translate) is a companion package that converts plain English into the cron expressions node-cron runs, and back again. It is zero-dependency, TypeScript-native, and built specifically for node-cron's 6-field format.

Two functions:

- **`toCron(text)`** turns a phrase like `every weekday at 6pm` into `0 0 18 * * 1-5`.
- **`toHuman(cron)`** turns a cron expression back into a readable sentence.

## Install

```bash
npm install cron-translate
```

```js
import { toCron } from 'cron-translate';

toCron('every day at 9am'); // "0 0 9 * * *"
```

It ships both ESM and CommonJS builds with type declarations, and requires Node.js >= 20.

## Using it with node-cron

The whole point is that the output drops straight into `cron.schedule`:

```js
import cron from 'node-cron';
import { toCron } from 'cron-translate';

cron.schedule(toCron('every weekday at 6pm'), () => {
  runDailyReport();
});
```

No more counting fields or second-guessing whether `*/5` goes in minutes or hours.

## English to cron

A schedule is a sentence: one frequency, plus optional clauses for time, day, and month.

```
every <frequency> [at <time>] [on <day>] [in <month>]
```

| Input | Cron |
|---|---|
| `every minute` | `0 * * * * *` |
| `every 5 minutes` | `0 */5 * * * *` |
| `every day at noon` | `0 0 12 * * *` |
| `every weekday at 6pm` | `0 0 18 * * 1-5` |
| `every monday at 9am` | `0 0 9 * * 1` |
| `every weekend` | `0 0 0 * * 0,6` |
| `last friday of the month` | `0 0 0 * * 5L` |
| `first monday of the month at 9am` | `0 0 9 * * 1#1` |

Times can be 12-hour (`at 9am`, `at 6:30pm`), 24-hour (`at 14:30`), or words (`at noon`, `at midnight`). Day-parts work as a whole schedule (`every morning`, `every evening`).

### Values, lists, and ranges

Every field accepts a single value, a list, or a range. Address a field by name, or use weekday and month names:

| Example | Cron |
|---|---|
| `at minutes 0, 15, 30 and 45` | `0 0,15,30,45 * * * *` |
| `at minute 1 to 30` | `0 1-30 * * * *` |
| `between 9am and 5pm` | `0 0 9-17 * * *` |
| `on day 1 to 10` | `0 0 0 1-10 * *` |
| `in march and june` | `0 0 0 1 3,6 *` |
| `on monday to friday` | `0 0 0 * * 1-5` |

Lists use `,` or `and`; ranges use `to` or `through`. Names and abbreviations both work (`january` / `jan`, `monday` / `mon`).

### Invalid input is rejected, never guessed

If a phrase can't become a valid cron expression, `toCron` throws a `CronTranslateError` instead of returning a wrong schedule. That covers unrecognized words, conflicting clauses, and out-of-range values (minute `0`-`59`, day `1`-`31`, and so on).

```js
import { toCron, CronTranslateError } from 'cron-translate';

try {
  toCron('the weekday nearest the 15th');
} catch (err) {
  if (err instanceof CronTranslateError) {
    console.error(err.message, err.hint);
  }
}
```

A wrong cron expression runs your job at the wrong time, which is worse than an error. Things standard cron can't express (the `W` nearest-weekday character, counted recurrence like `until christmas`, arbitrary natural language) are turned away on purpose, with a hint pointing back to the [cron syntax](/cron-syntax) reference.

## Cron to English

`toHuman` goes the other way: give it a 5- or 6-field cron expression and it returns a readable sentence.

```js
import { toHuman } from 'cron-translate';

toHuman('0 0 9 * * *');     // "at 9am"
toHuman('0 0 18 * * 1-5');  // "at 6pm on monday to friday"
toHuman('0 */5 9 * * *');   // "every 5 minutes at 9am"
toHuman('0 0 0 * * 5L');    // "last friday of the month"
```

The English is phrased so that `toCron` parses it back to the same expression, so `toCron(toHuman(cron))` returns the original cron. That makes it a natural readback: take a cron a user typed, show them what it means, and let them confirm it before it ships.

## Learn more

Full documentation, the complete grammar, and the source are on GitHub: [node-cron/cron-translate](https://github.com/node-cron/cron-translate).
