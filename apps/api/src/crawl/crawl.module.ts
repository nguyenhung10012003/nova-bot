import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { config } from "src/config";
import { CrawlService } from "./crawl.service";
import { CrawlWorker } from "./crawl.worker";

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'crawl',
      connection: config.redis
    })
  ],
  providers: [CrawlService, CrawlWorker],
  exports: [CrawlService]
})
export class CrawlModule {}