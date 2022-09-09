/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   routes.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:13 by adda-sil          #+#    #+#             */
/*   Updated: 2022/09/09 03:14:51 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
  RouteRecordRaw,
} from 'vue-router';
import { LoadingBar, Notify } from 'quasar';
import MinimalLayout from 'src/layouts/MinimalLayout.vue';
// import CopyrightFooter from 'src/components/CopyrightFooter.vue';
import { useThreadStore } from 'src/stores/thread.store';
import { MandeError } from 'src/libs/mande';
import AuthGuard from './auth.guard';

const authRoutes: RouteRecordRaw[] = [{
  name: 'home',
  path: '',
  component: () => import('pages/LobbiesPage.vue'),
  // component: () => import('pages/IndexPage.vue'),
}, {
  name: 'coalitions',
  path: 'coalitions',
  component: () => import('pages/CoalitionsPage.vue'),
}, {
  name: 'lobbies',
  path: 'lobbies',
  component: () => import('pages/LobbiesPage.vue'),
}, {
  name: 'lobby',
  path: 'lobby/:id',
  props: true,
  component: () => import('pages/LobbyPage.vue'),
}, {
  name: 'game',
  path: 'lobby/:id/game',
  props: true,
  component: () => import('pages/GamePage.vue'),
}, {
  name: 'users',
  path: 'users',
  component: () => import('pages/UsersPage.vue'),
}, {
  name: 'profile',
  path: 'profile/:userId?',
  props: true,
  component: () => import('pages/HistoryPage.vue'),
}, {
  name: 'settings',
  path: 'settings',
  component: () => import('pages/SettingsPage.vue'),
},
{
  name: 'inbox',
  path: 'inbox',
  props: true,
  component: () => import('pages/InboxPage.vue'),
  children: [{
    name: 'channels',
    path: '',
    component: () => import('pages/ChannelsPage.vue'),
  }, {
    name: 'thread',
    path: ':id',
    component: () => import('pages/ThreadPage.vue'),
  }],
},
{
  name: 'chat',
  path: 'chat/:userId',
  props: true,
  component: () => import('pages/InboxPage.vue'),
  async beforeEnter(to, from, next) {
    const { userId } = to.params;
    //    console.log('in guard, userId = ', userId);
    const $thread = useThreadStore();
    try {
      const res = await $thread.getDmThreadByUserId(+userId);
      if (res) {
        $thread.fetchThreads();
        LoadingBar.stop();
        return next(`/inbox/${res?.id}`);
      }
      throw new Error('wut');
    } catch (e) {
      LoadingBar.stop();
      return next(false);
    }
  },
},
];

const routes: RouteRecordRaw[] = [{
  path: '/',
  name: 'base',
  components: { default: MinimalLayout },
  children: [{
    path: 'auth',
    name: 'auth',
    components: { default: () => import('src/layouts/AuthLayout.vue') },
    children: [{
      name: 'login',
      path: '',
      component: () => import('pages/LoginPage.vue'),
    },
    {
      name: 'signup',
      path: 'signup',
      component: () => import('pages/SignupPage.vue'),
    },
    {
      name: '2fa',
      path: 'twofactor',
      component: () => import('pages/TwoFactor.vue'),
    }],
  }, {
    path: '',
    beforeEnter: AuthGuard,
    name: 'logged',
    component: () => import('layouts/MainLayout.vue'),
    children: authRoutes,
  }, {
    path: '/:catchAll(.*)*',
    name: '404',
    component: () => import('pages/ErrorNotFound.vue'),
  },
  ],
}, {
  path: '/external',
  name: 'external',
  component: () => import('pages/LoginPage.vue'),
  beforeEnter(to, from, next) {
    const url: string = to.query.url as string;
    // eslint-disable-next-line no-restricted-globals, no-alert
    const wantTo = confirm(`You are about to leave polypong to go to ${url}, are you sur?`);
    if (wantTo) {
      window.open(url, '_blank');
    }
    next(false);
  },
}];

export default routes;
