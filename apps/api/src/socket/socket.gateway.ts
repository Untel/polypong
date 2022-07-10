/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.gateway.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/30 17:00:37 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/10 21:28:21 by adda-sil         ###   ########.fr       */
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
import { AuthSocket, WSAuthMiddleware } from './ws-auth.middleware';

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
    // @Inject(@forwardRef(() => PongService))
    private readonly pongService: PongService,
    // private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @WebSocketServer() server: Server;
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
    server.use(middle)
    this.pongService.socketServer = server;
    this.logger.log(`Gateway initialized`);
  }

  handleDisconnect(client: AuthSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // this.userService.setSocketAsDisconnected(client.id);
    // this.server.send({ connectedUsers: [...this.userService.connectedUsers.values()] })
  }

  handleConnection(client: AuthSocket, ...args: any[]) {
    console.log("SOCKET HANDLE", client.user);
    // console.log("client.connected", client);
    // const user = await this.getUserFromSocket(client);
    // this.userService.setUserAsConnected(user.id, client.id);
    // const connectedUsers = [...this.userService.connectedUsers.values()];
    // this.server.send({ connectedUsers })
    // this.logger.log(`Client connected: ${client.id} ID ${user.id}`);
    // console.log("connectedUsers", connectedUsers)
  }

  getConnectedUsers() {
    return [...this.server.sockets.sockets.values()]
      .map((el: AuthSocket) => el.user);
  }

  getUserSocket(userID) {
    return [...this.server.sockets.sockets.values()]
      .find((el: AuthSocket) => el.user.id === userID);
  }
}
