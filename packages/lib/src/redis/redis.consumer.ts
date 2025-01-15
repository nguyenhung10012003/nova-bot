import Redis from 'ioredis';
import { EventMessage, IMessageHandler } from '../events';
import { RedisStream } from './redis.stream';

export type ConsumerOptions = {
  redisClient: Redis;
  consumerName: string;
  groupName: string;
  readItems?: number;
  blockIntervalMS?: number;
  streams?: {
    streamKeyName: string;
    eventHandler: IMessageHandler;
  }[];
};

export class Consumer extends RedisStream {
  consumerName: string;
  groupName: string;
  readItems: number;
  blockIntervalMS: number;
  streams?: {
    streamKeyName: string;
    eventHandler: IMessageHandler;
  }[];

  constructor(options: ConsumerOptions) {
    super(options.redisClient);
    this.consumerName = options.consumerName;
    this.groupName = options.groupName;
    this.readItems = options.readItems || 5;
    this.blockIntervalMS = options.blockIntervalMS || 1000;
    this.streams = options.streams;
  }

  async consume() {
    if (!this.streams) {
      return;
    }
    const streams = this.streams;
    const groupName = this.groupName;
    const consumerName = this.consumerName;
    const streamsWithIds = streams.flatMap((stream) => [
      stream.streamKeyName,
      '>',
    ]);

    await Promise.all(
      streams.map(async (stream) => {
        try {
          await this.redisClient.xgroup(
            'CREATE',
            stream.streamKeyName,
            groupName,
            '$',
            'MKSTREAM',
          );
        } catch (err: any) {
          if (!err.message.includes('BUSYGROUP')) {
            throw err;
          }
        }
      }),
    );

    while (true) {
      try {
        const dataArr: any[] = await this.redisClient.xreadgroup(
          'GROUP',
          groupName,
          consumerName,
          'COUNT',
          this.readItems,
          'BLOCK',
          this.blockIntervalMS,
          'STREAMS',
          ...streamsWithIds,
        );

        if (dataArr && dataArr.length) {
          for (const [streamName, messages] of dataArr) {
            const stream = streams.find((s) => s.streamKeyName == streamName);
            for (const [key, value] of messages) {
              const jsonString = value[value.indexOf('message') + 1];
              const message: EventMessage = JSON.parse(jsonString);
              if (stream && message) {
                const messageId = key;
                const handler = stream.eventHandler;
                let ack = true;
                let error = null;
                let data = null;
                try {
                  data = await handler(message, messageId);
                  ack = ack && data;
                } catch (err) {
                  ack = false;
                  error = err;
                }
                if (ack) {
                  await this.ackID(streamName, groupName, messageId);
                  await this.publish(`ack:${messageId}`, { data });
                } else {
                  await this.ackID(streamName, groupName, messageId);
                  await this.publish(`ack:${messageId}`, { error });
                }
              }
            }
          }
        }
      } catch (error) {
        throw error;
      }
    }
  }
}
