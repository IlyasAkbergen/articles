import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DATABASE_HOST', 'postgres'),
  port: configService.get('DATABASE_PORT', 5432),
  username: configService.get('DATABASE_USER', 'articles_user'),
  password: configService.get('DATABASE_PASSWORD', 'articles_password'),
  database: configService.get('DATABASE_NAME', 'articles'),
  entities: ['src/modules/**/infrastructure/persistence/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations_history',
  synchronize: false,
  logging: configService.get('NODE_ENV') === 'development',
});
