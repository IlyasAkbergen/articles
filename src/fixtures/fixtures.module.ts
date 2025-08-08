import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FixturesService } from './fixtures.service';
import { AuthModule } from '../modules/auth/auth.module';
import { AuthorsModule } from '../modules/author/authors.module';

@Module({
  imports: [
    CqrsModule,
    AuthModule,
    AuthorsModule,
  ],
  providers: [FixturesService],
  exports: [FixturesService],
})
export class FixturesModule {}
