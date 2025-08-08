import { Injectable } from '@nestjs/common';
import { OtpRepository } from '../../domain/repositories/otp.repository';
import { Otp } from '../../domain/entities/otp.entity';
import * as redis from 'redis';

@Injectable()
export class RedisOtpRepository implements OtpRepository {
  private redisClient: redis.RedisClientType;

  constructor() {
    this.redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6399',
    });
    
    this.redisClient.on('error', (err) => console.error('Redis Client Error', err));
    this.redisClient.connect();
  }

  async save(otp: Otp): Promise<Otp> {
    const key = `otp:${otp.userId}`;
    const data = {
      id: otp.id,
      userId: otp.userId,
      code: otp.code,
      expiresAt: otp.expiresAt.toISOString(),
      isUsed: otp.isUsed,
      createdAt: otp.createdAt.toISOString(),
    };

    // Store OTP data with TTL (Time To Live) in seconds
    const ttlSeconds = Math.ceil((otp.expiresAt.getTime() - Date.now()) / 1000);
    
    await this.redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
    
    return otp;
  }

  async findByUserIdAndCode(userId: string, code: string): Promise<Otp | null> {
    const key = `otp:${userId}`;
    const data = await this.redisClient.get(key);
    
    if (!data) {
      return null;
    }

    const otpData = JSON.parse(data);
    
    // Check if the code matches
    if (otpData.code !== code) {
      return null;
    }
    
    return Otp.reconstruct(
      otpData.id,
      otpData.userId,
      otpData.code,
      new Date(otpData.expiresAt),
      otpData.isUsed,
      new Date(otpData.createdAt),
    );
  }

  async findValidByUserId(userId: string): Promise<Otp | null> {
    const key = `otp:${userId}`;
    const data = await this.redisClient.get(key);
    
    if (!data) {
      return null;
    }

    const otpData = JSON.parse(data);
    
    const otp = Otp.reconstruct(
      otpData.id,
      otpData.userId,
      otpData.code,
      new Date(otpData.expiresAt),
      otpData.isUsed,
      new Date(otpData.createdAt),
    );

    // Return only if it's valid (not used and not expired)
    return otp.isValid() ? otp : null;
  }

  async delete(id: string): Promise<void> {
    // Since we're using userId as key, we need to find by ID
    // For simplicity, we'll scan all OTP keys (in production, consider better indexing)
    const keys = await this.redisClient.keys('otp:*');
    
    for (const key of keys) {
      const data = await this.redisClient.get(key);
      if (data) {
        const otpData = JSON.parse(data);
        if (otpData.id === id) {
          await this.redisClient.del(key);
          break;
        }
      }
    }
  }

  async deleteExpired(): Promise<void> {
    // Redis automatically handles cleanup with TTL, so this is a no-op
    // OTPs expire automatically when their TTL reaches 0
  }

  async onModuleDestroy(): Promise<void> {
    await this.redisClient.quit();
  }
}
