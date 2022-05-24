import { defineStore } from 'pinia';

import { io, Socket,  } from "socket.io-client";

type AuthState = {
  socket?: Socket | null
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
  },
});
