---
outline: deep
title: Timezones & DST
description: How node-cron evaluates schedules in a timezone, exactly what it does across daylight-saving transitions (spring-forward gaps and fall-back overlaps), and how to opt out of DST entirely.
---

# Timezones & DST

A cron expression describes a **wall-clock** time. `30 2 * * *` means "02:30 on
the clock of the task's timezone", not a fixed UTC instant. The hard part is
daylight-saving time (DST), when the local clock jumps forward or back. This
page explains exactly what node-cron does, so you can predict every run.

By default a task runs in the **system timezone**. Set [`timezone`](/scheduling-options)
to pin it to a specific zone:

```js
cron.schedule('30 2 * * *', task, { timezone: 'America/New_York' });
```

## The guarantees

Whatever the timezone and whatever DST does, node-cron holds these invariants:

1. **Wall-clock first.** The expression is matched against the local time of the
   task's timezone.
2. **Never in the past.** The next run is always strictly after the current
   instant.
3. **Never twice for the same instant.** Even when the local clock repeats an
   hour, each absolute instant fires at most once.
4. **Always moves forward.** Successive runs are strictly increasing in absolute
   time, never going backwards when the local clock does.

## Spring-forward (the gap)

When the clock springs forward (e.g. `02:00 → 03:00`), the times inside the gap
**don't exist**. node-cron **skips** them rather than guessing an adjacent time.

- A daily time that lands in the gap is skipped **for that day**. `30 2 * * *` in
  `America/New_York` has no `02:30` on the spring-forward day, so that day is
  skipped and the next run is the following day at `02:30`.
- A sub-daily expression resumes at the first valid time after the gap.
  `*/15 * * * *` goes `… 01:45, 03:00, 03:15 …` — `02:00`–`02:45` never fire.

The reasoning: you configured `02:30` on purpose. Firing at `03:00` instead
would be surprising; skipping is predictable.

## Fall-back (the overlap)

When the clock falls back (e.g. `02:00 → 01:00`), the times inside the overlap
exist **twice**. node-cron fires on the **first** occurrence and ignores the
second.

- `30 1 * * *` in `America/New_York` fires once, at `01:30` in the
  pre-transition offset (EDT). The second `01:30` (EST) is ignored that day.
- Sub-hourly expressions keep advancing monotonically in absolute time:
  after `01:59` (first pass) the next run is `02:00`, not `01:00` again. The
  local clock rewinds, the timestamps don't.

Consecutive runs are always at least the expression's interval apart (1s for
`* * * * * *`, 1 min for `* * * * *`) — never milliseconds, even during the
overlap.

## Unusual offsets

node-cron handles non-hour transitions and offsets, not just the 60-minute US
case:

- **30-minute DST** (e.g. `Australia/Lord_Howe`, `02:00 → 02:30`) — the gap and
  overlap are 30 minutes wide and handled correctly.
- **45-minute base offset** (e.g. `Pacific/Chatham`, UTC+12:45) — schedules stay
  correct with no drift.
- **Midnight transitions** (e.g. `America/Havana`, DST starts at `00:00`) — a
  `00:30` daily is skipped on the gap day, like any other gap time.

## Zones without DST

Zones like `Asia/Tokyo`, `Etc/UTC`, or `Africa/Nairobi` have no transitions, so
there are no gaps or overlaps — the schedule simply runs every day. node-cron
applies no "corrections" to them.

## The system timezone doesn't leak in

A task with an explicit `timezone` runs at the same instants no matter what the
host's `TZ` is. A task set to `America/New_York` behaves identically whether the
server is in São Paulo, Tokyo, or UTC. Only tasks **without** a `timezone` use
the system zone.

## Avoiding DST entirely

If you never want DST to affect a schedule, run it in a **fixed-offset** zone
instead of a region that observes DST.

```js
// UTC: the simplest DST-free choice
cron.schedule('0 3 * * *', task, { timezone: 'Etc/UTC' });

// A fixed offset that never shifts, e.g. always UTC-3
cron.schedule('0 3 * * *', task, { timezone: 'Etc/GMT+3' });
```

::: warning `Etc/GMT` signs are inverted
In the `Etc/GMT±N` zones the sign is **reversed** from what you'd expect (a
POSIX quirk): `Etc/GMT+3` is **UTC-3**, and `Etc/GMT-5` is **UTC+5**. When in
doubt, prefer `Etc/UTC` or a real IANA name.
:::

Use a DST-observing zone (like `America/New_York`) when you want "the same local
clock time year-round"; use a fixed-offset zone when you want "the same absolute
spacing year-round".
