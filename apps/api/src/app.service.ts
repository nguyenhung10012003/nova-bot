import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CronExpression } from '@nestjs/schedule';
import path from 'path';
import { flowiseApi } from './flowise';
import { PrismaService } from './prisma/prisma.service';
import { SchedulerService } from './scheduler/scheduler.service';
import { crawl } from './utils/crawler';
import { loadDocs } from './utils/document.loader';
import { downloadFileFromUrl } from './utils/file';
import { chunk } from './utils/splitter';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @Inject() private schedulerService: SchedulerService,
    @Inject() private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    this.schedulerService.addCronJob(
      'Crawl data',
      CronExpression.EVERY_30_MINUTES,
      async () => {
        Logger.log('Crawling https://ftech.ai', 'AppService');
        const data = await crawl({
          urls: ['https://ftech.ai', 'http://localhost:3000'],
          match: 'https://ftech.ai/*',
          fileOptions: {
            extensionMatch: 'pdf',
          },
        });

        if (data.items.length) {
          const documents = data.items.map((item) => ({
            pageContent: item.html,
            metadata: JSON.stringify({
              title: item.title,
              url: item.url,
            }),
          }));
          const fileStoragePath = this.config.get<string>('fileStoragePath');
          Logger.debug('Starting download files', 'AppService');
          await Promise.all(
            data.items.map(async (item) => {
              if (item.fileUrls.length) {
                const fileNames: string[] = [];
                await Promise.all(
                  item.fileUrls.map(async (fileUrl: string) => {
                    try {
                      const fileName = await downloadFileFromUrl(fileUrl, {
                        dirPath: fileStoragePath,
                      });
                      fileNames.push(fileName);
                    } catch (error) {
                      // Logger.error(`Failed to download file: ${fileUrl}`, error);
                    }
                  }),
                );

                // console.log(await Promise.all(fileNames));
                const docs = await loadDocs(
                  fileNames.map((fileName) =>
                    path.join(fileStoragePath, fileName),
                  ),
                );
                documents.push(
                  ...docs.map((doc) => ({
                    ...doc,
                    metadata: JSON.stringify({
                      title: item.title,
                      url: item.url,
                    }),
                  })),
                );
              }
            }),
          );

          Logger.debug('Saving data to database', 'AppService');
          await this.prisma.document.createMany({
            data: documents,
          });
        }

        flowiseApi.upsertVector({
          chatflowId: '2d81b9b3-55b3-4c92-9cbb-6d014a2e8fd8',
        });
      },
      {
        runOnInit: true,
      },
    );
  }

  async upsertChatflow() {
    const document = await this.prisma.document.findMany();
    const parsedDocument = document.map((doc) => ({
      metadata: JSON.parse(doc.metadata) as Record<string, any>,
      pageContent: doc.pageContent,
    }));

    return chunk(parsedDocument);
  }
}
