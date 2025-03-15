import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSourceDto } from './sources.dto';
import { WorkerService } from 'src/worker/worker.service';
import { SOURCE_WORKER } from 'src/worker/constant';
import { File } from '@prisma/client';

@Injectable()
export class SourcesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workerService: WorkerService,
  ) {}

  async getSources({
    chatflowId,
    type,
  }: {
    chatflowId: string;
    type?: 'WEBSITE' | 'FILE' | 'TEXT';
  }) {
    return this.prisma.source.findMany({
      where: { chatflowId, type },
    });
  }

  async getSource(id: string) {
    return this.prisma.source.findUnique({
      where: { id },
    });
  }

  async createSource(data: CreateSourceDto & {files?: File[]}) {
    const source = await this.prisma.source.create({
      data,
    });

    
    await this.workerService.addJob(SOURCE_WORKER, `crawl-source-${source.id}`, {...source, refresh: true});
    

    return source;
  }

  async updateSource(id: string, data: Partial<CreateSourceDto> & {files?: File[]}) {
    const source = await this.prisma.source.update({
      where: { id },
      data: {
        ...data,
        fetchSetting: data.fetchSetting
          ? {
              upsert: {
                set: data.fetchSetting,
                update: data.fetchSetting,
              },
            }
          : undefined,
      },
    });

    return source;
  }

  async reprocessSource(id: string) {
    const source = await this.prisma.source.findUnique({
      where: { id },
    });

    if (!source) {
      throw new Error('Source not found');
    }
    this.workerService.addJob(SOURCE_WORKER, `crawl-source-${source.id}`, {
      ...source,
      refresh: true,
    });
    return source;
  }

  async deleteSource(id: string) {
    return this.prisma.source.delete({
      where: { id },
    });
  }
}
