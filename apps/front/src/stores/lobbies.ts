import { UseFetchReturn } from '@vueuse/core';
import { defineStore } from 'pinia';
import { useApi } from 'src/utils/api';
import { useAuthStore } from './auth.store';
import { LoadingBar } from 'quasar';

type Lobby = {
  id: number;
  name: string;
  players: Map<string, object>;
  playersMax: number;
  spectators: Array<any>;
  spectatorsMax: number;
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
      const { data } = await useApi<Lobby[]>('pong/lobbies').get().json();
      console.log('Lobbies fetched', data.value, this.lobbies);
      this.lobbies = data.value || [];
    },
    async createLobby(lobbyName: string) {
      const { socket, getIsConnected } = useAuthStore();
      console.log('I will create a room');
      if (!getIsConnected) {
        console.log('Socket not connected', socket);
        return;
      }
      socket?.emit('createLobby', { name: lobbyName });
      console.log('Emited');
    },
    async joinLobby(lobbyId: number) {
      const { socket, getIsConnected } = useAuthStore();
      console.log('I will join room', lobbyId);
      if (!getIsConnected) {
        console.log('Socket not connected', socket);
        return;
      }
      socket?.emit('joinLobby', lobbyId);
      console.log('Emited');
    },
  },
});
