import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { AuthorEntity } from '../modules/author/infrastructure/persistence/author.entity';
import { ArticleEntity } from '../modules/article/infrastructure/persistence/article.entity';
import { UserEntity } from '../modules/auth/infrastructure/persistence/user.entity';

config();

const configService = new ConfigService();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DATABASE_HOST', 'localhost'),
  port: parseInt(configService.get('DATABASE_PORT', '5440')),
  username: configService.get('DATABASE_USER', 'articles_user'),
  password: configService.get('DATABASE_PASSWORD', 'articles_password'),
  database: configService.get('DATABASE_NAME', 'articles'),
  entities: [AuthorEntity, ArticleEntity, UserEntity],
  migrations: ['dist/database/migrations/*.js'],
  migrationsTableName: 'migrations',
  synchronize: false, // Always false for production
  logging: configService.get('NODE_ENV') === 'development',
});

export default AppDataSource;
