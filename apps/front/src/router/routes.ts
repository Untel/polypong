/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   routes.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:13 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/02 18:04:13 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { RouteRecordRaw } from 'vue-router';
import MinimalLayout from 'src/layouts/MinimalLayout.vue';
import AuthGuard from './auth.guard';

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
        { name: '2fa', path: 'twofactor', component: () => import('pages/TwoFactor.vue') },
      ],
    }, {
      path: '',
      beforeEnter: AuthGuard,
      name: 'logged',
      component: () => import('layouts/MainLayout.vue'),
      children: [
        { name: 'home', path: '', component: () => import('pages/IndexPage.vue') },
        { name: 'coalitions', path: 'coalitions', component: () => import('pages/CoalitionsPage.vue') },
        { name: 'profile', path: 'profile', component: () => import('pages/ProfilePage.vue') },
        { name: 'lobbies', path: 'lobbies', component: () => import('pages/LobbiesPage.vue') },
        {
          name: 'lobby', path: 'lobby/:id', props: true, component: () => import('pages/LobbyPage.vue'),
        },
        {
          name: 'game', path: 'game/:id', props: true, component: () => import('pages/GamePage.vue'),
        },
        {
          name: 'users', path: 'users', props: true, component: () => import('pages/UsersPage.vue'),
        },
        { name: 'settings', path: 'settings', component: () => import('pages/SettingsPage.vue') },
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
    beforeEnter(to) {
      const url: string = to.query.url as string;
      // eslint-disable-next-line no-restricted-globals, no-alert
      const wantTo = confirm(`You are about to leave polypong to go to ${url}, are you sur?`);
      if (wantTo) { window.location.href = url; }
    },
  },
];

export default routes;
