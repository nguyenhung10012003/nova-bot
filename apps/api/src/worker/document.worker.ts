import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Source } from '@prisma/client';
import { Job } from 'bullmq';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaService } from 'src/prisma/prisma.service';
import { StorageService } from 'src/storage-disk/storage.service';
import { extractDocument } from 'src/unstructured/unstructured.api';
import { CrawlData } from 'src/utils/crawler';
import { Strategy } from 'unstructured-client/sdk/models/shared';
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
    private readonly storageService: StorageService,
  ) {
    super();
  }
  async process(job: DocumentWorkerJobType) {
    const { source, web } = job.data;
    Logger.debug(`Processing document source: ${source.id}`);

    try {
      const storageBasePath = this.configService.get('fileStoragePath');
      const partitions = await Promise.all(
        source.files.map(async (file) => {
          const path = file.url.startsWith('STORAGE::')
            ? join(storageBasePath, file.url.replace('STORAGE::', ''))
            : file.url;
          const documents = await this.unstructuredLoadDocs(path, file.name);
          return documents;
        }),
      );

      const documents = partitions.flat();

      const allDocuments =
        documents
          ?.map((doc: any) => ({
            pageContent: doc.text,
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
          ) || [];
      // Save all files and webs to database
      let batch;
      if (allDocuments.length > 0) {
        batch = await this.prismaService.document.createMany({
          data: allDocuments,
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
      Logger.debug(
        `Processed document source: ${source.id}, Number of Document added: ${batch?.count}`,
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

  async unstructuredLoadDocs(path: string, name: string) {
    try {
      const data = readFileSync(path);
      const documents = await extractDocument({
        files: {
          content: data,
          fileName: name,
        },
        chunkingStrategy: 'by_title',
        strategy: Strategy.Auto,
        languages: ['vie'],
        overlap: 200,
        newAfterNChars: 1500,
        maxCharacters: 1000,
      });

      return documents;
    } catch (_e) {
      return [];
    }
  }
}
