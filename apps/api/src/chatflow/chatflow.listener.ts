import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Chatflow } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatflowListener {
  constructor(private readonly prismaService: PrismaService) {}

  @OnEvent('chatflow.upserted')
  async handleUpserted(event: { chatflow: Chatflow }) {
    await this.prismaService.source.updateMany({
      where: {
        chatflowId: event.chatflow.id,
      },
      data: {
        sourceStatus: 'SYNCED',
      },
    });
    Logger.debug(`Handle Event: Upserted chatflow ${event.chatflow.id}`, 'ChatflowListener');
  }
}
