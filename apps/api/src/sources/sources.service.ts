import { Injectable, OnModuleInit } from '@nestjs/common';
import { File } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SchedulerService } from 'src/scheduler/scheduler.service';
import { CRAWL_WORKER } from 'src/worker/constant';
import { WorkerService } from 'src/worker/worker.service';
import { CreateSourceDto } from './sources.dto';

@Injectable()
export class SourcesService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workerService: WorkerService,
    private readonly schedulerService: SchedulerService,
  ) {}

  async onModuleInit() {
    const sources = await this.prisma.source.findMany();
    for (const source of sources) {
      if (
        source.fetchSetting?.autoFetch &&
        source.fetchSetting?.cronExpression
      ) {
        this.schedulerService.addCronJob(
          `auto-crawl-${source.id}`,
          source.fetchSetting.cronExpression,
          async () => {
            await this.workerService.addJob(
              CRAWL_WORKER,
              `crawl-source-${source.id}`,
              { ...source, refresh: true },
            );
          },
        );
      }
    }
  }

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

  async createSource(data: CreateSourceDto & { files?: File[] }) {
    const source = await this.prisma.source.create({
      data,
    });

    if (data.type === 'TEXT' && source.text.length) {
      await this.prisma.document.create({
        data: {
          sourceId: source.id,
          pageContent: source.text.join('\n'),
          metadata: JSON.stringify({
            name: source.name,
          }),
          chatflowId: source.chatflowId,
        },
      });

      return source;
    }

    // await this.workerService.addJob(
    //   SOURCE_WORKER,
    //   `crawl-source-${source.id}`,
    //   { ...source, refresh: true },
    // );
    if (source.fetchSetting?.autoFetch && source.fetchSetting?.cronExpression) {
      await this.schedulerService.addCronJob(
        `auto-crawl-${source.id}`,
        source.fetchSetting.cronExpression,
        async () => {
          await this.workerService.addJob(
            CRAWL_WORKER,
            `crawl-source-${source.id}`,
            { ...source, refresh: true },
          );
        },
      );
    }

    return source;
  }

  async updateSource(
    id: string,
    data: Partial<CreateSourceDto> & { files?: File[] },
    renewDocs?: boolean,
  ) {
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

    if (data.type === 'TEXT' && source.text.length) {
      await this.prisma.document.deleteMany({
        where: {
          sourceId: source.id,
        },
      });

      await this.prisma.document.create({
        data: {
          sourceId: source.id,
          pageContent: source.text.join('\n'),
          metadata: JSON.stringify({
            name: source.name,
          }),
          chatflowId: source.chatflowId,
        },
      });

      return source;
    }

    if (source.fetchSetting?.autoFetch && source.fetchSetting?.cronExpression) {
      await this.schedulerService.removeCronJob(`auto-crawl-${source.id}`);
      await this.schedulerService.addCronJob(
        `auto-crawl-${source.id}`,
        source.fetchSetting.cronExpression,
        async () => {
          await this.workerService.addJob(
            CRAWL_WORKER,
            `crawl-source-${source.id}`,
            { ...source, refresh: true },
          );
        },
      );
    } else {
      await this.schedulerService.removeCronJob(`auto-crawl-${source.id}`);
    }

    if (renewDocs) {
      await this.workerService.addJob(CRAWL_WORKER, `crawl-source-${source.id}`, {
        ...source,
        refresh: false,
      });
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
    this.workerService.addJob(CRAWL_WORKER, `crawl-source-${source.id}`, {
      ...source,
      refresh: true,
    });
    // await this.workerService.addSourceFlow({ ...source, refresh: true });
    return source;
  }

  async deleteSource(id: string) {
    const source = await this.prisma.source.delete({
      where: { id },
    });

    await this.schedulerService.removeCronJob(`auto-crawl-${source.id}`);
    return source;
  }
}
