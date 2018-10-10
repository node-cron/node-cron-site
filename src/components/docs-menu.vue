<template>
        <ul class="docs-menu">
            <li>
                <a href="/docs#getting-started">Getting Started</a>
            </li>
            <li>
                <a href="/docs#cron-syntax">Cron Syntax</a>
            </li>
        </ul>
</template>

<style lang="scss">
    .docs-menu {
        background-color: #f3f3f3;
        border-radius: 5px;
        
        li {
            list-style: none;          
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
    }
</style>
