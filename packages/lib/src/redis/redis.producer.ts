import { EventMessage } from "../events";
import { RedisStream } from "./redis.stream";
import Redis from 'ioredis';

export type ProducerOptions = {
  redisClient: Redis;
  streamKeyName: string;
};
export class Producer extends RedisStream {
  streamKeyName: string;
  constructor(options: ProducerOptions) {
    super(options.redisClient);
    this.streamKeyName = options.streamKeyName;
  }

  async produceMessage<DataType = any>(message: EventMessage<DataType>) {
    await this.redisClient.xadd(
      this.streamKeyName,
      '*', // auto-generate id
      'message',
      JSON.stringify(message),
    );
  }

  async produceAndWaitForAck<DataType = any, ReturnType = any>(
    message: EventMessage<DataType>,
  ): Promise<ReturnType> {
    const messageId = await this.redisClient.xadd(
      this.streamKeyName,
      '*', // auto-generate id
      'message',
      JSON.stringify(message),
    );
    return new Promise((resolve, reject) => {
      this.subscribe(`ack:${messageId}`, (_channel, message) => {
        if (message.data) {
          resolve(message.data);
        } else if (message.error) {
          reject(message.error);
        } else {
          reject(new Error('Unknown error'));
        }
      });
    });
  }
}
