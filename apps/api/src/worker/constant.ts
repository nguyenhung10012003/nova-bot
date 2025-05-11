export const CRAWL_WORKER = 'SOURCE_WORKER';

export const FILE_WORKER = 'FILE_WORKER';

export const DOCUMENT_WORKER = 'DOCUMENT_WORKER';

export const UNSTRUCTURED_WORKER = 'UNSTRUCTURED_WORKER';

export const WORKERS = [CRAWL_WORKER, FILE_WORKER, DOCUMENT_WORKER, UNSTRUCTURED_WORKER] as const;

export type WorkerName = (typeof WORKERS)[number];

export type QueueName = WorkerName;
