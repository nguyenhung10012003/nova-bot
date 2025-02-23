import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Source } from '@prisma/client';
import { Queue } from 'bullmq';
import { CrawlService } from 'src/crawl/crawl.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSourceDto } from './sources.dto';

@Injectable()
export class SourcesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crawlService: CrawlService,
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

  async createSource(data: CreateSourceDto) {
    const source = await this.prisma.source.create({
      data,
    });

    if (source.type === 'WEBSITE') {
      this.crawlService.addCrawlJob(`crawl-source-${source.id}`, source);
    }

    return source;
  }

  async updateSource(id: string, data: Partial<CreateSourceDto>) {
    const source = await this.prisma.source.update({
      where: { id },
      data,
    });

    if (source.type === 'WEBSITE') {
      this.crawlService.addCrawlJob(`crawl-source-${source.id}`, source);
    }

    return source;
  }

  async deleteSource(id: string) {
    return this.prisma.source.delete({
      where: { id },
    });
  }
}
