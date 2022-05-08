import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MinimalLayout.vue'),
    children: [{
      path: '', component: () => import('layouts/MainLayout.vue'), children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { name: 'game', path: 'game', component: () => import('components/Game.vue') },
      { name: 'coalitions', path: 'coalitions', component: () => import('pages/CoalitionsPage.vue') },
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
