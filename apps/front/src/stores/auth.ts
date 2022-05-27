import { defineStore } from 'pinia';

import { io, Socket, } from "socket.io-client";
import { CoalitionChoice } from 'src/types';
import { useApi } from 'src/utils/api';

type AuthState = {
  socket?: Socket | null,
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    socket: null,
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
      console.log('Connecting to socket', this.socket);
      this.socket.emit('msgToServer', 'yolo');
    },
    async login(email: string, password: string) {
      const { data, error } = await useApi('auth/login');
      console.log('Res is ', data.value, error.value);
    },
    async register(name: string, email: string, password: string, coalition: CoalitionChoice) {
      const { data, error } = await useApi('auth/register').post({
        name,
        email,
        password,
        coalition,
      });
      console.log('Res is ', data.value, error.value);
    },
  },
});
