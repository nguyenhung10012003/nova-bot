import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Source } from '@prisma/client';
import { Job } from 'bullmq';
import { PrismaService } from 'src/prisma/prisma.service';
import { crawl, CrawlData } from 'src/utils/crawler';
import { CRAWL_WORKER, FILE_WORKER } from './constant';
import { WorkerService } from './worker.service';

const MAX_FILES_TO_CRAWL = 30;
@Processor(CRAWL_WORKER, {
  concurrency: 10,
})
export class CrawlWorker extends WorkerHost {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly workerService: WorkerService,
  ) {
    super();
  }
  async process(job: Job<Source & { refresh?: boolean }>) {
    Logger.debug(`Processing source with id: ${job.data.id}`, 'CrawlWorker');
    const source = job.data;
    try {
      await this.beforeProcess(source);

      if (source.type === 'WEBSITE') {
        const crawlData = await this.processWebSource(source);
        console.log(crawlData);
        await this.workerService.addJob(
          FILE_WORKER,
          `process-files-${source.id}`,
          { ...crawlData, source },
        );
      } else {
        await this.workerService.addJob(
          FILE_WORKER,
          `process-files-${source.id}`,
          { source },
        );
      }
    } catch (e: any) {
      Logger.error(
        `Failed when processing source with id: ${source.id}`,
        e.stack,
        'CrawlWorker',
      );
      await this.prismaService.source.update({
        where: {
          id: source.id,
        },
        data: {
          sourceStatus: 'ERROR',
        },
      });
      return null;
    }
  }

  async processWebSource(source: Source & { refresh?: boolean }) {
    let urls: CrawlData[] = [];
    if (source.refresh) {
      urls = await crawl({
        urls: [source.rootUrl],
        match: source.fetchSetting?.matchPattern || `${source.rootUrl}/**`,
        maxUrlsToCrawl: source.fetchSetting?.maxUrlsToCrawl || 25,
        exclude: source.fetchSetting?.excludePattern,
        fileMatch: source.fetchSetting?.filePattern
          ? source.fetchSetting.filePattern
          : '',
      });
    } else if (source.urls.length) {
      urls = await crawl({
        urls: source.urls.map((url) => url.url),
        match: source.fetchSetting?.matchPattern || `${source.rootUrl}/*`,
        maxUrlsToCrawl: Math.min(
          source.fetchSetting?.maxUrlsToCrawl || 25,
          source.urls.length,
        ),
        exclude: source.fetchSetting?.excludePattern,
        fileMatch: source.fetchSetting?.filePattern
          ? source.fetchSetting.filePattern
          : '',
      });
    }

    if (urls?.length) {
      const filesUrl: CrawlData[] = [];
      const websUrl: CrawlData[] = [];

      // Split urls into files and webs
      urls.forEach((url) => {
        if (url.type === 'FILE') {
          if (filesUrl?.length < MAX_FILES_TO_CRAWL) filesUrl.push(url);
        } else {
          websUrl.push(url);
        }
      });
      Logger.debug(
        `Crawled ${filesUrl.length} files and ${websUrl.length} webs, source id: ${source.id}`,
        'SourceWorker',
      );

      return { filesUrl, websUrl };
    } else {
      Logger.debug(
        `No urls found for source with id: ${source.id}`,
        'SourceWorker',
      );
      return null;
    }
  }

  async beforeProcess(source: Source) {
    Logger.debug(`Processing source with id: ${source.id}`, 'SourceWorker');
    await Promise.all([
      this.prismaService.source.update({
        where: {
          id: source.id,
        },
        data: {
          sourceStatus: 'PROCESSING',
        },
      }),
      this.prismaService.document.deleteMany({
        where: {
          sourceId: source.id,
        },
      }),
    ]);
  }

  async afterProcess(source: Source) {
    await this.prismaService.source.update({
      where: {
        id: source.id,
      },
      data: {
        sourceStatus: 'PROCESSED',
      },
    });

    Logger.debug(`Processed source with id: ${source.id}`, 'Crawl worker');
  }
}
