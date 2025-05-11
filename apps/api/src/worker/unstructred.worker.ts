import { Processor, WorkerHost } from '@nestjs/bullmq';
import { UNSTRUCTURED_WORKER } from './constant';
import { Job } from 'bullmq';
import { PrismaService } from 'src/prisma/prisma.service';

@Processor(UNSTRUCTURED_WORKER)
export class UnstructuredWorker extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super();
  }
  async process(job: Job, token?: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

}