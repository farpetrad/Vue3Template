﻿import Vue from 'vue';
import VueRouter from 'vue-router';

import Home from 'views/Home';

Vue.use(VueRouter);


export default new VueRouter({
  mode: 'history',
    routes: [
        {
            path: '/',
            props: false,
            name: 'Home',
            component: Home,
        },
        {
            path: '/about',
            props: false,
            name: 'About',
            component: () => import (/*webpackChunkName: "about" */ 'views/About'),
        }
    ],
});
