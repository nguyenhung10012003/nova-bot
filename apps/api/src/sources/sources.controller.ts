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
import { ConfigService } from '@nestjs/config';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { ALLOWED_DOCUMENT_FILE_TYPES } from 'src/constant';
import { CreateSourceDto } from './sources.dto';
import { SourcesService } from './sources.service';

@Controller('sources')
@UseGuards(AccessTokenGuard)
export class SourcesController {
  constructor(
    private readonly sourcesService: SourcesService,
    private readonly configService: ConfigService,
  ) {}

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
    FilesInterceptor('files', 1000, {
      fileFilter(_req, file, callback) {
        if (!file) {
          return callback(null, true);
        } else {
          const isValid = ALLOWED_DOCUMENT_FILE_TYPES.includes(file.mimetype);
          if (isValid) {
            callback(null, true);
          } else {
            callback(new Error('Invalid file type'), false);
          }
        }
      },
    }),
  )
  async createSource(
    @Body() data: CreateSourceDto,
    @UploadedFile() files: Array<Express.Multer.File>,
  ) {
    if (files) {
      
    }
    return this.sourcesService.createSource(data);
  }

  @Patch(':id')
  async updateSource(
    @Body() data: Partial<CreateSourceDto>,
    @Param('id') id: string,
  ) {
    return this.sourcesService.updateSource(id, data);
  }

  @Patch(':id/reprocess')
  async reprocessSource(@Param('id') id: string) {
    return this.sourcesService.reprocessSource(id);
  }

  @Delete(':id')
  async deleteSource(@Param('id') id: string) {
    return this.sourcesService.deleteSource(id);
  }
}
