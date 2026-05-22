import { createClient, RedisClientType } from 'redis';
import { Logger } from '@serviceos/shared';

const logger = new Logger('Redis');

export class Redis {
  private client: RedisClientType;
  private static instance: Redis;

  private constructor(url: string) {
    this.client = createClient({ url }) as RedisClientType;

    this.client.on('error', (err) => logger.error('Redis error', err));
    this.client.on('connect', () => logger.info('Redis connected'));
  }

  static getInstance(url: string = process.env.REDIS_URL || ''): Redis {
    if (!Redis.instance) {
      Redis.instance = new Redis(url);
    }
    return Redis.instance;
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setEx(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  async getJSON(key: string): Promise<unknown | null> {
    const value = await this.get(key);
    return value ? JSON.parse(value) : null;
  }

  async setJSON(key: string, value: unknown, ttl?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttl);
  }

  async lpush(key: string, value: string): Promise<void> {
    await (this.client as any).lPush(key, value);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return (this.client as any).lRange(key, start, stop);
  }

  async incr(key: string): Promise<number> {
    return (this.client as any).incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await (this.client as any).expire(key, seconds);
  }

  async close(): Promise<void> {
    await this.client.quit();
    logger.info('Redis connection closed');
  }

  async healthCheck(): Promise<boolean> {
    try {
      const pong = await (this.client as any).ping();
      return pong === 'PONG';
    } catch {
      return false;
    }
  }
}
