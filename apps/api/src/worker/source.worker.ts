import { Document } from '@langchain/core/documents';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Source } from '@prisma/client';
import { Job } from 'bullmq';
import path from 'path';
import { PrismaService } from 'src/prisma/prisma.service';
import { StorageService } from 'src/storage/storage.service';
import { crawl, CrawlData } from 'src/utils/crawler';
import { loadDocs } from 'src/utils/document.loader';
import { createMinimatchPattern } from 'src/utils/file';
import { SOURCE_WORKER } from './constant';

@Processor(SOURCE_WORKER)
export class SourceWorker extends WorkerHost {
  constructor(
    private readonly prismaService: PrismaService,
    private storageService: StorageService,
    private readonly configService: ConfigService,
  ) {
    super();
  }
  async process(job: Job<Source & { refresh?: boolean }>): Promise<boolean> {
    const source = job.data;
    try {
      await this.beforeProcess(source);
      if (source.type === 'WEBSITE') {
        await this.processWebSource(source);
      } else if (source.type === 'FILE') {
        await this.processFileSource(source);
      } else if (source.type === 'TEXT') {
        await this.processTextSource(source);
      }
      await this.afterProcess(source);
      return true;
    } catch (e: any) {
      Logger.error(
        `Failed when process source with id: ${source.id}`,
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

  async processWebSource(source: Source & { refresh?: boolean }) {
    let urls: CrawlData[] = [];
    if (source.refresh) {
      urls = await crawl({
        urls: [source.rootUrl],
        match: source.fetchSetting?.matchPattern || `${source.rootUrl}/*`,
        maxUrlsToCrawl: source.fetchSetting?.maxUrlsToCrawl || 25,
        fileMatch: source.fetchSetting?.filePattern
          ? createMinimatchPattern(source.fetchSetting.filePattern)
          : '',
      });
    } else if (source.urls.length) {
      urls = await crawl({
        urls: source.urls.map((url) => url.url),
        match: source.fetchSetting?.matchPattern || `${source.rootUrl}/*`,
        maxUrlsToCrawl: source.fetchSetting?.maxUrlsToCrawl || 25,
        fileMatch: source.fetchSetting?.filePattern
          ? createMinimatchPattern(source.fetchSetting.filePattern)
          : '',
      });
    }

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

      // Download all files and save to storage
      const files = (
        await Promise.all(
          filesUrl.map(async (url) => {
            try {
              const fileUrl = await this.storageService.saveFile(url.url);
              return { name: url.url, url: fileUrl };
            } catch (e) {
              Logger.error(
                `Failed to save file from url: ${url.url}`,
                e,
                'SourceWorker',
              );
              return null;
            }
          }),
        )
      ).filter((file) => file !== null);
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
          urls: urls.map((url) => ({ url: url.url, type: url.type || 'URL' })),
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

  async processFileSource(source: Source) {
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

  async processTextSource(source: Source) {
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
  }
}
