import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthorsModule } from './modules/author/authors.module';
import { ArticlesModule } from './modules/article/articles.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthorEntity } from './modules/author/infrastructure/persistence/author.entity';
import { ArticleEntity } from './modules/article/infrastructure/persistence/article.entity';
import { UserEntity } from './modules/auth/infrastructure/persistence/user.entity';
import { JwtAuthGuard } from './modules/auth/infrastructure/guards/jwt-auth.guard';
import { FixturesModule } from './fixtures/fixtures.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CqrsModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: parseInt(configService.get('DATABASE_PORT', '5440')),
        username: configService.get('DATABASE_USER', 'articles_user'),
        password: configService.get('DATABASE_PASSWORD', 'articles_password'),
        database: configService.get('DATABASE_NAME', 'articles'),
        entities: [AuthorEntity, ArticleEntity, UserEntity],
        synchronize: false,
        autoLoadEntities: true,
        migrations: ['dist/database/migrations/*.js'],
        migrationsRun: configService.get('NODE_ENV') === 'production',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    AuthorsModule,
    ArticlesModule,
    FixturesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
