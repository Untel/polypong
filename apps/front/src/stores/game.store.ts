/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.store.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:06 by adda-sil          #+#    #+#             */
/*   Updated: 2022/09/06 21:28:18 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { defineStore } from 'pinia';
import { mande } from 'src/libs/mande';
import {
  Paddle,
  Ball,
  PolygonMap,
  Power,
  Score,
} from 'src/utils/game';

export const gameApi = mande('/api/lobbies');
export interface GameState {
  id?: string,
  paddles: Paddle[],
  balls: Ball[],
  map: PolygonMap,
  powers: Power[],
  scores: Score[],
  isPaused: boolean;
}

export const useGameStore = defineStore('game', {
  state: () => ({} as GameState),
  getters: {
    getBalls: (state) => state.balls,
  },
  actions: {
    async fetchCurrentGame(id: string) {
      //      console.log('in fetchCurrentGame, id = ', id);
      this.id = id;
      const gameInfos = await gameApi.get<GameState>(`/${id}/game`);
      this.map = gameInfos.map;
      this.balls = gameInfos.balls;
      this.paddles = gameInfos.paddles;
      this.powers = gameInfos.powers;
      this.scores = gameInfos.scores;
    },
    async pauseGame() {
      gameApi.get<GameState>(`/${this.id}/game`);
      await gameApi.get('pause');
    },
    async restart() {
      gameApi.get<GameState>(`/${this.id}/game`);
      await gameApi.get('restart');
    },
  },
});
