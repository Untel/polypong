import { RouteRecordRaw } from 'vue-router';
// import PongPage from 'pages/PongPage.vue';
import AuthGuard from './auth.guard';
import MinimalLayout from 'src/layouts/MinimalLayout.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'base',
    component: MinimalLayout,
    children: [{
      path: 'auth',
      name: 'auth',
      component: () => import('src/layouts/AuthLayout.vue'),
      children: [
        { name: 'login', path: '', component: () => import('pages/LoginPage.vue') },
        { name: 'signup', path: 'signup', component: () => import('pages/SignupPage.vue') },
      ],
    }, {
      path: '',
      beforeEnter: AuthGuard,
      name: 'logged',
      component: () => import('layouts/MainLayout.vue'),
      children: [
        { name: 'home', path: '', component: () => import('pages/IndexPage.vue') },
        { name: 'game', path: 'game', component: () => import('components/Game.vue') },
        { name: 'coalitions', path: 'coalitions', component: () => import('pages/CoalitionsPage.vue') },
        { name: 'profile', path: 'profile', component: () => import('pages/ProfilePage.vue') },
        { name: 'lobbies', path: 'lobbies', component: () => import('pages/LobbiesPage.vue') },
        {
          name: 'lobby', path: 'lobby/:id', props: true, component: () => import('pages/LobbyPage.vue'),
        },
      ],
    }, {
      path: '/:catchAll(.*)*',
      name: '404',
      component: () => import('pages/ErrorNotFound.vue'),
    },
    ],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/external',
    name: 'external',
    component: () => import('pages/LoginPage.vue'),
    beforeEnter(to, from, next) {
      const url: string = to.query.url as string;
      const wantTo = confirm(`You are about to leave polypong to go to ${url}, are you sur?`);
      if (wantTo) { window.location.href = url; }
    },
  },
];

export default routes;
