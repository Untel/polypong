/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   player.class.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/03 00:18:20 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/15 11:34:37 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Exclude, Type } from 'class-transformer';
import { AuthSocket } from 'src/socket';
import { User } from 'src/user';
import { Bot } from './bot.class';
import GameTools from './gametools.class';
import Lobby, { LobbyId } from './lobby.class';
import { Wall } from './wall.class';

export default class Player {
  // socketId: string;
  user: User;

  inLobby: LobbyId | null;
  wall: Wall;
  color: string;
  id: number;
  afkInterval: NodeJS.Timer = null;
  afkTimer: number;

  constructor(user: User) {
    this.user = user;
    this.color = `#${GameTools.genRanHex(6)}`;
    this.id = user?.id ?? GameTools.getRandomArbitrary(100, 1000);
    this.afkTimer = 30;
  }
  attachWall(wall: Wall) {
    this.wall = wall;
  }

  setAfk(
    callbackFn: (timer: number) => void,
    kickFn: (player: Player) => void,
  ) {
    this.afkInterval = setInterval(() => {
      this.afkTimer -= 1;
      if (this.afkTimer <= 0) {
        this.unsetAfk(kickFn);
      }
      callbackFn(this.afkTimer);
    }, 1000);
  }

  unsetAfk(recoverFn: (player: Player) => void) {
    clearInterval(this.afkInterval);
    this.afkInterval = null;
    recoverFn(this);
  }
}
