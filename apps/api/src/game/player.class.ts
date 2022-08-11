/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   player.class.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/03 00:18:20 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/10 15:31:06 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Exclude, Type } from 'class-transformer';
import { AuthSocket } from 'src/socket';
import { User } from 'src/user';
import { Bot } from './bot.class';
import GameTools from './gametools.class';
import Lobby, { LobbyId } from './lobby.class';

export default class Player {
  // socketId: string;
  @Type(() => User)
  user: User;

  inLobby: LobbyId | null;
  color: string;
  id: number;

  constructor(user: User) {
    this.user = user;
    this.color = `#${GameTools.genRanHex(6)}`;
    this.id = user?.id ?? GameTools.getRandomArbitrary(100, 1000);
  }
}
