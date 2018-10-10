<template>
    <page-layout>
        <container>
            <div class="docs-container">
                <div class="docs-menu-container">
                    <div class="docs-menu-menu">
                        <docs-menu></docs-menu>
                    </div>
                </div>
                <div class="docs-content-container">
                    <h1>Documentation</h1>
                    <p>
                        The node-cron module is tiny task scheduler in pure JavaScript for node.js 
                        based on GNU crontab. This module allows you to schedule task in node.js using 
                        full crontab syntax.
                    </p>
                    <getting-started id="getting-started"></getting-started>
                    <cron-syntax id="cron-syntax"></cron-syntax>
                </div>  
            </div>
        </container>
    </page-layout>
</template>

<script>
import PageLayout from '../layouts/page-layout.vue';
import Container from '../components/container.vue';
import DocsMenu from '../components/docs-menu.vue';

import GettingStarted from './docs-pages/getting-started.vue';
import CronSyntax from './docs-pages/cron-syntax.vue';


export default {
  components: {
    PageLayout,
    Container,
    DocsMenu,
    GettingStarted,
    CronSyntax
  }
}
</script>

<style lang="scss">
    .docs-container {
        display: flex;
         flex-direction: row;
        @media screen and (max-width: 850px){
            flex-direction: column;
        }
        
        .docs-menu-container {
            flex: 1 1 auto;
            min-width: 200px;
            margin-top: 50px;
            .docs-menu-menu{
                position: -webkit-sticky;
                position: sticky;
                top: 20px;
            }
        }
        .docs-content-container{
            flex: 1 1 auto;
            @media screen and (min-width: 850px){
                margin-left: 30px;
            }
        }
        
    }

    
</style>
