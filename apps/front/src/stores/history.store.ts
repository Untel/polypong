/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   history.store.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:06 by adda-sil          #+#    #+#             */
/*   Updated: 2022/09/08 18:27:52 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { defineStore } from 'pinia';
import { mande } from 'src/libs/mande';
import { useAuthStore } from './auth.store';
import { BaseObject } from './thread.store';

export const historyApi = mande('/api/match-history');
export interface Player {
  id: number, // for a given match, a given player unique ID
  rank: number,
  user: {
    id: number, // for a given player, the user's unique ID
    name: string,
    email: string,
    coalition: string,
    avatar: string,
  }
}
export interface Match extends BaseObject {
  id: number; // the match's unique Id
  players: Player[];
  finishedAt?: string;
  totalPlayers: number;
}
export interface UserStats {
  wins: number;
  losses: number;
  ratio: number;
}
export interface UserMatchesHistory {
  userId: number;
  matches: Match[];
  stats: UserStats;
}
interface UsersMatchesHistories{
  usersHis: UserMatchesHistory[];
}

export const useMatchHistoryStore = defineStore('history', {
  state: () => ({
    usersHis: [],
  } as UsersMatchesHistories),
  getters: {
    getUsersHis(state) {
      return state.usersHis;
    },
  },
  actions: {
    getUserMatchesHistory(userId: number): UserMatchesHistory | undefined {
      return this.getUsersHis.find((his) => his.userId === userId);
    },
    getUserNameByIdFromMatchHistory(userId: number): string | undefined {
      const userHis = this.getUserMatchesHistory(userId);
      const player = userHis?.matches[0]?.players?.find((p) => p.user.id === userId);
      return player?.user.name || undefined;
    },
    getUserMatch(userId: number, matchId: number): Match| undefined {
      return this.getUserMatchesHistory(userId)?.matches
        ?.find((match) => match.id === matchId);
    },
    getUserMatchPlayerByPlayerId(userId: number, matchId: number, playerId: number)
    : Player | undefined {
      return this.getUserMatch(userId, matchId)?.players
        ?.find((player) => player.id === playerId);
    },
    getUserMatchPlayerByUserId(userId: number, matchId: number, targetUserId: number)
    : Player | undefined {
      return this.getUserMatch(userId, matchId)?.players
        ?.find((player) => player.user.id === targetUserId);
    },
    async fetchUserMatchesHistory(userId?: number): Promise<UserMatchesHistory | undefined> {
      if (!userId) {
        userId = useAuthStore().getUser.id;
      }
      const matches = await historyApi.get<Match[]>(`user/${userId}`);
      const curHis = this.getUserMatchesHistory(userId);
      if (curHis) {
        curHis.matches = matches;
        curHis.stats = this.computeStats(userId, matches);
        return curHis;
      }
      const stats = this.computeStats(userId, matches);
      const newHis = { userId, matches, stats };
      this.usersHis.push(newHis);
      return newHis;
    },

    computeStats(userId: number, matches: Match[]): UserStats {
      const stats = matches.reduce((acc, next) => {
        const me = next.players.find((p) => p.user.id === userId);
        if (me && me.rank <= (next.totalPlayers / 2)) acc.wins += 1;
        else acc.losses += 1;
        return acc;
      }, { wins: 0, losses: 0 });
      return { ...stats, ratio: stats.wins / matches.length };
    },

    async getAllMatches(): Promise<Match[] | undefined> {
      //      console.log('history store - getAllMatches');
      const allMatches = await historyApi.get<Match[]>('all');
      //      console.log('history store - getAllMatches - matches = ', allMatches);
      return allMatches;
    },
    async getPlayersUsersIds(): Promise<[any]> {
      //      console.log('history store - getPlayersUsersIds');
      return historyApi.get<[any]>('playersUsersIds');
    },
  },
});
