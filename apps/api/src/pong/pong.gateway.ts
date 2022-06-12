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
import { PongService } from './pong.service';
import { ILobbyConfig, LobbyId } from 'src/game/lobby.class';

import { LoggedInGuard } from 'src/guards/logged-in.guard';
import { JwtLoggedGuard } from 'src/guards/jwt-logged.guard';
import JwtAuthenticationGuard from 'src/guards/jwt-authentication.guard';

@UseGuards(JwtLoggedGuard)
@WebSocketGateway({
  cors: true,
  transports: ['websocket'],
})
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(private readonly pongService: PongService) {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('PongGateway');

  @SubscribeMessage('createLobby')
  handleMessage(socket: Socket, lobbyConfig: ILobbyConfig): void {
    this.logger.log(`Create lobby from client ${socket.id}`);
    this.pongService.addLobby(socket, lobbyConfig);
  }


  @SubscribeMessage('joinLobby')
  send(client: Socket, id: LobbyId): void {
    this.logger.log(`Client ${client.id} is joining lobby ${id}`);
    this.pongService.joinLobby(client, id);
  }

  afterInit(server: Server) {
    this.pongService.socketServer = server;
    this.logger.log(`Gateway initialized`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // @UseGuards(JwtAuthenticationGuard)
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
