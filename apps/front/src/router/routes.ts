import { RouteRecordRaw } from 'vue-router';
import PongPage from 'pages/PongPage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MinimalLayout.vue'),
    children: [{
      path: '', component: () => import('layouts/MainLayout.vue'), children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { name: 'game', path: 'game', component: () => import('components/Game.vue') },
      { name: 'coalitions', path: 'coalitions', component: () => import('pages/CoalitionsPage.vue') },
      // { name: 'pong', path: 'pong', component: () => import('pages/PongPage.vue') },
      { name: 'pong', path: 'pong', component: PongPage },
      ]
    }, {
      path: 'login',
      name: 'login',
      component: () => import('pages/LoginPage.vue'),
    },],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
