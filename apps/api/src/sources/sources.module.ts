import { Module } from '@nestjs/common';
import { CrawlModule } from 'src/crawl/crawl.module';
import { SourcesController } from './sources.controller';
import { SourcesService } from './sources.service';

@Module({
  imports: [CrawlModule],
  controllers: [SourcesController],
  providers: [SourcesService],
})
export class SourcesModule {}
