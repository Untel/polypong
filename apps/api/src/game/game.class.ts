/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.class.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:00 by adda-sil          #+#    #+#             */
/*   Updated: 2022/06/13 03:00:01 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Lobby from './lobby.class';

export default class Game {
  lobby: Lobby;
  loopId: NodeJS.Timeout;
  constructor(lobby: Lobby) {
    this.lobby = lobby;

    this.loopId = setTimeout(() => this.tick(), 10)
  }

  destroyed() {
    clearTimeout(this.loopId);
  }

  tick() {

    // there is game logic
  }
}
