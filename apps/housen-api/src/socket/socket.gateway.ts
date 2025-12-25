import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'ws';
import * as WebSocket from 'ws';
import { AuthService } from '../components/auth/auth.service';
import { Member } from '../libs/dto/member/member';
import *as url from 'url';

interface MessagePayload {
  event: string;
  text: string;
  memberData?: Member | null;
  senderId: string | null;
}

interface InfoPayload {
  event: string;
  totalClients: number;
  memberData?: Member | null;
  action: string;
}

@WebSocketGateway({ transports: ['websocket'], secure: false })
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger: Logger = new Logger('SocketGateway');
  private summaryClient : number= 0;
  private clientsAuthMap = new Map<WebSocket, Member | null>();
  private messageList : MessagePayload[] = [];

  constructor(private authService: AuthService) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.logger.verbose(`WebSocket server initialized & total clients: [${this.summaryClient}]`);
  }

  public async retrieveAuth(req: any) : Promise<Member | null> {
    try{ 
      const parsedUrl = url.parse(req.url, true);
      const {token} = parsedUrl.query
      return await this.authService.verifyToken(token as string);
    }catch(err){
      return null;
    }
  }

  public async handleConnection(client: WebSocket, req: any) {
    const authMember = await this.retrieveAuth(req);
    this.summaryClient++;
    this.clientsAuthMap.set(client, authMember);

    const clientNick: string = authMember ?.memberNick ?? 'Guest';
    this.logger.verbose(`Connection [${clientNick}] & total [${this.summaryClient}]`);

    const infoMsg: InfoPayload = {
      event: 'info',
      totalClients: this.summaryClient,
      memberData: authMember,
      action: 'joined',
    };
    this.emitMsg(infoMsg)
    client.send(JSON.stringify({event: 'getMessages', list: this.messageList}));

    client.on('message', (data: WebSocket.Data) => {
      try {
        const messageText = data.toString();

        if (!messageText || messageText.trim().length === 0) {
          return;
        }

        const authMember = this.clientsAuthMap.get(client);

        const newMessage: MessagePayload = {
          event: 'message',
          text: messageText.trim(),
          memberData: authMember,
          senderId: authMember?._id ? String(authMember._id) : null,
        };

        this.messageList.push(newMessage);

        if (this.messageList.length > 5) {
          this.messageList.splice(0, this.messageList.length - 5);
        }

        this.emitMsg(newMessage);
      } catch (error) {
        this.logger.error('Error handling message:', error);
      }
    });
  }

  public handleDisconnect(client: WebSocket) {
    const authMember = this.clientsAuthMap.get(client);
    this.summaryClient--;
    this.clientsAuthMap.delete(client);
    
    const clientNick: string = authMember ?.memberNick ?? 'Guest';
    this.logger.verbose(`Disconnection [${clientNick}] & total [${this.summaryClient}]`);


    const infoMsg: InfoPayload = {
      event: 'info',
      totalClients: this.summaryClient,
      memberData: authMember,
      action: 'left',
    };

    this.broadcastMsg(client, infoMsg);
  }


  private broadcastMsg (sender: WebSocket, message: InfoPayload | MessagePayload) {
    this.server.clients.forEach((client) => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  private emitMsg (message: InfoPayload | MessagePayload) {
    this.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}
