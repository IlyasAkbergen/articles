# Articles REST API

## Quick Setup (One Command)

To set up the entire project with one command, run:

```bash
make
```

This will:
- Copy the environment configuration
- Build and start all Docker containers
- Set up PostgreSQL and Redis with non-standard ports to avoid conflicts

## Service Ports

**Note:** This project uses non-standard ports to avoid conflicts when a tester evaluates multiple candidates' implementations of the same project:

- **API**: http://localhost:3030
- **API Documentation (Swagger)**: http://localhost:3030/api-docs
- **PostgreSQL**: localhost:5440 (instead of default 5432)
- **Redis**: localhost:6399 (instead of default 6379)

## Default Credentials

For testing purposes, the application automatically creates fixture data with these credentials:

**Admin User:**
- Email: `admin@articles.com`
- Password: `Admin123!`
- Role: `admin`

**Sample Author:**
- Name: `Iliyas Akbergen`
- Email: `iliyas.akbergen@gmail.com`

## Additional Commands

```bash
make down      # Stop all containers
make logs      # View container logs
make restart   # Restart all services
make status    # Check service status
make clean     # Remove containers and volumes
make fixtures  # Run fixtures to seed data
```

## Manual Setup (Alternative)

If you prefer manual setup:

1. Copy environment file: `cp .env.example .env`
2. Start services: `docker-compose up --build -d`

## Task Description

## **Тестовое задание для Middle NestJS разработчика**

Разработайте простое REST API с использованием NestJS, которое включает в себя аутентификацию, CRUD операции и кэширование данных. Проект должен использовать PostgreSQL для хранения данных и Redis для кэширования.

1. **Создание API для аутентификации:**
    - Реализуйте регистрацию и аутентификацию пользователей.
    - Используйте JWT (JSON Web Tokens) для обработки аутентификации.
2. **Интеграция с базой данных PostgreSQL с использованием TypeORM:**
    - Настройте соединение с базой данных.
    - Используйте миграции для управления структурой базы данных.
3. **Разработка CRUD API для сущности "Статья":**
    - Структура "Статьи" должна включать: название, описание, дату публикации, автора.
    - Реализуйте операции создания, чтения, обновления и удаления статей.
    - Обеспечьте валидацию входных данных.
    - Реализуйте пагинацию для запросов списка статей.
    - Добавьте возможность фильтрации статей по различным критериям (например, по дате публикации, автору).
    - Создание и обновление статей, должны быть закрыты авторизацией
4. **Реализация кэширования с использованием Redis:**
    - Кэшируйте результаты запросов на чтение статей.
    - Обеспечьте инвалидацию кэша при обновлении или удалении статей.
5. **Тестирование:**
    - Напишите unit-тесты для проверки бизнес-логики.
    
    ### Требования к коду и документации:
    
    - Код должен быть чистым, хорошо структурированным и легко читаемым.
    - Обеспечьте комментарии к коду и документацию API (по желанию) с примерами запросов и ответов.

## **Test Task for Middle NestJS Developer**

Develop a simple REST API using NestJS that includes authentication, CRUD operations, and data caching. The project should use PostgreSQL for data storage and Redis for caching.

1. **Create API for Authentication:**

   * Implement user registration and authentication.
   * Use JWT (JSON Web Tokens) for handling authentication.
2. **Integrate with PostgreSQL database using TypeORM:**

   * Configure the database connection.
   * Use migrations to manage the database schema.
3. **Develop CRUD API for the "Article" entity:**

   * The "Article" structure should include: title, description, publication date, author.
   * Implement create, read, update, and delete operations for articles.
   * Ensure input data validation.
   * Implement pagination for article list requests.
   * Add the ability to filter articles by various criteria (e.g., by publication date, author).
   * Creating and updating articles should be protected by authorization.
4. **Implement caching using Redis:**

   * Cache the results of article read requests.
   * Ensure cache invalidation upon article update or deletion.
5. **Testing:**

   * Write unit tests to verify business logic.

   ### Code and Documentation Requirements:

   * The code should be clean, well-structured, and easy to read.
   * Provide code comments and API documentation (optional) with examples of requests and responses.
