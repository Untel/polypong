/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobbies.store.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:06 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/15 08:50:20 by adda-sil         ###   ########.fr       */
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
};

export const onlineApi = mande(`/api/online`);


export const useLobbiesStore = defineStore('lobbies', {
  state: () => ({
    lobbies: [],
  } as LobbiesState),
  getters: {
    getLobbies: (state) => state.lobbies,
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
    async fetchAndJoinLobby(lobbyId: number | string) {
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
