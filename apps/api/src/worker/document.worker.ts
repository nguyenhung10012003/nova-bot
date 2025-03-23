import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Source } from '@prisma/client';
import { Job } from 'bullmq';
import path from 'path';
import { PrismaService } from 'src/prisma/prisma.service';
import { CrawlData } from 'src/utils/crawler';
import { loadDocs } from 'src/utils/document.loader';
import { DOCUMENT_WORKER } from './constant';

export type DocumentWorkerJobType = Job<{
  source: Source;
  web?: CrawlData[];
}>;

@Processor(DOCUMENT_WORKER, {
  concurrency: 10,
})
export class DocumentWorker extends WorkerHost {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    super();
  }
  async process(job: DocumentWorkerJobType) {
    const { source, web } = job.data;
    Logger.debug(`Processing document source: ${source.id}`);

    try {
      const storageBasePath = this.configService.get('fileStoragePath');
      const fileDocument = await loadDocs(
        source.files.map((file) => {
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
      const batch = await this.prismaService.document.createMany({
        data:
          fileDocument
            ?.map((doc) => ({
              pageContent: doc.pageContent,
              metadata: JSON.stringify(doc.metadata),
              sourceId: source.id,
              chatflowId: source.chatflowId,
            }))
            .concat(
              web?.map((url) => ({
                pageContent: `${url.title} -\n ${url.content}`,
                metadata: JSON.stringify({
                  name: url.title,
                  source: url.url,
                  title: url.title,
                  url: url.url,
                }),
                sourceId: source.id,
                chatflowId: source.chatflowId,
              })) || [],
            ) || [],
      });

      await this.prismaService.source.update({
        where: {
          id: source.id,
        },
        data: {
          sourceStatus: 'PROCESSED',
        },
      });
      Logger.debug(
        `Processed document source: ${source.id}, Number of Document added: ${batch.count}`,
        'DocumentWorker',
      );
    } catch (e) {
      Logger.error(
        `Failed when processing document source with id: ${source.id}`,
        e,
        'DocumentWorker',
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
}
