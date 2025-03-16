import { Injectable, Module } from '@nestjs/common';

interface TaskOptions {
  maxConcurrencies?: number;
  delay?: number;
}

@Injectable()
export class TaskService {
  async addTasks<T>(tasks: Promise<T>[], options: TaskOptions = {}): Promise<T[]> {
    const { maxConcurrencies = 1, delay = 0 } = options;
    const results: T[] = [];
    const queue: Promise<void[]>[] = [];

    for (let i = 0; i < tasks.length; i += maxConcurrencies) {
      const batch = tasks.slice(i, i + maxConcurrencies).map(async (task, index) => {
        if (index > 0 && delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
        results.push(await task);
      });
      queue.push(Promise.all(batch));
      await Promise.all(batch); // Chờ batch hiện tại hoàn thành trước khi tiếp tục
    }
    
    await Promise.all(queue);
    return results;
  }
}