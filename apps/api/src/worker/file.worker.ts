import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Source, UrlType } from '@prisma/client';
import { Job } from 'bullmq';
import { PrismaService } from 'src/prisma/prisma.service';
import { StorageService } from 'src/storage-disk/storage.service';
import { TaskService } from 'src/task/task.service';
import { CrawlData } from 'src/utils/crawler';
import { DOCUMENT_WORKER, FILE_WORKER } from './constant';
import { WorkerService } from './worker.service';

type FileWorkerJobType = Job<{
  filesUrl?: CrawlData[];
  websUrl?: CrawlData[];
  source: Source;
}>;

const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/json',
  'text/plain',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

@Processor(FILE_WORKER, {
  concurrency: 10,
})
export class FileWorker extends WorkerHost {
  constructor(
    private readonly taskService: TaskService,
    private readonly storageService: StorageService,
    private readonly prismaService: PrismaService,
    private readonly workerService: WorkerService,
  ) {
    super();
  }
  async process(job: FileWorkerJobType) {
    const { data } = job;
    const source = data.source;
    if (source.type !== 'WEBSITE') {
      await this.workerService.addJob(
        DOCUMENT_WORKER,
        `document-source-${source.id}`,
        { source },
        {
          attempts: 3,
        },
      );
      return;
    }
    let newFiles = [];
    // Download all files and save to storage
    try {
      if (data.filesUrl?.length) {
        const files = (
          await this.taskService.addTasks(
            data.filesUrl.map(async (crawl) => {
              try {
                Logger.debug(`Downloading file: ${crawl.url}`);
                const fileUrl = await this.storageService.saveFile(crawl.url, {
                  validation: {
                    allowedMimeTypes,
                  },
                });
                if (fileUrl) return { name: crawl.url, url: fileUrl };
                else return null;
              } catch (_e) {
                Logger.error((<any>_e).message, 'FileWorker');
                return null;
              }
            }),
            {
              maxConcurrencies: 5,
            },
          )
        ).filter((file) => file !== null);
        Logger.debug(`Downloaded ${files.length} files. Source: ${source.id}`);
        newFiles = files;
      }
      const newUrls = data.websUrl
        ?.map((crawl) => ({ url: crawl.url, type: UrlType.URL as UrlType }))
        ?.concat(
          newFiles?.map((crawl) => ({ url: crawl.name, type: UrlType.FILE })),
        );

      if (newUrls || newFiles) {
        const updatedSource = await this.prismaService.source.update({
          where: {
            id: source.id,
          },
          data: {
            urls: newUrls,
            files: newFiles,
          },
        });

        await this.workerService.addJob(
          DOCUMENT_WORKER,
          `document-source-${source.id}`,
          { source: updatedSource, web: data.websUrl },
          {
            attempts: 3,
          },
        );
        return;
      }
    } catch (_e) {
      await this.prismaService.source.update({
        where: {
          id: source.id,
        },
        data: {
          sourceStatus: 'ERROR',
        },
      });
    }

    Logger.debug(`No new files or urls. Source: ${source.id}`);
  }
}
