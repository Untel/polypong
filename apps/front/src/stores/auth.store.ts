/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.store.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/28 21:53:26 by adda-sil          #+#    #+#             */
/*   Updated: 2022/06/12 03:39:58 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { defineStore } from 'pinia';
import { useQuasar, Notify } from 'quasar';

import { io, Socket } from 'socket.io-client';
import { CoalitionChoice } from 'src/types';
import { mande, defaults, MandeError } from 'mande';
import { useApi } from 'src/utils/api';

export const authApi = mande(`/api/auth`);

type AuthState = {
  socket?: Socket | null,
  user: unknown,
}

const SOCKET_BASE_URL = `ws://${process.env.DOMAIN_NAME || 'localhost:9999'}`;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    socket: null,
  } as AuthState),
  getters: {
    getIsConnected: (state) => state.socket && state.socket.connected,
  },
  actions: {
    connectToSocket() {
      this.socket = io(SOCKET_BASE_URL, {
        path: '/socket',
        transports: ['websocket'],
        // withCredentials: true,
        extraHeaders: {
          'Authorization': `Bearer ${this.user.token}`,
          'yolo': 'ahah'
        }
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
    async whoAmI(callback) {
      defaults.headers.Authorization = 'Bearer ' + localStorage.getItem('token');
      this.user = await authApi.get('user', callback);
    },
  },
});
