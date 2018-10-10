import Vue from 'vue'
import VueRouter from 'vue-router';
import App from './App.vue'
import Home from './pages/home.vue';
import Docs from './pages/docs.vue';

import './styles/base.scss';
import './img/favicon-16x16.png';
import './img/favicon-32x32.png';

Vue.use(VueRouter)

const routes = [
    { 
        path: '/', 
        component: Home 
    },
    { 
        path: '/docs', 
        component: Docs
    }
];

const router = new VueRouter({
    routes,
    mode: 'history'
});

new Vue({
    el: '[data-app]',
    router,
    render: h => h(App),
    mounted () {
        document.dispatchEvent(new Event('render-event'));
    }
})