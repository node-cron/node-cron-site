import Vue from 'vue'
import VueRouter from 'vue-router';
import Home from './pages/home.vue'

import './styles/base.scss';
import './img/favicon-16x16.png';
import './img/favicon-32x32.png';

Vue.use(VueRouter)

const routes = [
    { path: '/', component: Home }
];

const router = new VueRouter({
    routes
});

const app = new Vue({
    router
}).$mount('#app')