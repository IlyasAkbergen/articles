import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { FixturesService } from './fixtures.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const fixturesService = app.get(FixturesService);

  try {
    await fixturesService.seedData();
    console.log('🎉 Fixtures loaded successfully!');
  } catch (error) {
    console.error('💥 Failed to load fixtures:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
