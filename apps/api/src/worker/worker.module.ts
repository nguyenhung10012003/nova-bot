import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { WORKERS } from './constant';
import { CrawlWorker } from './crawl.worker';
import { DocumentWorker } from './document.worker';
import { FileWorker } from './file.worker';
import { WorkerService } from './worker.service';
import { WorkerEventListenerService } from './worker-event-listener.service';
import { UnstructuredWorker } from './unstructred.worker';

@Global()
@Module({
  imports: [
    ...WORKERS.map((name) => {
      return BullModule.registerQueue({
        name,
      });
    }),
  ],
  providers: [WorkerService, CrawlWorker, DocumentWorker, FileWorker, WorkerEventListenerService, UnstructuredWorker],
  exports: [WorkerService],
})
export class WorkerModule {}
