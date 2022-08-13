/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.gateway.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/30 17:00:37 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/11 16:38:12 by adda-sil         ###   ########.fr       */
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
import Lobby, {  } from 'src/game/lobby.class';

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

  @SubscribeMessage('paddlePercent')
  async paddlePercent(client: AuthSocket, percent: number) {
    const user: User = client.data.user;
    const lobby = this.lobbyService.userIsInLobby(user);
    const game = lobby.game;
    if (game) {
      if (!game.isPaused) game.updatePaddlePercent(user.id, percent);
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
    // this.pongService.socketServer = server;
    this.logger.log('Gateway initialized');
  }

  handleDisconnect(client: Socket) {
    const user: User = client.data.user;
    const lobby: Lobby = this.lobbyService.userIsInLobby(user);
    if (lobby) {
      if (lobby.game) {
        console.log('Has lobby game');
        lobby.game.stop();
        // eslint-disable-next-line prettier/prettier
        lobby.say(
          `${user.name} has disconnected. Pausing game until he reconnect`,
        );
      } else {
        console.log('Has not lobby game');
        lobby.removePlayer(user);
        // this.lobbyService.updateLobby(lobby.id, lobby);
      }
    }
    this.logger.log(`Client disconnected: ${client.id} Name ${user.name}`);
    this.server.emit('online', {
      name: user.name,
      type: 'disconnect',
    });
  }

  handleConnection(client: AuthSocket, ...args: any[]) {
    const { user } = client.data;
    this.logger.log(`Client connected: ${client.id} Name ${user.username}`);
    const inLobby = this.lobbyService.userIsInLobby(user);
    if (inLobby) {
      client.data.lobby = inLobby;
      console.log('Reconnected in lobby');
      client.join(inLobby.roomId);
      // client.emit('redirect', `/lobbies/${inLobby.id}/game`);
      client.emit('redirect', { name: 'game', params: { id: inLobby.id } });
    }
    this.server.emit('online', {
      name: user.name,
      type: 'connect',
    });
  }
}
