---
outline: deep
title: Cron Expression Tester
description: Paste a cron expression and read it back in plain English, instantly. Powered by cron-translate, built for node-cron's 6-field format. Translate cron to English and English to cron right in your browser.
aside: false
---

# Cron Expression Tester

Type a cron expression and read it back in plain English, instantly. This runs
[`cron-translate`](/cron-translate) in your browser, the same library you can drop into
your node-cron project. No server, no tracking of what you type.

<CronTester />

It uses node-cron's [6-field syntax](/cron-syntax) (`second minute hour day month weekday`).
Five-field expressions work too: the second is assumed to be `0`.

Every test is shareable. The URL updates as you type, so you can copy it (or hit
**Copy shareable link**) and send it to someone. A `?c=` link opens the cron reader
(`/cron-tester?c=0 0 9 * * 1-5`) and a `?t=` link opens the English translator
(`/cron-tester?t=every weekday at 6pm`).

## How it works

The tester is just two function calls from [`cron-translate`](/cron-translate):

```js
import { toHuman, toCron } from 'cron-translate';

toHuman('0 0 9 * * 1-5'); // "at 9am on monday to friday"
toCron('every weekday at 6pm'); // "0 0 18 * * 1-5"
```

`toHuman` is phrased so that `toCron` parses it back to the same expression, so the two
directions round-trip. Once you have an expression you trust, drop it into node-cron:

```js
import cron from 'node-cron';

cron.schedule('0 0 9 * * 1-5', () => {
  runDailyReport();
});
```

See the [cron-translate guide](/cron-translate) for the full grammar, or the
[cron syntax reference](/cron-syntax) for what each field accepts.
