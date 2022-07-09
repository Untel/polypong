/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.gateway.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/30 17:00:37 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/09 20:30:28 by adda-sil         ###   ########.fr       */
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
import { Logger, UseGuards } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { PongService } from 'src/pong/pong.service';
import { ILobbyConfig, LobbyId } from 'src/game/lobby.class';

import { LoggedInGuard } from 'src/guards/logged-in.guard';
import { JwtLoggedGuard } from 'src/guards/jwt-logged.guard';
import JwtAuthenticationGuard from 'src/guards/jwt-authentication.guard';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth';
import { User } from 'src/user';

// @UseGuards(JwtLoggedGuard)
@WebSocketGateway({
  cors: true,
  transports: ['websocket'],
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly pongService: PongService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('PongGateway');

  @SubscribeMessage('createLobby')
  handleMessage(socket: Socket, lobbyConfig: ILobbyConfig): void {
    this.logger.log(`Create lobby from client ${socket.id}`);
    // this.pongService.addLobby(socket, lobbyConfig);
  }

  @SubscribeMessage('reset')
  reset(client: Socket, evt: any) {
    this.pongService.reset();
  }

  @SubscribeMessage('joinLobby')
  send(client: Socket, id: LobbyId): void {
    this.logger.log(`Client ${client.id} is joining lobby ${id}`);
    // this.pongService.joinLobby(client, id);
  }

  @SubscribeMessage('paddlePercent')
  paddlePercent(client: Socket, percent: number) {
    this.pongService.updatePaddlePercent(client, percent);
  }

  afterInit(server: Server) {
    this.pongService.socketServer = server;
    this.logger.log(`Gateway initialized`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.userService.setSocketAsDisconnected(client.id);
    this.server.send({ connectedUsers: [...this.userService.connectedUsers.values()] })
  }

  async getUserFromSocket(client: Socket): Promise<User> {
    const cookie = client.handshake?.headers?.cookie;
    const decodedToken = await this.authService.decodeTokenFromCookie(cookie);
    const user = await this.userService.findById(decodedToken.userId);
    return user;
  }

  async handleConnection(client: Socket, ...args: any[]) {
    const user = await this.getUserFromSocket(client);
    this.userService.setUserAsConnected(user.id, client.id);
    const connectedUsers = [...this.userService.connectedUsers.values()];
    this.server.send({ connectedUsers })
    this.logger.log(`Client connected: ${client.id} ID ${user.id}`);
    console.log("connectedUsers", connectedUsers)
  }
}
