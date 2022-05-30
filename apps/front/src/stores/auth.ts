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
import { mande, defaults } from 'mande';
import { useStorage } from '@vueuse/core';
import axios from 'axios';

process.env.API_URL = 'http://localhost:3000';
export const authApi = mande(`${process.env.API_URL}/api/auth`);

type AuthState = {
  socket?: Socket | null,
  token: string,
  user: unknown,
}
defaults.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    socket: null,
    token: useStorage('token', null),
  } as AuthState),
  getters: {
    getIsConnected: (state) => state.socket && state.socket.connected,
  },
  actions: {
    connectToSocket() {
      this.socket = io('localhost:3000', {
        transports: ['websocket'],
        withCredentials: true,
      });
      // this.socket.emit('msgToServer', 'yolo');
    },
    async login(email: string, password: string) {
      try {
        // const res = await authApi.post<any>('login', { email, password });
        // defaults.headers.Authorization = `Bearer ${token}`;
        await axios.post(
          `${process.env.API_URL}/auth/login`,
          { email, password },
          { withCredentials: true },
        );
        await axios.get(
          `${process.env.API_URL}/auth/user`,
          { withCredentials: true },
        );
        return (token);
      } catch (error) {
        console.log('Error is', error);
        Notify.create({
          type: 'negative',
          message: 'Cannot connect',
        });
        return false;
      }
    },
    async register(name: string, email: string, password: string, coalition: CoalitionChoice) {
      try {
        const { data, error } = await authApi.post('register', {
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
    },
    async whoAmI() {
      try {
        const resp = await authApi.get('user');
        console.log('Resp', resp);
      } catch (error) {
        console.log('Resp', error);
      }
    },
  },
});
