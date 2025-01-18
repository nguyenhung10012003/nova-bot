import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class SchedulerService {
  timeZone: string = 'Asia/Ho_Chi_Minh';
  constructor(private scheduleRegistry: SchedulerRegistry) {}

  public async addCronJob(
    name: string,
    cron: string,
    callback: () => void | Promise<void>,
    options?: {
      runOnInit?: boolean;
      timeZone?: string;
    },
  ) {
    this.timeZone = process.env.TIMEZONE || 'Asia/Ho_Chi_Minh';
    const job = new CronJob(
      cron,
      callback,
      null,
      true,
      options?.timeZone || this.timeZone,
      null,
      options?.runOnInit,
    );
    this.scheduleRegistry.addCronJob(name, job);
    job.start();
    Logger.debug(`Cron job ${name} added`);
  }

  public async removeCronJob(name: string) {
    if (!this.scheduleRegistry.doesExist('cron', name)) {
      return;
    }
    this.scheduleRegistry.deleteCronJob(name);
  }
}
