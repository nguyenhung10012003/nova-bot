import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { CreateChatflowDto } from './chatflow.dto';
import { ChatflowService } from './chatflow.service';

@Controller('chatflow')
@UseGuards(AccessTokenGuard)
export class ChatflowController {
  constructor(private readonly chatflowService: ChatflowService) {}

  @Post()
  async createChatflow(
    @Body() data: CreateChatflowDto,
    @Req() req: AuthRequest,
  ) {
    return this.chatflowService.createChatflow({
      ...data,
      userId: req.user.userId,
    });
  }

  @Get()
  async getChatflows(@Req() req: AuthRequest) {
    return this.chatflowService.getChatflows(req.user.userId);
  }

  @Get(':id')
  async getChatflow(@Param('id') id: string) {
    return this.chatflowService.getChatflow(id);
  }

  @Get(':id/upsert')
  async upsertChatflow(@Param('id') id: string) {
    return this.chatflowService.upsertChatflow(id);
  }

  @Get(':id/upsert-callback')
  async upsertChatflowCallback(@Param('id') id: string) {
    return this.chatflowService.upsertChatflowCallback(id);
  }

  @Patch(':id')
  async updateChatflow(
    @Param('id') id: string,
    @Body() data: Partial<CreateChatflowDto>,
  ) {
    return this.chatflowService.updateChatflow(id, data);
  }

  @Delete(':id')
  async deleteChatflow(@Param('id') id: string) {
    return this.chatflowService.deleteChatflow(id);
  }
}
