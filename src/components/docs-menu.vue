<template>
        <div class="docs-menu">
            <router-link to="/docs/getting-started">Getting Started</router-link>
            <router-link to="/docs/cron-syntax">Cron Syntax</router-link>
        </div>
</template>

<style lang="scss">
    .docs-menu {
        background-color: #f3f3f3;
        border-radius: 5px;
        a {
            text-decoration: none;
            color: #006D00;
            text-indent: 20px;
            line-height: 40px;
            display: block;
            width: 100%;
            &:hover {
                background-color: #ededed;
            }
        }
    }
</style>
