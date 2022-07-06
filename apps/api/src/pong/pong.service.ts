/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   pong.service.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 02:58:11 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/06 17:38:08 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Injectable, Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import Game from 'src/game/game.class';
import Lobby, { ILobbyConfig, LobbyId } from 'src/game/lobby.class';
import Player from 'src/game/player.class';

import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import Store from 'redis-json';
import { UserService } from 'src/user';

@Injectable()
export class PongService {
  store;
  socketServer: Server = null;
  lobbies = new Map<number, Lobby>();
  id = 0;
  tmpGame: Game = null;

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly userService: UserService,
  ) {
    this.store = new Store<typeof Game>(redis, { prefix: 'game:' });
    setTimeout(() => {
      // console.log('In constrcutor service', this.socketServer);
      this.tmpGame = new Game(
        this.socketServer,
        this.store,
        new Lobby(0, new Player(0)),
      );
    }, 3000);
  }

  generateId() {
    return ++this.id;
  }
  reset() {
    this.tmpGame.reset();
  }

  getLobbies(): Lobby[] {
    return [...this.lobbies.values()];
  }

  getLobby(id: number): Lobby {
    return this.lobbies.get(id);
  }

  clearLobbies() {
    this.lobbies = new Map<number, Lobby>();
    this.id = 0;
  }

  addLobby(client: Socket, lobbyConfig: ILobbyConfig) {
    // console.log("Adding lobby", socket, this.socketServer);
    const host = new Player(client.id);
    const lobby = new Lobby(this.generateId(), host);
    if (lobbyConfig) {
      console.log('Setting lobby config', lobbyConfig);
      lobby.configure(lobbyConfig);
    }
    client.join(`lobby-${lobby.id}`);
    this.socketServer.emit('refreshedLobbies');
  }

  joinLobby(client: Socket, id: LobbyId) {
    console.log('Pong service joining room', id);
    const lobby = this.lobbies.get(id);
    lobby.addPlayer(new Player(client.id));
    client.join(`lobby-${id}`);
    console.log('Joined', this.lobbies);
    this.socketServer.emit('refreshedLobbies');
  }

  updatePaddlePercent(client: Socket, percent: number) {
    this.tmpGame.updatePaddlePercent(percent);
  }

  togglePause() {
    this.tmpGame.isPaused ? this.tmpGame.run() : this.tmpGame.stop();
    return this.tmpGame.isPaused;
  }

  tick(): any {
    this.tmpGame.tick();
    return this.tmpGame.devTick;
  }
}
