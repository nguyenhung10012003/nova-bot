import { Document } from '@langchain/core/documents';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Source, UrlType } from '@prisma/client';
import { Job } from 'bullmq';
import path from 'path';
import { PrismaService } from 'src/prisma/prisma.service';
import { StorageService } from 'src/storage/storage.service';
import { TaskService } from 'src/task/task.service';
import { crawl, CrawlData } from 'src/utils/crawler';
import { loadDocs } from 'src/utils/document.loader';
import { SOURCE_WORKER } from './constant';

@Processor(SOURCE_WORKER, {
  concurrency: 10,
})
export class SourceWorker extends WorkerHost {
  constructor(
    private readonly prismaService: PrismaService,
    private storageService: StorageService,
    private readonly configService: ConfigService,
    private readonly taskService: TaskService,
  ) {
    super();
  }
  async process(job: Job<Source & { refresh?: boolean }>): Promise<boolean> {
    const source = job.data;
    try {
      await this.beforeProcess(source);
      await job.updateProgress(10); // Cập nhật tiến trình

      if (source.type === 'WEBSITE') {
        await this.processWebSource(source, job);
      } else if (source.type === 'FILE') {
        await this.processFileSource(source, job);
      } else if (source.type === 'TEXT') {
        await this.processTextSource(source, job);
      }

      await this.afterProcess(source);
      await job.updateProgress(100);
      return true;
    } catch (e: any) {
      Logger.error(
        `Failed when processing source with id: ${source.id}`,
        e.stack,
        'SourceWorker',
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

  async processWebSource(source: Source & { refresh?: boolean }, job: Job) {
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
        maxUrlsToCrawl: source.fetchSetting?.maxUrlsToCrawl || 25,
        exclude: source.fetchSetting?.excludePattern,
        fileMatch: source.fetchSetting?.filePattern
          ? source.fetchSetting.filePattern
          : '',
      });
    }
    job.updateProgress(30);

    if (urls?.length) {
      const filesUrl: CrawlData[] = [];
      const websUrl: CrawlData[] = [];

      // Split urls into files and webs
      urls.forEach((url) => {
        if (url.type === 'FILE') {
          filesUrl.push(url);
        } else {
          websUrl.push(url);
        }
      });
      Logger.debug(
        `Crawled ${filesUrl.length} files and ${websUrl.length} webs, source id: ${source.id}`,
        'SourceWorker',
      );
      job.updateProgress(50);

      // Download all files and save to storage
      const files = (
        await this.taskService.addTasks(
          filesUrl.map(async (url) => {
            try {
              const fileUrl = await this.storageService.saveFile(url.url);
              return { name: url.url, url: fileUrl };
            } catch (_e) {
              return null;
            }
          }),
          {
            maxConcurrencies: 5,
          },
        )
      ).filter((file) => file !== null);
      Logger.debug(`Downloaded ${files.length} files`, 'SourceWorker');
      job.updateProgress(70);

      const storageBasePath = this.configService.get('fileStoragePath');
      const fileDocument: Document[] = await loadDocs(
        files.map((file) => {
          if (file.url.startsWith('STORAGE::')) {
            const filePath = path.join(
              storageBasePath,
              file.url.replace('STORAGE::', ''),
            );
            return filePath;
          } else {
            return file.url;
          }
        }),
      );
      job.updateProgress(80);

      // Save all files and webs to database
      await this.prismaService.document.createMany({
        data: fileDocument
          .map((doc) => ({
            pageContent: doc.pageContent,
            metadata: JSON.stringify(doc.metadata),
            sourceId: source.id,
            chatflowId: source.chatflowId,
          }))
          .concat(
            websUrl.map((url) => ({
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
          ),
      });

      return await this.prismaService.source.update({
        where: {
          id: source.id,
        },
        data: {
          urls: websUrl
            .map((url) => ({ url: url.url, type: 'URL' as UrlType }))
            .concat(files.map((file) => ({ url: file.name, type: 'FILE' }))),
          files: files,
        },
      });
    } else {
      return source;
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

  async processFileSource(source: Source, job: Job) {
    const files = source.files;
    if (files?.length) {
      const storageBasePath = this.configService.get('fileStoragePath');
      const fileDocument: Document[] = await loadDocs(
        files.map((file) => {
          if (file.url.startsWith('STORAGE::')) {
            const filePath = path.join(
              storageBasePath,
              file.url.replace('STORAGE::', ''),
            );
            return filePath;
          } else {
            return file.url;
          }
        }),
      );
      job.updateProgress(80);

      await this.prismaService.document.createMany({
        data: fileDocument.map((doc) => ({
          pageContent: doc.pageContent,
          metadata: JSON.stringify(doc.metadata),
          sourceId: source.id,
          chatflowId: source.chatflowId,
        })),
      });
    }
  }

  async processTextSource(source: Source, job: Job) {
    const document = new Document({
      pageContent: source.text,
      metadata: {
        name: source.name,
        source: source.name,
        title: source.name,
      },
    });
    await this.prismaService.document.create({
      data: {
        pageContent: document.pageContent,
        metadata: JSON.stringify(document.metadata),
        sourceId: source.id,
        chatflowId: source.chatflowId,
      },
    });
    job.updateProgress(90);
  }
}
