/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/28 21:53:26 by adda-sil          #+#    #+#             */
/*   Updated: 2022/05/28 23:26:54 by adda-sil         ###   ########.fr       */
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
      this.socket = io('localhost:9999', {
        path: '/socket',
        transports: ['websocket'],
        withCredentials: true,
      });
    },
    login(email: string, password: string): MandeError | any {
      return authApi.post('login', { email, password });
    },
    async register(name: string, email: string, password: string, coalition: CoalitionChoice) {
      try {
        await authApi.post('register', {
          name,
          email,
          password,
          coalition,
        });
      } catch (error: any) {
        console.error('Register error', error);
        Notify.create({
          type: 'negative',
          message: error.value.message.reduce((a: string, n: string) => `${a}\n${n}`, ''),
        });
      }
      return Promise.resolve();
    },
    async whoAmI(callback) {
      this.user = await authApi.get('user', callback);
    },
  },
});
