import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Source } from '@prisma/client';
import {
  FlowJobBase,
  FlowOpts,
  FlowProducer,
  JobsOptions,
  Queue,
} from 'bullmq';
import {
  CRAWL_WORKER,
  DOCUMENT_WORKER,
  FILE_WORKER,
  QueueName,
  UNSTRUCTURED_WORKER,
} from './constant';

export interface FlowJob<T = any> extends FlowJobBase<JobsOptions> {
  data?: T;
  queueName: QueueName;
}

@Injectable()
export class WorkerService {
  private flowProducer: FlowProducer;
  constructor(
    @InjectQueue(CRAWL_WORKER)
    private sourceWorker: Queue<Source & { refresh?: boolean }>,
    @InjectQueue(FILE_WORKER) private fileWorker: Queue,
    @InjectQueue(DOCUMENT_WORKER) private documentWorker: Queue,
    @InjectQueue(UNSTRUCTURED_WORKER) private unstructuredWorker: Queue,
    private readonly configService: ConfigService,
  ) {
    this.flowProducer = new FlowProducer({
      connection: {
        host: this.configService.get('REDIS_HOST'),
        port: this.configService.get('REDIS_PORT'),
        password: this.configService.get('REDIS_PASSWORD'),
      },
    });
  }

  async addJob<T = any>(
    queueName: QueueName,
    jobName: string,
    data: T,
    options: JobsOptions = {
      removeOnComplete: true,
      removeOnFail: true,
    },
  ) {
    Logger.debug(`Add job ${jobName} to queue ${queueName}`, 'WorkerService');
    switch (queueName) {
      case CRAWL_WORKER:
        return this.sourceWorker.add(
          jobName,
          data as Source & { refresh?: boolean },
          options,
        );
      case FILE_WORKER:
        return this.fileWorker.add(jobName, data, options);
      case DOCUMENT_WORKER:
        return this.documentWorker.add(jobName, data, options);
      case UNSTRUCTURED_WORKER:
        return this.unstructuredWorker.add(jobName, data, options);
      default:
        break;
    }
  }

  async removeJob(queueName: QueueName, jobId: string) {
    Logger.debug(
      `Remove job ${jobId} from queue ${queueName}`,
      'WorkerService',
    );
    switch (queueName) {
      case CRAWL_WORKER:
        await this.sourceWorker.remove(jobId);
        break;
    }
  }

  async getJob(queueName: QueueName, jobId: string) {
    switch (queueName) {
      case CRAWL_WORKER:
        return this.sourceWorker.getJob(jobId);
    }
  }

  async addFlowJob<T = any>(flow: FlowJob<T>, options?: FlowOpts) {
    this.flowProducer.add(flow, options);
  }

  async addSourceFlow(source: Source & { refresh?: boolean }) {
    const flow: FlowJob<Source & { refresh?: boolean }> = {
      queueName: DOCUMENT_WORKER,
      name: `document-source-${source.id}`,
      children: [
        {
          name: `download-files-${source.id}`,
          queueName: FILE_WORKER,
          data: {},
          children: [
            {
              name: `crawl-source-${source.id}`,
              queueName: CRAWL_WORKER,
              data: source,
            },
          ],
        },
      ],
    };
    this.addFlowJob(flow);
    Logger.debug(`Add flow job for source ${source.id}`, 'WorkerService');
  }
}
