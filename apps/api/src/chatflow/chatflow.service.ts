import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FlowiseApi } from '@nova/flowise-api';
import { PrismaService } from 'src/prisma/prisma.service';
import { chunk } from 'src/utils/splitter';
import { CreateChatflowDto } from './chatflow.dto';

@Injectable()
export class ChatflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createChatflow(options: CreateChatflowDto & { userId: string }) {
    const { userId, ...data } = options;
    return this.prisma.chatflow.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async getChatflows(userId: string) {
    return this.prisma.chatflow.findMany({ where: { userId } });
  }

  async getChatflow(id: string) {
    return this.prisma.chatflow.findUnique({ where: { id } });
  }

  async updateChatflow(id: string, data: Partial<CreateChatflowDto>) {
    return this.prisma.chatflow.update({ where: { id }, data });
  }

  async deleteChatflow(id: string) {
    return this.prisma.chatflow.delete({ where: { id } });
  }

  async upsertChatflow(chatflowId: string) {
    const chatflow = await this.prisma.chatflow.findUnique({
      where: {
        chatflowId: chatflowId,
      },
    });
    const flowiseApi = new FlowiseApi({
      baseUrl: chatflow.baseUrl || 'http://localhost:3000',
    });

    await flowiseApi.upsertVector({
      chatflowId: chatflow.chatflowId,
    });
  }

  async upsertChatflowCallback(chatflowId: string) {
    const chatflow = await this.prisma.chatflow.findUnique({
      where: {
        chatflowId: chatflowId,
      },
    });
    const document = await this.prisma.document.findMany({
      where: {
        chatflowId: chatflow.id,
      },
    });
    const parsedDocument = document.map((doc) => ({
      metadata: JSON.parse(doc.metadata) as Record<string, any>,
      pageContent: doc.pageContent,
    }));

    this.eventEmitter.emit('chatflow.upserted', {
      chatflow: chatflow,
    });

    return chunk(parsedDocument);
  }
}
