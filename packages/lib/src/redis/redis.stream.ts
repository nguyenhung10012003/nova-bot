import Redis from 'ioredis';

export class RedisStream {
  redisClient: Redis;

  constructor(redis: Redis) {
    this.redisClient = redis;
  }

  protected async ackID(streamName: string, groupName: string, id: string) {
    if (!this.redisClient) return;
    await this.redisClient.xack(streamName, groupName, id);
    await this.redisClient.xdel(streamName, id);
  }

  protected async publish<MessageType = any>(
    channel: string,
    message: MessageType,
  ) {
    if (!this.redisClient) return;
    await this.redisClient.publish(channel, JSON.stringify(message));
  }

  protected async subscribe<MessageType = any>(
    channel: string,
    handler: (channel: string, message: MessageType) => void,
  ) {
    if (!this.redisClient) return;
    this.redisClient.subscribe(channel, (err) => {
      if (err) {
        throw new Error(`Error subscribing to channel ${channel}`);
      }
      this.redisClient.on('message', (channel, message) => {
        handler(channel, JSON.parse(message));
      });
    });
  }

  async disconnect() {
    if (this.redisClient) {
      this.redisClient.disconnect();
    }
  }
}
