---
title: Sponsors
description: node-cron has run in production since 2016, now in 220,000+ repositories with zero dependencies. If it helps your team, you can help keep it going.
aside: false
---

<style scoped>
.sp-badges { margin: 18px 0 8px; }
.sp-badges img { display: inline; margin: 2px 3px; vertical-align: middle; }
.sp-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 14px;
  margin: 28px 0;
}
.sp-stat {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 18px;
  text-align: center;
}
.sp-stat .num { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.15; }
.sp-stat .num .brand { color: var(--vp-c-brand-1); }
.sp-stat .lbl { font-size: 13px; color: var(--vp-c-text-2); margin-top: 4px; }
.sp-funds {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin: 20px 0;
}
.sp-funds .sp-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 20px;
}
.sp-funds .sp-card strong { display: block; margin-bottom: 6px; }
.sp-funds .sp-card p { margin: 0; color: var(--vp-c-text-2); font-size: 14px; }
.sp-showcase {
  border: 1px dashed var(--vp-c-divider);
  border-radius: 12px;
  padding: 28px;
  text-align: center;
  color: var(--vp-c-text-2);
  margin: 16px 0;
}
.sp-ctabar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 22px 24px;
  margin: 28px 0 8px;
}
.sp-ctabar .copy { flex: 1; min-width: 240px; }
.sp-ctabar .copy p { margin: 0 0 4px; }
.sp-ctabar .copy .sub { color: var(--vp-c-text-2); font-size: 14px; margin: 0; }
.sp-btn {
  display: inline-block;
  background: var(--vp-c-brand-1);
  color: #fff !important;
  font-weight: 700;
  text-decoration: none !important;
  padding: 12px 22px;
  border-radius: 10px;
  white-space: nowrap;
}
.sp-btn:hover { background: var(--vp-c-brand-2); }
.sp-btns { display: flex; flex-wrap: wrap; gap: 10px; }
.sp-btn.ghost {
  background: transparent;
  color: var(--vp-c-brand-1) !important;
  border: 1px solid var(--vp-c-brand-1);
}
.sp-btn.ghost:hover { background: var(--vp-c-brand-soft); }
.sp-panel {
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 16px;
  background: var(--vp-c-bg-soft);
  padding: 30px 24px;
  margin: 22px 0;
  text-align: center;
}
.sp-list p { margin: 28px 0; }
.sp-list p:first-child { margin-top: 0; }
.sp-list p:last-child { margin-bottom: 0; }
.sp-list strong {
  display: block;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: .12em;
  color: var(--vp-c-text-2);
  margin-bottom: 6px;
}
.sp-list img { border-radius: 10px; margin: 8px; vertical-align: middle; transition: transform .15s ease; }
.sp-list a:hover img { transform: translateY(-3px); }
.sp-panel .sp-showcase { border: none; margin: 0; padding: 6px; font-size: 15px; }
</style>

# Help keep node-cron dependable.

node-cron has scheduled jobs in Node.js since 2016. Today it runs in 220,000+ repositories at around 20 million downloads a month, with zero runtime dependencies. It is maintained in the open, for free.

If it is part of your stack, sponsoring is a simple way to help keep it that way. Your support goes to the DST and timezone test suite that keeps jobs firing correctly through clock changes, the lifecycle observability that makes production debugging easier, and the ongoing work of holding the dependency count at zero.

<div class="sp-badges">

[![npm downloads](https://img.shields.io/npm/dm/node-cron?label=downloads%2Fmonth&color=2f9d5f)](https://www.npmjs.com/package/node-cron)
[![used by](https://img.shields.io/badge/used%20by-220k%2B%20repos-2f9d5f)](https://github.com/node-cron/node-cron/network/dependents)
[![GitHub stars](https://img.shields.io/github/stars/node-cron/node-cron?color=2f9d5f)](https://github.com/node-cron/node-cron)
[![dependencies](https://img.shields.io/badge/dependencies-0-2f9d5f)](https://www.npmjs.com/package/node-cron?activeTab=dependencies)

</div>

<div class="sp-stats">
  <div class="sp-stat"><div class="num">2016</div><div class="lbl">in production since<br>(~10 years)</div></div>
  <div class="sp-stat"><div class="num">20M+</div><div class="lbl">downloads / month<br>(npm)</div></div>
  <div class="sp-stat"><div class="num">220k+</div><div class="lbl">repositories use it<br>(GitHub “Used by”)</div></div>
  <div class="sp-stat"><div class="num">0</div><div class="lbl">runtime<br>dependencies</div></div>
</div>

## Our sponsors

<div class="sp-panel">
<!-- sponsors:begin -->
<div class="sp-showcase">
  node-cron doesn't have sponsors yet. Yours could be the first logo here.
</div>
<!-- sponsors:end -->
</div>

## What your sponsorship funds

<div class="sp-funds">
  <div class="sp-card">
    <strong>Correct scheduling through DST and timezones.</strong>
    <p>A <code>0 3 * * *</code> job fires once at 3am local, every day, including the two days a year the clock jumps. node-cron never fires twice for the same instant, never fires into a spring-forward gap, and handles 30-minute DST zones, not just the US case. Keeping those guarantees verified against changing timezone data is constant work.</p>
  </div>
  <div class="sp-card">
    <strong>One run across your whole fleet.</strong>
    <p>Scale to four pods and a naive cron runs your nightly backup four times. <code>distributed: true</code> fires the job on exactly one instance per scheduled time, with a zero-dependency default or a Redis coordinator for high availability, and it fails loudly on deploy rather than silently at 3am.</p>
  </div>
  <div class="sp-card">
    <strong>You find out when a job breaks.</strong>
    <p>Ten lifecycle events (started, finished, failed, missed, overlap, skipped) mean you are never guessing whether last night's job ran. Runs missed to blocking I/O or a busy event loop are detected and surfaced, not swallowed.</p>
  </div>
  <div class="sp-card">
    <strong>Heavy jobs that don't freeze your app.</strong>
    <p>Move a CPU-bound or long-running job into an isolated forked process with a single line, and it never blocks your main event loop, while keeping the same lifecycle and events across the process boundary.</p>
  </div>
</div>

## Tiers

| Tier | Monthly | What you get |
| --- | --- | --- |
| **Gold** | $50 | Large logo at the top of the README, docs, and this page. Visible to developers across 220,000+ dependent repositories. The most visible way to support the project. |
| **Silver** | $25 | Logo in the README and on this page, seen by developers in the 220,000+ repositories that already depend on node-cron. |
| **Bronze** | $10 | Your logo and link on this page. A meaningful presence that helps keep the library tested and at zero dependencies. |
| **Backer** | $5 | Your name and link in the backers list. Every bit adds up to the hours that keep the library tested and at zero dependencies. |

<div class="sp-ctabar">
  <div class="copy">
    <p><strong>Does node-cron help your team?</strong> Sponsoring helps keep it maintained, tested, and dependency-free for the years ahead. Every tier makes a difference.</p>
    <p class="sub">Companies and individuals are equally welcome, from $5 a month.</p>
  </div>
  <span class="sp-btns">
    <a class="sp-btn" href="https://github.com/sponsors/node-cron">GitHub Sponsors →</a>
    <a class="sp-btn ghost" href="https://opencollective.com/node-cron">Open Collective →</a>
  </span>
</div>

Sponsor through [GitHub Sponsors](https://github.com/sponsors/node-cron) or [Open Collective](https://opencollective.com/node-cron). This page updates automatically from both.
