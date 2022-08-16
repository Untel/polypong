/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.gateway.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/30 17:00:37 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/15 11:41:37 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { forwardRef, Inject, Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import Lobby from 'src/game/lobby.class';

import { AuthService } from 'src/auth';
import { AuthSocket, SocketData, WSAuthMiddleware } from './ws-auth.middleware';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { LobbyService, SocketService, User } from 'src';

/**
 * Ne pas utiliser ce AuthGuard. La protection de l'auth se fait grace au Middleware dans afterInit
 * Le guard est utile si on veut proteger certains message du socket a un role par exemple
 */
// @UseGuards(JwtGuard)
@WebSocketGateway({
  cors: true,
  transports: ['websocket'],
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(forwardRef(() => SocketService))
    private socketService: SocketService,
    // private readonly pongService: PongService,
    @Inject(forwardRef(() => LobbyService))
    private readonly lobbyService: LobbyService,
    private readonly authService: AuthService,
  ) {}

  @WebSocketServer() server: Server<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    SocketData
  >;
  private logger: Logger = new Logger('PongGateway');

  // @SubscribeMessage('createLobby')
  // handleMessage(socket: Socket, lobbyConfig: ILobbyConfig): void {
  //   this.logger.log(`Create lobby from client ${socket.id}`);
  //   // this.pongService.addLobby(socket, lobbyConfig);
  // }

  // @SubscribeMessage('joinLobby')
  // send(client: AuthSocket, id: LobbyId): void {
  //   this.logger.log(`Client ${client.id} is joining lobby ${id}`);
  //   // this.pongService.joinLobby(client, id);
  // }

  @SubscribeMessage('m')
  paddlePercent(client: AuthSocket, percent) {
    const user: User = client.data.user;
    const lobby: Lobby = client.data.lobby;
    if (!lobby.game) {
      console.log('No game while paddle moving', lobby);
      return;
    }
    const game = lobby.game;
    if (game) {
      if (!game.isStopped) game.updatePaddlePercent(user.id, percent);
      else console.log('Game found but paused', user.id);
    } else {
      console.log('Game not found', lobby.game);
    }
  }

  /**
   * Grace a ce middleware, on link le user a cette connection socket
   */
  afterInit(server: Server) {
    const middle = WSAuthMiddleware(this.authService);
    server.use(middle);
    this.logger.log('Gateway initialized');
  }

  handleDisconnect(client: Socket) {
    const user: User = client.data.user;
    const lobby: Lobby = client.data.lobby;
    // const lobby: Lobby = this.lobbyService.userIsInLobby(user.id);
    if (lobby) {
      if (lobby.game) {
        const player = lobby.game.players.get(user.id); // user is still alive
        if (player) {
          lobby.game.stop();
          player.setAfk(
            (timer) => {
              lobby.say(
                `${user.name} is disconnected. ${timer} before being kicked.`,
              );
            },
            () => {
              lobby.game.players.delete(user.id);
              lobby.game.newRound();
            },
          );
          lobby.game.stop();
        }
      } else {
        this.lobbyService.removePlayer(lobby.id, user);
      }
    }
    this.server.emit('online', {
      name: user.name,
      type: 'disconnect',
    });
  }

  handleConnection(client: AuthSocket, ...args: any[]) {
    const { user } = client.data;
    this.logger.log(`Client connected: ${client.id} Name ${user.username}`);
    const inLobby = this.lobbyService.userIsInLobby(user.id);
    if (inLobby) {
      client.data.lobby = inLobby;
      client.join(inLobby.roomId);
      if (inLobby.game && inLobby.game.players.has(user.id)) {
        client.emit('redirect', { name: 'game', params: { id: inLobby.id } });
      }
    }
    this.server.emit('online', {
      name: user.name,
      type: 'connect',
    });
  }
}
