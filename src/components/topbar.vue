<template>
        <div class="menu">
            <container>
                <div class="menu-items">
                    <div class="brand">
                        <router-link to="/">
                            <img src="/img/logo.png"/>
                            <span class="name">node-cron</span>
                        </router-link>
                    </div>
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
        line-height: 80px;
        color: #6d6d6d;
        background-color: #f1f1f1;
        min-width: 300px;
        padding-top: 10px;
        padding-bottom: 10px;
        
        a {
            text-decoration: none;
        }

        .menu-items {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            
            .brand {
                // width: 300px;
                flex: 0 0 auto;
                
                .name {
                    font-size: 35px;
                    color: #6d6d6d;
                }


                img {
                    height: 80px;
                    vertical-align: top;
                }
            }


            .links {
                margin-left: 20px;
                flex: 1 1 auto;
                display: flex;
                justify-content: flex-end;
                align-items: center;

                a {
                    line-height: 40px;
                    height: 40px;
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
    }
</style>
