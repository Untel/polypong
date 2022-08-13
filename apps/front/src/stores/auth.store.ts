/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.store.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/28 21:53:26 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/13 20:39:12 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { defineStore, Pinia } from 'pinia';
import { Notify } from 'quasar';

import { io, Socket } from 'socket.io-client';
import { CoalitionChoice } from 'src/types';
import { mande, defaults, MandeError } from 'mande';
import { User } from 'src/types/user';
import router from 'src/router';
import { NavigationGuardNext, Router } from 'vue-router';

export const authApi = mande('/api/auth');
export const twoFactorApi = mande('/api/2fa');
export const onlineApi = mande('/api/online');
export const userApi = mande('/api/user');

type AuthState = {
  socket?: Socket | null,
  user: any,
  connectedUsers: User[],
}

// const SOCKET_BASE_URL = `ws://${process.env.DOMAIN_NAME || window.location.host}`;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: {},
    socket: null,
    connectedUsers: [],
    error: {},
  } as AuthState),
  getters: {
    getIsConnected: (state) => state.socket && state.socket.connected,
    getConnectedUsers: (state) => state.connectedUsers,
    getUser: (state) => state.user,
  },
  actions: {
    connectToSocket() {
      return new Promise((resolve, reject) => {
        this.socket = io({
          path: '/polysocket', // resolved via reverse proxy
          transports: ['websocket'],
          withCredentials: true,
          auth: { token: `${localStorage.getItem('token')}` },
        });
        this.socket.once('connect_error', (err) => {
          console.log('Socket connect error', err);
          Notify.create({
            type: 'negative',
            message: `Connection to socket error: ${err.message}`,
          });
          localStorage.removeItem('token');
          this.socket?.off('connect');
          reject();
        });
        this.socket.once('connect', () => {
          this.socket?.off('connect_error');
          resolve(true);
        });
        this.socket.on('online', ({ name, type }) => {
          Notify.create({
            message: `${name} just is now ${
              type === 'connect' ? 'connected' : 'disconnected'
            }`,
          });
          this.fetchConnectedUsers();
        });
        this.socket.on('message', (message) => {
          Notify.create({
            group: 'spam',
            message: `Server say ${message}`,
          });
        });
        this.socket.on('redirect', (url) => {
          Notify.create({
            message: 'You have an active lobby, rejoin it',
            actions: [{
              label: 'go',
              color: 'danger',
              handler: () => {
                this.router.push(url);
              },
            }],
          });
        });
      });
    },
    async login(email: string, password: string) {
      this.user = await authApi.post('login', { email, password });
      localStorage.setItem('token', this.user.token);
      return this.user;
    },
    async register(name: string, email: string, password: string, coalition: CoalitionChoice) {
      this.user = await authApi.post('register', {
        name,
        email,
        password,
        coalition,
      });
      localStorage.setItem('token', this.user.token);
      return this.user;
    },
    async whoAmI() {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token, no need to query the api');
      }
      defaults.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
      this.user = await userApi.get('user');
    },

    async fetchConnectedUsers() {
      this.connectedUsers = await onlineApi.get('/');
    },

    async updateUser(properties: any) {
      console.log(`in authStore - updateUser - user.id = ${this.user.id} , properties = ${JSON.stringify(properties)}`);
      const res = await userApi.put(`/${this.user.id}`, {
        ...properties,
      });
      console.log(`in authStore - updateUser - res = ${JSON.stringify(res)}`);
      this.user = res.user;
    },

    async fetchUser() {
      let res;
      try {
        res = await userApi.get('user');
      } catch (error) {
        console.log(error); return;
      }
      this.user = res;
    },

    async requestQrCode() {
      let res = null;
      try {
        res = await twoFactorApi.get('generate');
        console.log(`authStore - requestQrCode - res = ${res}`);
      } catch (error) {
        console.log(error);
      }
      return res;
    },

    async activate2fa(decodedValue: number) {
      console.log(`authStore - activate2fa - decodedValue = ${decodedValue}`);
      let res = null;
      res = await twoFactorApi.post('activate', {
        twoFactorAuthenticationCode: decodedValue,
      });
      console.log(`authStore - activate2fa - res = ${res}`);
      return res;
    },

    async authenticateCode(value: number) {
      console.log(`authStore - authenticateCode = ${value}`);
      let res = null;
      res = await twoFactorApi.post('authenticate', {
        twoFactorAuthenticationCode: value,
      });
      console.log('authStore - authenticateCode - res = ', res);
      console.log('authStore - authenticateCode - res.token = ', res.token);
      localStorage.setItem('token', res.token);
    },

  },
});
