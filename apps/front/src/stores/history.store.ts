/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   history.store.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:06 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/15 16:13:52 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { defineStore } from 'pinia';
import { Notify } from 'quasar';
import { mande } from 'mande';
import { identity } from '@vueuse/core';
import { useAuthStore } from './auth.store';

export const historyApi = mande('/api/match-history');

// [
//  {
//    "createdAt": "2022-08-16T15:59:11.704Z",
//    "updatedAt": "2022-08-16T15:59:19.844Z",
//    "deletedAt": null,
//    "id": 1,
//    "totalPlayers": 2,
//    "botCount": 0,
//    "finishedAt": "2022-08-16T15:59:19.835Z",
//    "name": "",
//    "players": [
//      {
//        "createdAt": "2022-08-16T15:59:19.927Z",
//        "updatedAt": "2022-08-16T15:59:19.927Z",
//        "deletedAt": null,
//        "id": 1,
//        "rank": 2,
//        "user": {
//          "createdAt": "2022-08-16T15:52:54.362Z",
//          "updatedAt": "2022-08-16T15:52:54.362Z",
//          "deletedAt": null,
//          "id": 1,
//          "name": "lspiess",
//          "email": "lspiess@student.42.us.org",
//          "coalition": "order",
//          "emailVerified": true,
//          "socialChannel": "intra",
//          "avatar": "https://cdn.intra.42.fr/users/lspiess.jpg"
//        }
//      }
//    ]
//  }
// ]

export interface Player {
  playerId: number,
  rank: number,
  user: {
    userId: number,
    name: string,
    email: string,
    coalition: string,
    avatar: string,
  }
}

export interface MatchHistory {
  matchId: number;
  players: Player[];
}

export interface UserMatchesHistory {
  userId: number;
  matches: MatchHistory[];
}

interface UsersMatchesHistoriesState {
  usersHis: UserMatchesHistory[];
}

export const useMatchHistoryStore = defineStore('history', {
  state: () => ({
    usersHis: [],
  } as UsersMatchesHistoriesState),
  getters: {
    getUsersHis(state) {
      return state.usersHis;
    },
  },
  actions: {
    getUserMatchesHistory(userId: number): UserMatchesHistory | undefined {
      return this.getUsersHis.find((his) => his.userId === userId);
    },
    getUserMatch(userId: number, matchId: number): MatchHistory | undefined {
      return this.getUserMatchesHistory(userId)?.matches
        ?.find((match) => match.matchId === matchId);
    },
    getUserMatchPlayerByPlayerId(userId: number, matchId: number, playerId: number)
    : Player | undefined {
      return this.getUserMatch(userId, matchId)?.players
        ?.find((player) => player.playerId === playerId);
    },
    getUserMatchPlayerByUserId(userId: number, matchId: number, targetUserId: number)
    : Player | undefined {
      return this.getUserMatch(userId, matchId)?.players
        ?.find((player) => player.user.userId === targetUserId);
    },
    async fetchUserMatchesHistory(userId?: number): Promise<UserMatchesHistory | undefined> {
      if (!userId) {
        userId = useAuthStore().getUser.id;
      }
      console.log('history store - fetchUserMatchesHistory - userId = ', userId);
      const matches = await historyApi.get<MatchHistory[]>(`user/${userId}`);
      console.log('history store - fetchUserMatchesHistory - matches = ', matches);
      const curHis = this.getUserMatchesHistory(userId);
      if (curHis) {
        curHis.matches = matches;
        return curHis;
      }
      const newHis = { userId, matches };
      this.usersHis.push(newHis);
      return newHis;
    },
  },
});
