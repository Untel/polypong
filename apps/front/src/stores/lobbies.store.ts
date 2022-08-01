/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobbies.store.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:06 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/01 17:43:54 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { UseFetchReturn } from '@vueuse/core';
import { defineStore } from 'pinia';
import { useApi } from 'src/utils/api';
import { useAuthStore } from './auth.store';
import { LoadingBar, Notify } from 'quasar';
import { mande } from 'mande';
import router from 'src/router';

export const lobbiesApi = mande(`/api/lobbies`);

export type Lobby = {
  id: number;
  name: string;
  players: Array<any>;
  playersMax: number;
  spectators: Array<any>;
  spectatorsMax: number;
  description: string;
  isPrivate?: boolean;
  host: {
    user: {
      avatar: string,
      name: string,
      id: number,
    }
  }
};

type LobbiesState = {
  lobbies: Lobby[],
  activeLobby: Lobby | null,
};

export const onlineApi = mande(`/api/online`);


export const useLobbiesStore = defineStore('lobbies', {
  state: () => ({
    lobbies: [],
    activeLobby: null
  } as LobbiesState),
  getters: {
    getLobbies: (state) => state.lobbies,
    getActiveLobby: (state) => state.activeLobby,
  },
  actions: {
    async fetchLobbies() {
      try {
        this.lobbies = await lobbiesApi.get('');
      } catch (err) {
        console.log("err", err);
        Notify.create({
          type: 'negative',
          message: 'Error while fetching lobbies',
        });
      }
    },
    async fetchAndJoinLobby(lobbyId: number | string): Promise<Lobby> {
      const lobby = await lobbiesApi.get(`${lobbyId}/join`);
      return lobby;
    },
    async createLobby(lobbyName: string) {
      try {
        const newLobby: Lobby = await lobbiesApi.post('', {
          name: lobbyName,
        });
        return newLobby;
      } catch (err) {
        console.log("err", err);
        Notify.create({
          type: 'negative',
          message: "Error while creating lobby",
        });
        return null;
      }
    },
    async updateLobby(lobbyId: number, lobby: Lobby) {
      try {
        const newLobby: Lobby = await lobbiesApi.put(`/${lobbyId}`, { name: 'haha' });
        return newLobby;
      } catch (err) {
        console.log("err", err);
        Notify.create({
          type: 'negative',
          message: "Error while updating lobby",
        });
        return null;
      }
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
