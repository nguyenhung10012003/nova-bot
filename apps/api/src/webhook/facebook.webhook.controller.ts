import {
  Controller,
  Get,
  HttpException,
  Logger,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { FacebookWebhookService } from './facebook.webhook.service';

@Controller('webhook/facebook')
export class FacebookWebhookController {
  constructor(
    private readonly facebookWebhookService: FacebookWebhookService,
  ) {}

  @Get()
  verifyWebhook(@Query() query: any) {
    const mod = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];
    if (
      mod === 'subscribe' &&
      this.facebookWebhookService.verifyWebhook(token)
    ) {
      return challenge;
    }
    throw new HttpException('Unauthenticated', 403);
  }

  @Post()
  handleWebhook(@Req() req: Request, @Res() res: Response) {
    const body = req.body;
    Logger.debug('Received webhook event from facebook', body, 'Webhook');

    if (body.object === 'page') {
      body.entry.forEach((entry: any) => {
        const webhookEvent = entry.messaging[0];

        if (webhookEvent.message) {
          this.facebookWebhookService.handleWebhook({
            pageId: entry.id,
            senderId: webhookEvent.sender.id,
            message: webhookEvent.message,
          })
        }
      });

      return res.status(200).send('EVENT_RECEIVED');
    } else {
      return res.sendStatus(404);
    }
  }
}
