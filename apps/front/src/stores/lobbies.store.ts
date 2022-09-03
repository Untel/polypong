/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobbies.store.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: edal--ce <edal--ce@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:06 by adda-sil          #+#    #+#             */
/*   Updated: 2022/09/03 12:44:22 by edal--ce         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { defineStore } from 'pinia';
import { Notify } from 'quasar';
import { mande } from 'mande';
import { User } from 'src/types/user';
import { useAuthStore } from './auth.store';

export const lobbiesApi = mande('/api/lobbies');

export interface BasePlayer {
  name: string;
  avatar: string;
  color: string;
}
export interface Bot extends BasePlayer {
  level: number;
}

export interface Player {
  user: User;
  color: string;
}

export interface Lobby {
  id: number;
  name: string;
  matching: boolean;
  players: Array<Player>;
  bots: Array<Bot>;
  playersMax: number;
  spectators: Array<any>;
  spectatorsMax: number;
  description: string;
  isPrivate?: boolean;
  isStarted: boolean;
  host: User
  finalePoints: number;
}

interface LobbiesState {
  lobbies: Lobby[];
  activeLobby: Lobby | null;
  matchmaking: boolean;
  madeMatches: number;
}

export const onlineApi = mande('/api/online');

export const useLobbiesStore = defineStore('lobbies', {
  state: () => ({
    lobbies: [],
    activeLobby: null,
    matchmaking: false,
    madeMatches: 0,
  } as LobbiesState),
  getters: {
    getLobbies: (state) => state.lobbies,
    getActiveLobby: (state): Lobby => (state.activeLobby as Lobby),
  },
  actions: {
    async fetchLobbies() {
      try {
        this.lobbies = await lobbiesApi.get('');
      } catch (err) {
        console.log('err', err);
        Notify.create({
          type: 'negative',
          message: 'Error while fetching lobbies',
        });
      }
    },
    async fetchAndJoinLobby(lobbyId: number | string) {
      if (this.matchmaking) {
        this.leaveMatchmake();
      }
      this.activeLobby = await lobbiesApi.get(`${lobbyId}/join`);
    },
    async fetchCurrentLobby(lobbyId: number | string) {
      this.activeLobby = await lobbiesApi.get(`${lobbyId}`);
    },
    async leave() {
      this.router.push('/lobbies');
      if (this.activeLobby) {
        await lobbiesApi.post(`${this.activeLobby.id}/leave`);
        this.activeLobby = null;
      }
    },
    async kick(lobbyId: number, userId: number) {
      if (this.activeLobby) {
        await lobbiesApi.post(`${this.activeLobby.id}/kick/${userId}`);
      }
    },
    async inviteUserToLobby(userId: number) {
      const { getIsConnected } = useAuthStore();
      if (!getIsConnected) return;
      if (!this.activeLobby) return;
      lobbiesApi.post(`${this.activeLobby.id}/invite/${userId}`);
    },
    async invitedBy(fromId: number, fromName: string, lobbyId: number) {
      Notify.create({
        type: 'neutral',
        color: 'primary',
        message: `You have been invited by ${fromName} to join lobby ${lobbyId}`,
        actions: [
          {
            label: 'Accept',
            color: 'white',
            handler: () => {
              this.router.push(`/lobby/${lobbyId}`);
            },
          },
        ],
      });
    },
    async joinMatchmake() {
      if (this.matchmaking) lobbiesApi.get(`/matchmake`);// Maybe check the return of here
      else lobbiesApi.get(`/matchmake`);
      this.matchmaking = true;
    },
    async leaveMatchmake() {
      lobbiesApi.get(`/leaveMatchmake`);
      this.matchmaking = false;
    },
    async createLobby(lobbyName: string) {
      if (this.activeLobby) {
        try {
          await lobbiesApi.post(`${this.activeLobby.id}/leave`);
        } catch (e) {
          console.log(e);
        }
        this.activeLobby = null;
      }
      try {
        const newLobby: Lobby = await lobbiesApi.post('', {
          name: lobbyName,
        });
        return newLobby;
      } catch (err) {
        Notify.create({
          type: 'negative',
          message: 'Error while creating lobby',
        });
        return null;
      }
    },
    async updateLobby(lobbyId: number, lobby: Lobby | Record<string, unknown>) {
      try {
        const newLobby: Lobby = await lobbiesApi.put(`/${lobbyId}`, lobby);
        return newLobby;
      } catch (err) {
        console.log('err', err);
        Notify.create({
          type: 'negative',
          message: 'Error while updating lobby',
        });
        return null;
      }
    },
    async joinLobby(lobbyId: number) {
      const { socket, getIsConnected } = useAuthStore();
      if (!getIsConnected) {
        return;
      }
      socket.emit('joinLobby', lobbyId);
    },
    startGame(lobbyId: number) {
      lobbiesApi.get(`${lobbyId}/start`);
    },
  },
});
