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
//  import { PongGame, PongServerEngine } from "@polypong/game";

@WebSocketGateway({
  cors: true,
  transports: ['websocket'],
})
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('PongGateway');

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: string): void {
    this.logger.log(`Received ${payload} from client`);
    this.server.emit('msgToClient', payload);
  }

  afterInit(server: Server) {
    // const gameEngine = new PongGame({ traceLevel: null });
    // const serverEngine = new PongServerEngine(server, gameEngine, { debug: {}, updateRate: 6 });
    // this.logger.log('Init', serverEngine);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
