import {
    WebSocketGateway,
    SubscribeMessage,
    OnGatewayInit,
  } from '@nestjs/websockets';
  import { Logger } from '@nestjs/common';
  import { Server, WebSocket } from 'ws';
  
  @WebSocketGateway({ transports: ['websocket'], secure: false })
  export class SocketGateway
    implements OnGatewayInit  {
    private readonly logger: Logger = new Logger('SocketGateway');
    private summaryClient : number= 0;
  
    afterInit(server: Server) {
      this.logger.log(`WebSocket server initialized. Total clients: ${this.summaryClient}`);
    }
  
    handleConnection(client: WebSocket, ...args: any[]) {
      this.summaryClient++;
      this.logger.log(`Client connected. Total clients: ${this.summaryClient}`);
    }
  
    handleDisconnect(client: WebSocket) {
      this.summaryClient--;
      this.logger.log(`Client disconnected. Total clients: ${this.summaryClient}`);
    }
  
    @SubscribeMessage('message')
    handleMessage(client: WebSocket, payload: any): string {
      this.logger.log(`Received message: ${payload}`);
      return 'Hello world!';
    }
  }
  