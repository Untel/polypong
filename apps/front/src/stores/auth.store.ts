/* eslint-disable no-underscore-dangle */
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.store.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/28 21:53:26 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/15 02:23:21 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { defineStore } from 'pinia';
import { Notify } from 'quasar';
import { io, Socket } from 'socket.io-client';
import { CoalitionChoice } from 'src/types';
import { mande, defaults } from 'src/libs/mande';
import { User } from 'src/types/user';
import { onError } from 'src/utils/mande-error';
import { useThreadStore } from './thread.store';

export const authApi = mande('/api/auth', { onError });
export const twoFactorApi = mande('/api/2fa', { onError });
export const onlineApi = mande('/api/online', { onError });
export const userApi = mande('/api/user', { onError });

export interface UserCon extends User {
  status: 'online' | 'ingame' | 'inlobby';
}

type AuthState = {
  socket: Socket,
  user: User,
  connectedUsers: User[],
}

// const SOCKET_BASE_URL = `ws://${process.env.DOMAIN_NAME || window.location.host}`;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    socket: io({
      path: '/polysocket', // resolved via reverse proxy
      transports: ['websocket'],
      withCredentials: true,
      autoConnect: false,
    }),
    connectedUsers: [],
  } as AuthState),
  getters: {
    getIsConnected: (state) => state.socket.connected,
    getConnectedUsers: (state) => state.connectedUsers,
    connectedUserMap: (state) => state.connectedUsers
      .reduce((acc: Record<string, UserCon>, user: User) => {
        acc[user.id] = {
          ...user,
          status: user.inGame
            ? 'ingame'
            : user.inLobby
              ? 'inlobby'
              : 'online',
        };
        return acc;
      }, {}),
    getUser: (state) => state.user,
  },
  actions: {
    connectToSocket() {
      this.socket.removeAllListeners();
      this.socket.auth = { token: `${localStorage.getItem('token')}` };
      this.socket.connect();
      return new Promise((resolve, reject) => {
        this.socket.once('connect_error', (err) => {
          Notify.create({
            type: 'negative',
            message: `Connection to socket error: ${err.message}`,
          });
          localStorage.removeItem('token');
          this.socket.off('connect');
          reject();
        });
        this.socket.once('connect', () => {
          this.socket.off('connect_error');
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

        this.socket.on('thread-message', (thread, message) => {
          //          console.log('New socket message', thread, message);
          const $thread = useThreadStore();
          $thread.socketAddMessage(thread, message);
        });
      });
    },
    async login(email: string, password: string) {
      const user = await authApi.post<{ token: string }>('login', { email, password });
      localStorage.setItem('token', user.token);
      return user;
    },
    async register(name: string, email: string, password: string, coalition: CoalitionChoice) {
      const user = await authApi.post<{ token: string }>('register', {
        name,
        email,
        password,
        coalition,
      });
      localStorage.setItem('token', user.token);
      return user;
    },
    async whoAmI() {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token, no need to query the api');
      }
      defaults.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
      const res: User = await authApi.get('/user');
      //      console.log('in whoamI, user = ', res);
      this.user = res;
    },

    async fetchConnectedUsers() {
      this.connectedUsers = await onlineApi.get('/');
    },

    async updateUser(properties: any) {
      const res = await userApi.put<{ user: User }>(`/${this.user.id}`, {
        ...properties,
      });
      this.user = res.user;
    },

    async fetchUser() {
      this.user = await userApi.get('user');
    },

    requestQrCode() {
      return twoFactorApi.get('generate');
    },

    async activate2fa(decodedValue: number) {
      let res = null;
      res = await twoFactorApi.post('activate', {
        twoFactorAuthenticationCode: decodedValue,
      });
      return res;
    },

    async authenticateCode(value: number) {
      let res = null;
      res = await twoFactorApi.post<{ token: string}>('authenticate', {
        twoFactorAuthenticationCode: value,
      });
      localStorage.setItem('token', res.token);
    },

    killws() {
      this.socket.close();
    },

    async searchUsers(term: string) {
      const results = await userApi.get<User[]>('/search', { query: { term } });
      //      console.log('Search results', results);
      return results;
    },
  },
});
