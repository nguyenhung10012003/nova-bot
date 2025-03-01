import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { CrawlService } from './crawl.service';
import { CrawlWorker } from './crawl.worker';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'crawl',
    }),
  ],
  providers: [CrawlService, CrawlWorker],
  exports: [CrawlService],
})
export class CrawlModule {}
