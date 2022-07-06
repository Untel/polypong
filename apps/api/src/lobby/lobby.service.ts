/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobby.service.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/14 11:38:38 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/06 17:37:54 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Injectable, Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import Game from 'src/game/game.class';
import Lobby, { ILobbyConfig, LobbyId } from 'src/game/lobby.class';
import Player from 'src/game/player.class';

import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class LobbyService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async getLobbies(): Promise<any> {
    const lobbies = await this.redis.get('lobbies');
    return lobbies;
  }

  getLobby(id: number): any {
    return this.redis.get(`lobby-${id}`);
  }


  clearLobbies() {
    this.redis.del('lobby-*');
  }

  createLobby() {}

  // addLobby(client: Socket, lobbyConfig: ILobbyConfig) {
  // }

  // joinLobby(client: Socket, id: LobbyId) {

  // }
}
