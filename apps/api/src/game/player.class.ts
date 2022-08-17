/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   player.class.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/03 00:18:20 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/17 16:21:34 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { User } from 'src/user';
import GameTools from './gametools.class';
import { LobbyId } from './lobby.class';
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
    recoverFn(this);
    clearInterval(this.afkInterval);
    this.afkInterval = null;
  }
}
