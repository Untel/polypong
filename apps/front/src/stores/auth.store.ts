/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.store.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/28 21:53:26 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/09 20:23:13 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { defineStore } from 'pinia';
import { useQuasar, Notify } from 'quasar';

import { io, Socket } from 'socket.io-client';
import { CoalitionChoice } from 'src/types';
import { mande, defaults, MandeError } from 'mande';
import { useApi } from 'src/utils/api';
import { User } from 'src/types/user';

export const authApi = mande(`/api/auth`);

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
  } as AuthState),
  getters: {
    getIsConnected: (state) => state.socket && state.socket.connected,
    getConnectedUsers: (state) => state.connectedUsers,
  },
  actions: {
    connectToSocket() {
      this.socket = io(SOCKET_BASE_URL, {
        path: '/socket',
        transports: ['websocket'],
        // withCredentials: true,
        extraHeaders: {
          'Authorization': `Bearer ${this.user.token}`,
        }
      });

      this.socket.on('connectedUsers', (users) => {
        console.log("New connected users", users);
        this.connectedUsers = users;
      })
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
      defaults.headers.Authorization = 'Bearer ' + localStorage.getItem('token');
      this.user = await authApi.get('user');
    },

    async fetchConnectedUsers() {
      this.connectedUsers = await authApi.get('connectedUsers');
    },
  },
});
