<template>
    <page-layout>
        <container>
            <div>
                <h1>Documentation</h1>
                <p>
                    The node-cron module is tiny task scheduler in pure JavaScript for node.js 
                    based on GNU crontab. This module allows you to schedule task in node.js using 
                    full crontab syntax.
                </p>
                <getting-started></getting-started>
                <cron-syntax></cron-syntax>
            </div>  
        </container>
    </page-layout>
</template>

<script>
import PageLayout from '../layouts/page-layout.vue';
import Container from '../components/container.vue';


import GettingStarted from './docs-pages/getting-started.vue';
import CronSyntax from './docs-pages/cron-syntax.vue';


export default {
  components: {
    PageLayout,
    Container,
    GettingStarted,
    CronSyntax
  }
}
</script>

<style lang="scss">
    .docs-container {
        display: flex;
        flex-direction: row;
    }

    .docs-content-container {
        width: 100%;
    }

    .docs-menu-container {
        min-width: 30%;
        margin-top: 110px;
        margin-right: 30px;
    }
</style>
