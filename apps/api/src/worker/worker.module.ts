import { Global, Module } from "@nestjs/common";
import { WORKERS } from "./constant";
import { BullModule } from "@nestjs/bullmq";
import { WorkerService } from "./worker.service";
import { SourceWorker } from "./source.worker";

@Global()
@Module({
  imports: [
    ...WORKERS.map((name) => {
      return BullModule.registerQueue({
        name,
      });
    })
  ],
  providers: [WorkerService, SourceWorker],
  exports: [WorkerService],
})
export class WorkerModule {}