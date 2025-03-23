import { Injectable } from '@nestjs/common';

interface TaskOptions {
  maxConcurrencies?: number;
  delay?: number;
}

@Injectable()
export class TaskService {
  async addTasks<T>(
    tasks: Promise<T>[],
    options: TaskOptions = {},
  ): Promise<T[]> {
    const { maxConcurrencies = 1, delay = 0 } = options;
    const results: T[] = [];

    for (let i = 0; i < tasks.length; i += maxConcurrencies) {
      const batch = tasks
        .slice(i, i + maxConcurrencies)
        .map(async (task, index) => {
          if (index > 0 && delay > 0) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }

          try {
            const result = await task;
            return result;
          } catch (error) {
            console.error('Error in task batch processing:', error);
            return null as unknown as T;
          }
        });

      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
    }

    return results;
  }
}
