import { Module } from "@nestjs/common";
import { ChatflowController } from "./chatflow.controller";
import { ChatflowService } from "./chatflow.service";
import { ChatflowListener } from "./chatflow.listener";

@Module({
  imports: [],
  controllers: [ChatflowController],
  providers: [ChatflowService, ChatflowListener],
  exports: [],
}) 
export class ChatflowModule {}