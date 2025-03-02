import { Injectable } from '@nestjs/common';
import { FlowiseApi } from '@nova/flowise-api';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prismaService: PrismaService) {}

  async createChatSession(chatflowId: string, title?: string) {
    const chatSession = await this.prismaService.chatSession.create({
      data: { chatflowId, title },
    });
    return chatSession;
  }

  async getChatSessions(chatflowId: string) {
    return this.prismaService.chatSession.findMany({
      where: { chatflowId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getChatSession(chatSessionId: string) {
    return this.prismaService.chatSession.findUnique({
      where: { id: chatSessionId },
    });
  }

  async updateChatSession(chatSessionId: string, data: { title: string }) {
    return this.prismaService.chatSession.update({
      where: { id: chatSessionId },
      data,
    });
  }

  async deleteChatSession(chatSessionId: string) {
    return this.prismaService.chatSession.delete({
      where: { id: chatSessionId },
    });
  }

  async getMessages(chatSessionId: string) {
    return this.prismaService.chatMessage.findMany({
      where: { chatSessionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getBotMessages(chatflowId: string, message: string) {
    const chatflow = await this.prismaService.chatflow.findUnique({
      where: { id: chatflowId },
    });

    const flowise = new FlowiseApi({
      apiKey: chatflow.apiKey,
      baseUrl: chatflow.baseUrl,
    });

    const res = await flowise.createPrediction({
      chatflowId: chatflow.chatflowId,
      streaming: false,
      question: message,
    });

    return res;
  }
}
