import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query } from "@nestjs/common";
import { ChatService } from "./chat.service";

@Controller("chat-session")
export class ChatSessionController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async createChatSession(@Body("chatflowId") chatflowId: string) {
    if (!chatflowId) {
      throw new BadRequestException("chatflowId is required");
    }
    return this.chatService.createChatSession(chatflowId);
  }

  @Get()
  async getChatSessions(@Query("chatflowId") chatflowId: string) {
    if (!chatflowId) {
      throw new BadRequestException("chatflowId is required");
    }
    return this.chatService.getChatSessions(chatflowId);
  }

  @Get(':id')
  async getChatSession(@Param("id") id: string) {
    const chatSession = await this.chatService.getChatSession(id);
    if (!chatSession) {
      throw new NotFoundException("Chat session not found");
    }
    return chatSession;
  }

  @Patch(':id')
  async updateChatSession(@Param("id") id: string, @Body("title") title: string) {
    return this.chatService.updateChatSession(id, { title });
  }

  @Delete(':id')
  async deleteChatSession(@Param("id") id: string) {
    return this.chatService.deleteChatSession(id);
  }

  @Get(':id/messages')
  async getMessages(@Param("id") id: string) {
    return this.chatService.getMessages(id);
  }
}