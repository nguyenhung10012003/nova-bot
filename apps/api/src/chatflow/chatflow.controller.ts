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
export class ChatflowController {
  constructor(private readonly chatflowService: ChatflowService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
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
  @UseGuards(AccessTokenGuard)
  async getChatflows(@Req() req: AuthRequest) {
    return this.chatflowService.getChatflows(req.user.userId);
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard)
  async getChatflow(@Param('id') id: string) {
    return this.chatflowService.getChatflow(id);
  }

  @Get(':id/upsert-vector')
  @UseGuards(AccessTokenGuard)
  async upsertChatflow(@Param('id') id: string) {
    return this.chatflowService.upsertChatflow(id);
  }

  @Get(':id/upsert-vector-callback')
  async upsertChatflowCallback(@Param('id') id: string) {
    return this.chatflowService.upsertChatflowCallback(id);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard)
  async updateChatflow(
    @Param('id') id: string,
    @Body() data: Partial<CreateChatflowDto>,
  ) {
    return this.chatflowService.updateChatflow(id, data);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  async deleteChatflow(@Param('id') id: string) {
    return this.chatflowService.deleteChatflow(id);
  }
}
