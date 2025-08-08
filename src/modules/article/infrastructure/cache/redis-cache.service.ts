import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { CacheService } from '../../application/services/cache.service';
import { CacheOptions } from '../../domain/interfaces/pagination.interface';

@Injectable()
export class RedisCacheService extends CacheService {
  private client: RedisClientType;
  private readonly defaultTtl: number = 300;

  constructor(private readonly configService: ConfigService) {
    super();
    this.client = createClient({
      url: this.configService.get<string>('REDIS_URL') || 'redis://localhost:6399',
    });

    this.client.on('error', (err) => console.log('Redis Client Error', err));
    this.client.connect();
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);

      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const ttl = options?.ttl || this.defaultTtl;
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error(`Cache delete pattern error for pattern ${pattern}:`, error);
    }
  }

  generateKey(prefix: string, params: Record<string, any>): string {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== null),
    );
    const sortedKeys = Object.keys(filteredParams).sort();
    const paramString = sortedKeys.map((key) => `${key}:${filteredParams[key]}`).join('|');

    return paramString ? `${prefix}:${paramString}` : prefix;
  }

  async onModuleDestroy() {
    await this.client.disconnect();
  }
}
