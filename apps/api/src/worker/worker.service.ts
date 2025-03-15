import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Source } from '@prisma/client';
import { JobsOptions, Queue } from 'bullmq';
import {  QueueName, SOURCE_WORKER } from './constant';

@Injectable()
export class WorkerService {
  constructor(
    @InjectQueue(SOURCE_WORKER)
    private sourceWorker: Queue<Source & { refresh?: boolean }>,
  ) {}

  async addJob<T = any>(
    queueName: QueueName,
    jobName: string,
    data: T,
    options?: JobsOptions,
  ) {
    Logger.debug(`Add job ${jobName} to queue ${queueName}`, 'WorkerService');
    switch (queueName) {
      case SOURCE_WORKER:
        return this.sourceWorker.add(
          jobName,
          data as Source & { refresh?: boolean },
          options,
        );
    }
  }

  async removeJob(queueName: QueueName, jobId: string) {
    Logger.debug(
      `Remove job ${jobId} from queue ${queueName}`,
      'WorkerService',
    );
    switch (queueName) {
      case SOURCE_WORKER:
        await this.sourceWorker.remove(jobId);
        break;
    }
  }

  async getJob(queueName: QueueName, jobId: string) {
    switch (queueName) {
      case SOURCE_WORKER:
        return this.sourceWorker.getJob(jobId);
    }
  }
}
