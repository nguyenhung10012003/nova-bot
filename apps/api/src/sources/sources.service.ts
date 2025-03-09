import { Injectable } from '@nestjs/common';
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
      await this.crawlService.addCrawlJob(`crawl-source-${source.id}`, source);
    }

    return source;
  }

  async updateSource(id: string, data: Partial<CreateSourceDto>) {
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

    if (source.type === 'WEBSITE' && (data.urls || data.rootUrl)) {
      await this.crawlService.addCrawlJob(`crawl-source-${source.id}`, source);
    }

    return source;
  }

  async reprocessSource(id: string) {
    const source = await this.prisma.source.findUnique({
      where: { id },
    });

    if (!source) {
      throw new Error('Source not found');
    }
    await this.crawlService.addCrawlJob(`crawl-source-${source.id}`, {
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
