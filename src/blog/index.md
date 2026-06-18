---
title: Blog
description: Release notes, deep dives, and positioning for node-cron, the lightweight task scheduler for Node.js. Distributed scheduling, NestJS, and more.
sidebar: false
aside: false
---

<script setup>
import { data as posts } from './posts.data.mts'
</script>

# Blog

Deep dives and release stories behind node-cron, what shipped, why, and what it unlocks.

<ul class="blog-index">
  <li v-for="post of posts" :key="post.url">
    <a :href="post.url">{{ post.title }}</a>
    <div class="blog-meta">{{ post.displayDate }}</div>
    <p>{{ post.description }}</p>
  </li>
</ul>

<style scoped>
.blog-index { list-style: none; padding: 0; }
.blog-index li { margin: 0 0 1.75rem; }
.blog-index a { font-size: 1.2rem; font-weight: 600; }
.blog-meta { color: var(--vp-c-text-2); font-size: 0.85rem; margin: 0.15rem 0 0.35rem; }
.blog-index p { margin: 0; color: var(--vp-c-text-2); }
</style>
