---
title: "cron-translate: write schedules in plain English"
date: 2026-06-22
author: Lucas Merencia
description: "Cron expressions are write-once, read-never. cron-translate turns plain English like \"every weekday at 6pm\" into the cron node-cron runs, and back. Here is how it works and the decisions behind it."
sidebar: false
---

# cron-translate: write schedules in plain English

Cron expressions are write-once, read-never. You look up `0 0 18 * * 1-5` on a syntax page, paste it into `cron.schedule`, and hope you counted the fields right. Six months later you open the file and have to look it up all over again. Nobody memorizes cron, and nobody should have to.

So I built [`cron-translate`](https://github.com/node-cron/cron-translate): you write the schedule the way you would say it out loud, and it gives you the cron node-cron runs.

```js
import cron from 'node-cron';
import { toCron } from 'cron-translate';

cron.schedule(toCron('every weekday at 6pm'), () => {
  runDailyReport();
});
```

`every weekday at 6pm` becomes `0 0 18 * * 1-5`. No field counting, no second-guessing whether `*/5` belongs in minutes or hours. It is a sentence: one frequency, plus optional clauses for time, day, and month. `every 5 minutes at 9am`, `last friday of the month`, `every 30 minutes between 9am and 5pm on weekdays`, they all work, and every field accepts lists and ranges (`at minutes 0, 15, 30 and 45`, `on monday to friday`).

## It rejects bad input instead of guessing

This was the load-bearing decision. The worst thing a tool like this can do is take a phrase it does not fully understand and return a plausible-but-wrong cron. A wrong expression does not throw, it just runs your job at the wrong time, and you find out in production.

So `cron-translate` does not guess. If a phrase can't become a valid expression, it throws a `CronTranslateError` with a hint. Out-of-range values (minute `99`, day `45`), conflicting clauses, things cron simply cannot express (`until christmas`, the `W` nearest-weekday character): all turned away on purpose, never silently mangled into something that runs.

A library whose job is to produce correct cron has to treat "I don't understand this" as a feature, not a gap.

## It is built for node-cron, not generic cron

There is no single cron dialect. Five fields, six with seconds, Quartz with `L` and `#`, AWS with a year field, each numbers the days differently. A generic translator has to pick a lowest common denominator.

`cron-translate` does not. It targets node-cron's 6-field format exactly, which means it can lean on what node-cron actually supports: `last friday of the month` compiles to `5L`, `first monday of the month` to `1#1`, `last day of the month` to `L`. Phrasings that only work because the runner supports them. The tool and the runner are made by the same hands, so the translation is faithful to what will really fire.

## It also reads cron back to you

The reverse direction matters just as much. Give `toHuman` an expression and it hands back a sentence:

```js
import { toHuman } from 'cron-translate';

toHuman('0 0 18 * * 1-5'); // "at 6pm on monday to friday"
toHuman('0 */5 9 * * *');  // "every 5 minutes at 9am"
toHuman('0 0 0 * * 5L');   // "last friday of the month"
```

This is not a separate cron-describer competing with the existing ones. It is the confirmation half of the same tool. The English it produces is phrased so that `toCron` parses it straight back to the same expression, `toCron(toHuman(cron))` returns the original. So you can take a cron a user typed, show them what it means in their own words, and let them confirm it before it ships. The scariest part of any scheduling UI is "did it understand me?", and the readback answers it.

## Small on purpose

`cron-translate` does one thing. It is zero-dependency, TypeScript-native, no LLM, no network call, just a parser and a renderer. It is not trying to understand arbitrary English; it understands the phrases people actually use for schedules, and says no clearly to the rest.

```bash
npm install cron-translate
```

The docs live under [Plain English to Cron](/cron-translate), and the source is on [GitHub](https://github.com/node-cron/cron-translate). Pass its output straight into `cron.schedule` and never count cron fields again.
