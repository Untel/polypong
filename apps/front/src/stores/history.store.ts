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

export interface MatchHistory {
  id: number;
}

interface MatchHistoryState {
  matchs: MatchHistory[];
}

export const useMatchHistoryStore = defineStore('history', {
  state: () => ({
    matchs: [],
  } as MatchHistoryState),
  getters: {
    getMatches(state): MatchHistory[] {
      return state.matchs;
    },
  },
  actions: {
    getMatch(id: number): MatchHistory | undefined {
      return this.getMatches.find((m) => m.id === id);
    },
    async fetchHistory() {
      this.matchs = await historyApi.get<MatchHistory[]>('');
    },
  },
});
