/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobbies.store.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:06 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/14 03:10:55 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { defineStore } from 'pinia';
import { Notify } from 'quasar';
import { mande } from 'mande';
import { useAuthStore } from './auth.store';

export const lobbiesApi = mande('/api/lobbies');

export interface BasePlayer {
  name: string;
  avatar: string;
  color: string;
}
export interface User extends BasePlayer {
  id: number;
  email: string;
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
  players: Array<Player>;
  bots: Array<Bot>;
  playersMax: number;
  spectators: Array<any>;
  spectatorsMax: number;
  description: string;
  isPrivate?: boolean;
  isStarted: number;
  host: User
}

interface LobbiesState {
  lobbies: Lobby[];
  activeLobby: Lobby | null;
}

export const onlineApi = mande('/api/online');

export const useLobbiesStore = defineStore('lobbies', {
  state: () => ({
    lobbies: [],
    activeLobby: null,
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
      const { socket, getIsConnected } = useAuthStore();
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
              console.log('about to reroute to /lobby/', lobbyId);
              this.router.push(`/lobby/${lobbyId}`);
            },
          },
        ],
      });
    },
    async createLobby(lobbyName: string) {
      await this.leave();
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
