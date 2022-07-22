/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.store.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/28 21:53:26 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/11 02:24:41 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { defineStore } from 'pinia';
import { useQuasar, Notify } from 'quasar';

import { io, Socket } from 'socket.io-client';
import { CoalitionChoice } from 'src/types';
import { mande, defaults, MandeError } from 'mande';
import { useApi } from 'src/utils/api';
import { User } from 'src/types/user';

export const authApi = mande('/api/auth');
export const onlineApi = mande('/api/online');
export const userApi = mande('/api/user');

type AuthState = {
  socket?: Socket | null,
  user: any,
  connectedUsers: User[],
}

const SOCKET_BASE_URL = `ws://${process.env.DOMAIN_NAME || 'localhost:9999'}`;

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
      this.socket = io(SOCKET_BASE_URL, {
        path: '/socket',
        transports: ['websocket'],
        withCredentials: true,
        auth: { token: `${this.user.token}` },
      });

      this.socket.on('online', ({ name, type }) => {
        Notify.create({
          message: `${name} just is now ${
            type === 'connect' ? 'connected' : 'disconnected'
          }`,
        });
        this.fetchConnectedUsers();
      });
      console.log(this.socket);
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
      this.user = await authApi.get('user');
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

  },
});
