import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { CreateSourceDto } from './sources.dto';
import { SourcesService } from './sources.service';
import multer from 'multer';
import { ConfigService } from '@nestjs/config';

@Controller('sources')
@UseGuards(AccessTokenGuard)
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService, private readonly configService: ConfigService) {}

  @Get()
  async getSources(
    @Query('chatflowId') chatflowId: string,
    @Query('type') type: 'WEBSITE' | 'FILE' | 'TEXT',
  ) {
    return this.sourcesService.getSources({ chatflowId, type });
  }

  @Get(':id')
  async getSource(@Param('id') id: string) {
    return this.sourcesService.getSource(id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter(req, file, callback) {
        if (!file) {
          callback(null, false);
        } else {
        }
        callback(null, true);
      },
    }),
  )
  async createSource(
    @Body() data: CreateSourceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.sourcesService.createSource(data);
  }

  @Patch(':id')
  async updateSource(
    @Body() data: Partial<CreateSourceDto>,
    @Param('id') id: string,
  ) {
    return this.sourcesService.updateSource(id, data);
  }

  @Delete(':id')
  async deleteSource(@Param('id') id: string) {
    return this.sourcesService.deleteSource(id);
  }
}
