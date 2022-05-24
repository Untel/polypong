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

@WebSocketGateway({
  cors: true,
  transports: ['websocket'],
})
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('PongGateway');

  @SubscribeMessage('createLobby')
  handleMessage(client: Socket, payload: string): void {
    this.logger.log(`Create lobby ${payload} from client ${client.id}`);
    this.server.emit('msgToClient', payload);
  }

  @SubscribeMessage('joinLobby')
  send(client: Socket, payload: string): void {
    this.logger.log(`Received ${payload} from client`);
    // this.server.emit('msgToClient', payload);
  }

  afterInit(server: Server) {
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
