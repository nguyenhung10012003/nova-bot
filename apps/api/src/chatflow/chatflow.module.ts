import { Module } from "@nestjs/common";
import { ChatflowController } from "./chatflow.controller";
import { ChatflowService } from "./chatflow.service";

@Module({
  imports: [],
  controllers: [ChatflowController],
  providers: [ChatflowService],
  exports: [],
}) 
export class ChatflowModule {}