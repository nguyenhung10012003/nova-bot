import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Source } from '@prisma/client';
import { Queue } from 'bullmq';

@Injectable()
export class CrawlService {
  constructor(
    @InjectQueue('crawl')
    private crawlQueue: Queue<Source & { refresh?: boolean }>,
  ) {}

  async addCrawlJob(name: string, job: Source & { refresh?: boolean }) {
    this.crawlQueue.add(name, job);
  }
}
