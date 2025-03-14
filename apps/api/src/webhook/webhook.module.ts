import { Module } from "@nestjs/common";
import { ChatModule } from "src/chat/chat.module";
import { FacebookWebhookService } from "./facebook.webhook.service";
import { FacebookWebhookController } from "./facebook.webhook.controller";

@Module({
  imports: [ChatModule],
  providers: [FacebookWebhookService],
  controllers: [FacebookWebhookController],
})
export class WebhookModule {}