import { Consumer } from '@nova/lib';
import { Logger } from '@nova/utils';
import * as dotenv from 'dotenv';
import Redis from 'ioredis';
import { crawl, getUrls } from './core.js';
import { crawlEventHandler } from './events/crawl-event.handler.js';

dotenv.config();

const main = async () => {
  const redis = new Redis({
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: 3,
  });

  const consumer = new Consumer({
    redisClient: redis,
    consumerName: 'CrawlerCon',
    groupName: 'CrawlerGroup',
    streams: [
      {
        streamKeyName: 'CrawlerStream',
        eventHandler: crawlEventHandler,
      },
    ],
  });

  consumer.consume();
  Logger.log('✅ Crawler is running', 'Crawler Service');
};

main();
