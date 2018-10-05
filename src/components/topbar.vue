<template>
        <div class="menu">
            <container>
                <div>
                    <router-link to="/">
                        <img src="/img/logo.png"/>
                        <span class="name">node-cron</span>
                    </router-link>
                    <div class="links">
                        <router-link to="/docs">Docs</router-link>
                        <a href="https://github.com/node-cron/node-cron" target="_blank">Github</a>
                    </div>
                </div>
             </container>
        </div>
</template>

<script>
import logo from '../img/logo.png';
import Container from './container.vue';
export default {   
    components: {
        Container
    }
}
</script>

<style lang="scss">
    .menu {
        height: 80px;
        line-height: 80px;
        color: #6d6d6d;
        padding-top: 20px;
        padding-bottom: 20px;
        background-color: #f1f1f1;

        a {
            text-decoration: none;
        }

        .name {
            font-size: 35px;
            color: #6d6d6d;
        }

        img {
            height: 80px;
            display: inline-block;
            vertical-align: top;
        }

        .links {
            margin-top: 6px;
            float: right;
            a {
                padding-top: 10px;
                padding-bottom: 10px;
                padding-left: 20px;
                padding-right: 20px;
                border-radius: 5px;
                color: #6d6d6d;
                text-decoration: none;
                &:hover {
                    background-color: #dfdfdf;
                }
                &:active {
                     background-color: #e1e1e1;
                }
            }
        }
    }
</style>
