/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   player.class.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/03 00:18:20 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/03 00:18:21 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Type } from 'class-transformer';
import { User } from 'src/user';
import GameTools from './gametools.class';
import Lobby, { LobbyId } from './lobby.class';

export default class Player {
  // socketId: string;
  @Type(() => User)
  user: User;
  inLobby: LobbyId | null;
  color: string;

  constructor(user: User) {
    this.user = user;
    this.color = `#${GameTools.genRanHex(6)}`;
  }

  public get id() {
    return this.user.id;
  }
}
