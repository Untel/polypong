import { UseFetchReturn } from '@vueuse/core';
import { defineStore } from 'pinia';
import { useApi } from 'src/utils/api';
import { useAuthStore } from './auth';

type Lobby = {
  roomId: string,
};

type LobbiesState = {
  fetchingLobbies: boolean,
  lobbies: Lobby[],
};

export const useLobbiesStore = defineStore('lobbies', {
  state: () => ({
    fetchingLobbies: false,
    lobbies: [],
  } as LobbiesState),
  getters: {
    getLobbies: (state) => state.lobbies,
  },
  actions: {
    async fetchLobbies() {
      this.fetchingLobbies = true;
      const { data, error } = await useApi<Lobby[]>('pong/lobbies');
      this.fetchingLobbies = false;
      this.lobbies = data.value || [];
      console.log('Lobbies fetched', this.lobbies);
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
