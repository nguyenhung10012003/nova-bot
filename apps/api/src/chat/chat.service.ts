import { Injectable, Logger } from '@nestjs/common';
import { FlowiseApi, NoStreamResponse } from '@nova/flowise-api';
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

  async getBotMessages(
    chatflowId: string,
    message: string,
    chatId?: string,
  ): Promise<NoStreamResponse> {
    const chatflow = await this.prismaService.chatflow.findUnique({
      where: { id: chatflowId },
    });

    const flowise = new FlowiseApi({
      apiKey: chatflow.apiKey,
      baseUrl: chatflow.baseUrl,
    });

    try {
      const res: NoStreamResponse = await flowise.createPrediction({
        chatflowId: chatflow.chatflowId,
        streaming: false,
        question: message,
        chatId,
      });
      if ('success' in res) {
        if (res.success === false) throw new Error((res as any).message);
      }

      Logger.debug(`Bot response: ${JSON.stringify(res)}`, 'ChatService');

      return res;
    } catch (error: any) {
      Logger.error(error, 'ChatService');
      return { text: 'An error occurred. Please try again later' } as NoStreamResponse;
    }
  }
}
