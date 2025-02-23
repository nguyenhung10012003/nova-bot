import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Source } from "@prisma/client";
import { Queue } from "bullmq";

@Injectable()
export class CrawlService {
  constructor(@InjectQueue('crawl') private crawlQueue: Queue<Source>) {}

  async addCrawlJob(name: string, job: Source) {
    this.crawlQueue.add(name, job)
  }

  async crawl() {
    
  }
}