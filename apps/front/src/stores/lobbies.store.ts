/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobbies.store.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:06 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/14 02:43:47 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { UseFetchReturn } from '@vueuse/core';
import { defineStore } from 'pinia';
import { useApi } from 'src/utils/api';
import { useAuthStore } from './auth.store';
import { LoadingBar, Notify } from 'quasar';
import { mande } from 'mande';

export const lobbiesApi = mande(`/api/lobbies`);

type Lobby = {
  id: number;
  name: string;
  players: Array<any>;
  playersMax: number;
  spectators: Array<any>;
  spectatorsMax: number;
  description: string;
  isPrivate?: boolean;
  host: {
    avatar: string,
    name: string,
    id: number,
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
      // this.lobbies = [{
      //   id: 75,
      //   name: 'Partie de Adrien',
      //   description: 'Venez vous zamuze le zami ^^',
      //   spectatorsMax: 50,
      //   playersMax: 8,
      //   players: [1,2,3,4,5,6],
      //   spectators: [],
      //   host: {
      //     avatar: 'https://cdn.intra.42.fr/users/adda-sil.jpg',
      //     id: 75,
      //     name: 'Adrien',
      //   },
      //   isPrivate: true,
      // }, {
      //   id: 75,
      //   name: 'Partie de Enzoooo',
      //   description: '1v1 noscope bg only',
      //   spectatorsMax: 50,
      //   playersMax: 2,
      //   players: [1],
      //   spectators: [],
      //   host: {
      //     avatar: 'https://cdn.intra.42.fr/users/edal--ce.jpg',
      //     id: 75,
      //     name: 'Enzooo',
      //   }
      // }];
      try {
        this.lobbies = await lobbiesApi.get('');
      } catch (err) {
        console.log("err", err);
        Notify.create({
          type: 'negative',
          message: "Error while fetching lobbies"
        });
      }

    },
    async createLobby(lobbyName: string) {
      try {
        this.lobbies = await lobbiesApi.post('', {
          name: lobbyName
        });
      } catch (err) {
        console.log("err", err);
        Notify.create({
          type: 'negative',
          message: "Error while fetching lobbies"
        });
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
