import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Source } from '@prisma/client';
import { Job } from 'bullmq';
import { PrismaService } from 'src/prisma/prisma.service';
import { crawl, CrawlData } from 'src/utils/crawler';

@Processor('crawl')
export class CrawlWorker extends WorkerHost {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }
  async process(job: Job<Source & { refresh?: boolean }>): Promise<boolean> {
    const source = job.data;
    Logger.debug(`Processing source with id: ${source.id}`, 'Crawl worker');
    if (source.type === 'WEBSITE') {
      return this.processWebSource(source);
    }
  }

  async processWebSource(source: Source & { refresh?: boolean }) {
    const isNewSource = source.sourceStatus === 'CREATED';
    await this.prismaService.source.update({
      where: {
        id: source.id,
      },
      data: {
        sourceStatus: 'PROCESSING',
      },
    });

    try {
      await this.prismaService.document.deleteMany({
        where: {
          sourceId: source.id,
        },
      });
      if (isNewSource || source.refresh) {
        const urls: CrawlData[] = await crawl({
          urls: [source.rootUrl],
          match: source.fetchSetting?.matchPattern || `${source.rootUrl}/*`,
          maxUrlsToCrawl: source.fetchSetting?.maxUrlsToCrawl || 25,
          fileMatch: source.fetchSetting?.filePattern || '',
        });

        if (urls?.length) {
          await this.prismaService.document.createMany({
            data: urls.map((url) => ({
              pageContent: `${url.title} -\n ${url.content}`,
              metadata: JSON.stringify({
                name: url.title,
                source: url.url,
                title: url.title,
                url: url.url,
              }),
              sourceId: source.id,
              chatflowId: source.chatflowId,
            })),
          });
  
          await this.prismaService.source.update({
            where: {
              id: source.id,
            },
            data: {
              urls: urls.map((url) => ({ url: url.url, type: 'URL' })),
            },
          });
        }
        
      } else if (source.urls.length) {
        const urls: CrawlData[] = await crawl({
          urls: source.urls.map((url) => url.url),
          match: source.fetchSetting?.matchPattern || `${source.rootUrl}/*`,
          maxUrlsToCrawl: source.fetchSetting?.maxUrlsToCrawl || 25,
          fileMatch: source.fetchSetting?.filePattern || '',
        });

        await this.prismaService.document.createMany({
          data: urls.map((url) => ({
            pageContent: `${url.title} -\n ${url.content}`,
            metadata: JSON.stringify({
              name: url.title,
              source: url.url,
              title: url.title,
              url: url.url,
            }),
            sourceId: source.id,
            chatflowId: source.chatflowId,
          })),
        });
      }

      await this.prismaService.source.update({
        where: {
          id: source.id,
        },
        data: {
          sourceStatus: 'PROCESSED',
        },
      });

      Logger.debug(`Processed source with id: ${source.id}`, 'Crawl worker');

      return true;
    } catch (e: any) {
      Logger.error(
        `Failed when process source with id: ${source.id}`,
        e.stack,
        'Crawl worker',
      );
      await this.prismaService.source.update({
        where: {
          id: source.id,
        },
        data: {
          sourceStatus: 'ERROR',
        },
      });
      return false;
    }
  }
}
