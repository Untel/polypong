/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.gateway.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/30 17:00:37 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/02 14:49:39 by adda-sil         ###   ########.fr       */
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
import { forwardRef, Inject, Logger, UseGuards } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { PongService } from 'src/pong/pong.service';
import { ILobbyConfig, LobbyId } from 'src/game/lobby.class';

import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth';
import { AuthSocket, SocketData, WSAuthMiddleware } from './ws-auth.middleware';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { SocketService } from 'src';

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
    private readonly pongService: PongService,
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
    // const socks  = (this.server.sockets.sockets.values());
    // console.log("Socks", socks);
    // const usrs = [...socks.values()];
    // console.log("Sockets", usrs);
    // console.log("SOCKET Input", client.user);
    this.pongService.updatePaddlePercent(client, percent);
  }

  /**
   * Grace a ce middleware, on link le user a cette connection socket
   */
  afterInit(server: Server) {
    const middle = WSAuthMiddleware(this.authService);
    server.use(middle);
    this.pongService.socketServer = server;
    this.logger.log(`Gateway initialized`);
  }

  handleDisconnect(client: Socket) {
    const { user, lobby } = client.data;
    if (lobby) {
      console.log('==================> Disconnected user was in lobby', lobby);
    } else {
      console.log('==================> OOps', lobby);
    }
    this.logger.log(`Client disconnected: ${client.id} Name ${user.name}`);
    this.server.emit('online', {
      name: user.name,
      type: 'disconnect',
    });
  }

  handleConnection(client: AuthSocket, ...args: any[]) {
    const { user, lobby } = client.data;
    this.logger.log(`Client connected: ${client.id} Name ${user.username}`);
    if (lobby) {
      console.log('Disconnected user was in lobby', lobby);
    }
    this.server.emit('online', {
      name: user.name,
      type: 'connect',
    });
  }
}
