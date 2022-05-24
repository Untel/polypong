import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { PongService } from './pong.service';

@WebSocketGateway({
  cors: true,
  transports: ['websocket'],
})
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(private readonly pongService: PongService) {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('PongGateway');

  @SubscribeMessage('createLobby')
  handleMessage(socket: Socket, payload: string): void {
    this.logger.log(`Create lobby ${payload} from client ${socket.id}`);
    // this.server.emit('msgToClient', payload);
    this.pongService.addLobby(socket);
  }

  @SubscribeMessage('joinLobby')
  send(client: Socket, payload: string): void {
    this.logger.log(`Received ${payload} from client`);
    // this.server.emit('msgToClient', payload);
  }

  afterInit(server: Server) {
    this.pongService.socketServer = server;
    this.logger.log(`Gateway initialized`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    console.log('Args are');
  }
}
