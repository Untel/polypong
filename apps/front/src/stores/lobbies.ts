import { UseFetchReturn } from '@vueuse/core';
import { defineStore } from 'pinia';
import { useApi } from 'src/utils/api';
import { useAuthStore } from './auth';
import { LoadingBar } from 'quasar';

type Lobby = {
  roomId: string,
};

type LobbiesState = {
  lobbies: Lobby[],
};

export const useLobbiesStore = defineStore('lobbies', {
  state: () => ({
    lobbies: [],
  } as LobbiesState),
  getters: {
    getLobbies: (state) => state.lobbies,
  },
  actions: {
    async fetchLobbies() {
      // LoadingBar.start();
      const { data, error } = await useApi<Lobby[]>('pong/lobbies').get().json();
      // LoadingBar.stop();
      // this.fetchingLobbies = false;
      console.log('Lobbies fetched', data.value, this.lobbies);
      this.lobbies = data.value || [];
    },
    async createLobby() {
      const { socket, getIsConnected } = useAuthStore();
      console.log('I will create a room');
      if (!getIsConnected) {
        console.log('Socket not connected', socket);
        return ;
      }
      socket?.emit('createLobby');
      console.log('Emited');
    },
  },
});
