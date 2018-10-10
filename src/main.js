import Vue from 'vue'
import VueRouter from 'vue-router';
import Home from './pages/home.vue';
import Docs from './pages/docs.vue';

import './styles/base.scss';
import './img/favicon-16x16.png';
import './img/favicon-32x32.png';

Vue.use(VueRouter)

const routes = [
    { path: '/', component: Home },
    { 
        path: '/docs', 
        component: Docs
    }
];

const router = new VueRouter({
    mode: 'history',
    routes
});

new Vue({
    router,
    mounted () {
        document.dispatchEvent(new Event('render-event'));
    }
}).$mount('#app')