/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.store.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:06 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/04 09:07:07 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { defineStore } from 'pinia';
import { mande } from 'mande';

export const gameApi = mande('/api/lobbies');

export interface GameState {
  map: unknown;
}

export const useLobbiesStore = defineStore('lobbies', {
  state: () => ({
    map: null,
  } as GameState),
  getters: {},
  actions: {

  },
});
