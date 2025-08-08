import './polyfills';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { FixturesService } from './fixtures/fixtures.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3030'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Articles API')
    .setDescription(
      'A RESTful API for managing articles and authors, built with NestJS following Clean Architecture principles and CQRS pattern. Features include article management, author management, and JWT-based authentication with OTP verification.',
    )
    .setVersion('1.0.0')
    .setContact(
      'Iliyas Akbergen',
      'https://github.com/IlyasAkbergen',
      'iliyas.akbergen@gmail.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3030', 'Local development server')
    .addServer('https://api.example.com', 'Production server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag(
      'Authentication',
      'User registration, login, and OTP verification endpoints',
    )
    .addTag(
      'Articles',
      'Article management endpoints - create, read, update, delete, publish',
    )
    .addTag('Authors', 'Author management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'Articles API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo_text.svg',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  const externalPort = process.env.NODE_ENV === 'production' ? port : 3030;
  console.log(`🚀 Application is running on: http://localhost:${externalPort}`);
  console.log(
    `📚 API Documentation available at: http://localhost:${externalPort}/api-docs`,
  );
  console.log(
    `📋 OpenAPI JSON available at: http://localhost:${externalPort}/api-docs-json`,
  );

  try {
    const fixturesService = app.get(FixturesService);
    await fixturesService.seedData();
  } catch (error) {
    console.error('Warning: Failed to seed initial data:', error.message);
  }
}
bootstrap();
