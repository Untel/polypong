/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.store.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: edal--ce <edal--ce@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:06 by adda-sil          #+#    #+#             */
/*   Updated: 2022/09/03 09:56:59 by edal--ce         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { defineStore } from 'pinia';
import { mande } from 'mande';
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
    getBalls: (state) => {
      console.log('Get');
      return state.balls;
    },
  },
  actions: {
    async fetchCurrentGame(id: string) {
      console.log('in fetchCurrentGame, id = ', id);
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
