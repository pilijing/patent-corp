import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Home from '../views/base/home.vue';
import Routes from './route';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    // name: 'Home',
    component: Home,
    children: Routes,
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/base/login.vue'),
  },
  {
    path: '*',
    name: 'notFound',
    component: () => import('@/views/base/not-found.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
