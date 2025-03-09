import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatMessageDto } from './chat-message.dto';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly prismaService: PrismaService,
    private chatService: ChatService,
  ) {}
  afterInit(server: any) {
    Logger.log('Chat gateway initialized', 'ChatGateway');
  }

  handleConnection(client: Socket) {
    client.emit('connection', 'Successfully connected to the server');
    Logger.log(`Client connected: ${client.id}`, 'ChatGateway');
  }

  handleDisconnect(client: Socket) {
    Logger.log(`Client disconnected: ${client.id}`, 'ChatGateway');
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: ChatMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    let chatSessionId = data.chatSessionId;

    // Nếu không có chatSessionId, tạo một phiên mới
    if (!chatSessionId) {
      const chatSession = await this.prismaService.chatSession.create({
        data: { chatflowId: data.chatflowId, title: data.message },
      });
      client.emit('chatSession', chatSession);
      chatSessionId = chatSession.id;
    }

    // Lưu tin nhắn của người dùng vào database
    const userMessage = await this.prismaService.chatMessage.create({
      data: {
        chatSessionId,
        message: data.message,
        type: data.type,
        recipientType: 'BOT',
      },
    });

    Logger.debug(`Received user message: ${JSON.stringify(userMessage)}`, 'ChatGateway');

    // Gửi tin nhắn của người dùng về client ngay lập tức
    client.emit('message', {
      event: 'message',
      data: { ...userMessage, botIsThinking: true },
    });

    const botResponse = await this.chatService.getBotMessages(data.chatflowId, data.message);

    // Lưu tin nhắn phản hồi vào database
    const systemMessage = await this.prismaService.chatMessage.create({
      data: {
        chatSessionId,
        message: botResponse.text,
        type: 'TEXT',
        recipientType: 'USER',
      },
    });

    Logger.debug(`Sending system message: ${JSON.stringify(systemMessage)}`, 'ChatGateway');

    // Gửi tin nhắn phản hồi từ hệ thống về client
    client.emit('message', { event: 'message', data: systemMessage });

    return;
  }
}
