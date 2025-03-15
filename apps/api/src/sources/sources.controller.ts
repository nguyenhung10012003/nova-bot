import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { ALLOWED_DOCUMENT_FILE_TYPES } from 'src/constant';
import { StorageService } from 'src/storage/storage.service';
import { CreateSourceDto } from './sources.dto';
import { SourcesService } from './sources.service';

@Controller('sources')
@UseGuards(AccessTokenGuard)
export class SourcesController {
  constructor(
    private readonly sourcesService: SourcesService,
    private readonly configService: ConfigService,
    private readonly storageService: StorageService,
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
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (files?.length > 0) {
      const filesPath = await Promise.all(
        files.map(async (file) => {
          const url = await this.storageService.saveFile(file);
          return {
            name: file.originalname,
            url,
          };
        }),
      );
      return this.sourcesService.createSource({
        ...data,
        files: filesPath,
      });
    }
    return this.sourcesService.createSource(data);
  }

  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('newFiles', 1000, {
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
  async updateSource(
    @Body()
    data: Partial<CreateSourceDto> & {
      files?: { name: string; url: string }[];
    },
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Param('id') id: string,
  ) {
    console.log(data);
    if (files?.length > 0) {
      const filesPath = await Promise.all(
        files.map(async (file) => {
          const url = await this.storageService.saveFile(file);
          return {
            name: file.originalname,
            url,
          };
        }),
      );
      return this.sourcesService.updateSource(id, {
        ...data,
        files: data.files ? [...data.files, ...filesPath] : filesPath,
      });
    }
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
