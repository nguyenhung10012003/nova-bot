import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChatflowDto } from './chatflow.dto';

@Injectable()
export class ChatflowService {
  constructor(private readonly prisma: PrismaService) {}

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
}
