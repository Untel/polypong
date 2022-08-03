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

type SocialState = {
  relationships: Relationship[],
}

export const useSocialStore = defineStore('social', {
  state: () => ({
    relationships: {},
    error: {},
  } as SocialState),
  getters: {
    getRelationships: (state) => state.relationships,
  },
  actions: {
    connectToSocket() {
      return new Promise((resolve, reject) => {
        this.socket = io(SOCKET_BASE_URL, {
          path: '/socket',
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
