import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatService } from 'src/chat/chat.service';
import { sendFacebookMessage } from 'src/facebook.api';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FacebookWebhookService {
  constructor(
    private readonly chatService: ChatService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  verifyWebhook(token: string) {
    return (
      token === this.configService.get<string>('FACEBOOK_WEBHOOK_VERIFY_TOKEN')
    );
  }

  async handleWebhook({
    senderId,
    message,
    pageId,
  }: {
    senderId: string;
    message: any;
    pageId: string;
  }) {
    const page = await this.prisma.integration.findUnique({
      where: {
        pageId,
      },
    });

    if (!page || page?.status !== 'ENABLED') {
      return;
    }

    if (!message.text) {
      return;
    }

    const botResponse = await this.chatService.getBotMessages(
      page.chatflowId,
      message.text,
    );

    if (botResponse) {
      await sendFacebookMessage({
        pageAccessToken: page.accessToken,
        userId: senderId,
        message: botResponse.text,
      });
    } else {
      await sendFacebookMessage({
        pageAccessToken: page.accessToken,
        userId: senderId,
        message: 'Bot is not available right now',
      });
    }
  }
}
