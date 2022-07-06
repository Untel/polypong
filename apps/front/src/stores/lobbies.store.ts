/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobbies.store.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:06 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/06 17:07:51 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { UseFetchReturn } from '@vueuse/core';
import { defineStore } from 'pinia';
import { useApi } from 'src/utils/api';
import { useAuthStore } from './auth.store';
import { LoadingBar, Notify } from 'quasar';

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
      const { data, error } = await useApi<Lobby[]>('lobbies').get().json();

      if (!error) {
        console.log('Lobbies fetched', data.value, this.lobbies);
        this.lobbies = data.value || [];
      } else {
        Notify.create({
          type: 'negative',
          message: "Error while fetching lobbies"
        });
      }
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
