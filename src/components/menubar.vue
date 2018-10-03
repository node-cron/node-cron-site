<template>
        <div class="menu">
            <container>
                <div>
                    <img src="/img/logo.png"/>
                    <span class="name">node-cron</span>
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
        margin-bottom: 30px;
        padding-top: 20px;
        padding-bottom: 20px;

        .name {
            font-size: 35px;
        }

        img {
            height: 80px;
            display: inline-block;
            vertical-align: top;
        }
    }
</style>
