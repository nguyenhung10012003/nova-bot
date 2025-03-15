export const SOURCE_WORKER = 'SOURCE_WORKER';

export const WORKERS = [SOURCE_WORKER] as const;

export type WorkerName = typeof WORKERS[number];

export type QueueName = WorkerName;