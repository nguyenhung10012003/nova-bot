import { Module } from '@nestjs/common';
import { ChatSessionController } from './chat-session.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  providers: [ChatService, ChatGateway],
  controllers: [ChatSessionController],
  exports: [ChatService],
})
export class ChatModule {}
