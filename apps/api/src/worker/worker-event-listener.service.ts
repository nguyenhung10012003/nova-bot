import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, QueueEvents } from 'bullmq';
import { CRAWL_WORKER, DOCUMENT_WORKER, FILE_WORKER } from './constant';

@Injectable()
export class WorkerEventListenerService implements OnModuleInit {
  private readonly logger = new Logger(WorkerEventListenerService.name);
  private queueEvents: QueueEvents[] = [];

  constructor(
    @InjectQueue(CRAWL_WORKER) private readonly crawlQueue: Queue,
    @InjectQueue(FILE_WORKER) private readonly fileQueue: Queue,
    @InjectQueue(DOCUMENT_WORKER) private readonly documentQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.listenToQueueEvents(CRAWL_WORKER, this.crawlQueue);
    this.listenToQueueEvents(FILE_WORKER, this.fileQueue);
    this.listenToQueueEvents(DOCUMENT_WORKER, this.documentQueue);
  }

  private listenToQueueEvents(queueName: string, _queue: Queue) {
    const queueEvents = new QueueEvents(queueName, {
      connection: {
        host: this.configService.get('REDIS_HOST'),
        port: this.configService.get('REDIS_PORT'),
        password: this.configService.get('REDIS_PASSWORD'),
      },
    });
    this.queueEvents.push(queueEvents);

    queueEvents.on('waiting', ({ jobId }) => {
      this.logger.debug(`[${queueName}] Job ${jobId} is waiting`);
    });

    queueEvents.on('active', ({ jobId }) => {
      this.logger.debug(`[${queueName}] Job ${jobId} is now active`);
    });

    queueEvents.on('completed', ({ jobId }) => {
      this.logger.debug(`[${queueName}] Job ${jobId} completed.`);
    });

    queueEvents.on('failed', ({ jobId, failedReason }) => {
      this.logger.error(`[${queueName}] Job ${jobId} failed: ${failedReason}`);
    });

    queueEvents.on('stalled', ({ jobId }) => {
      this.logger.warn(`[${queueName}] Job ${jobId} is stalled`);
    });

    queueEvents.on('progress', ({ jobId, data }) => {
      this.logger.debug(
        `[${queueName}] Job ${jobId} progress: ${JSON.stringify(data)}`,
      );
    });

    queueEvents.on('removed', ({ jobId }) => {
      this.logger.debug(`[${queueName}] Job ${jobId} has been removed`);
    });

    queueEvents.on('delayed', ({ jobId }) => {
      this.logger.debug(`[${queueName}] Job ${jobId} is delayed`);
    });

    this.logger.debug(`[${queueName}] Listening to job events...`);
  }
}
