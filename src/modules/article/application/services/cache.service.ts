import { Injectable } from '@nestjs/common';
import { CacheOptions } from '../../domain/interfaces/pagination.interface';

@Injectable()
export abstract class CacheService {
  abstract get<T>(key: string): Promise<T | null>;
  abstract set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  abstract del(key: string): Promise<void>;
  abstract delPattern(pattern: string): Promise<void>;
  abstract generateKey(prefix: string, params: Record<string, any>): string;
}
