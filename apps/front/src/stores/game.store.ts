/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.store.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:06 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/14 22:14:21 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { defineStore } from 'pinia';
import { mande } from 'mande';
import {
  Paddle,
  Ball,
  PolygonMap,
  Power,
} from 'src/utils/game';

export interface GameState {
  id?: string,
  paddles: Paddle[],
  balls: Ball[],
  map: PolygonMap,
  powers: Power[],
  isPaused: boolean;
}

export const useGameStore = defineStore('game', {
  state: () => ({} as GameState),
  getters: {
    gameApi: (state) => mande(`/api/lobbies/${state.id}/game`),
    getBalls: (state) => {
      console.log('Get');
      return state.balls;
    },
  },
  actions: {
    async fetchCurrentGame(id: string) {
      this.id = id;
      const gameInfos = await this.gameApi.get<GameState>('');
      this.map = gameInfos.map;
      this.balls = gameInfos.balls;
      this.paddles = gameInfos.paddles;
      this.powers = gameInfos.powers;
    },
    async pauseGame() {
      await this.gameApi.get('pause');
    },
    async restart() {
      await this.gameApi.get('restart');
    },
  },
});
