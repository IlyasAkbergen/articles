default: setup
setup:
	@echo "🚀 Setting up Articles REST API..."
	@echo "📋 Copying environment file..."
	@cp .env.example .env
	@echo "🐳 Building and starting Docker containers..."
	@docker compose up --build -d
	@echo "⏳ Waiting for services to be ready..."
	@sleep 15
	@echo "🔄 Running database migrations..."
	@docker compose exec app sh -c "npm run migration:run && npm run setup:swagger"
	@echo "🌱 Seeding initial data..."
	@docker compose exec app npm run fixtures:run
	@echo "✅ Setup complete!"
	@echo ""
	@echo "📊 Service URLs:"
	@echo "  • API: http://localhost:3030"
	@echo "  • API Documentation: http://localhost:3030/api-docs"
	@echo "  • PostgreSQL: localhost:5440"
	@echo "  • Redis: localhost:6399"
	@echo ""
	@echo "🔑 Default credentials:"
	@echo "  • Admin: admin@articles.com / Admin123!"
	@echo "  • Author: Iliyas Akbergen (iliyas.akbergen@gmail.com)"
	@echo ""
	@echo "🔧 To stop services: make down"
	@echo "📝 To view logs: make logs"

down:
	@echo "🛑 Stopping Docker containers..."
	@docker-compose down

logs:
	@docker-compose logs -f

clean:
	@echo "🧹 Cleaning up Docker containers and volumes..."
	@docker-compose down -v
	@rm -rf node_modules

install:
	@echo "📦 Installing dependencies in container..."
	@docker compose exec app npm install

rebuild:
	@echo "🔨 Rebuilding with fresh dependencies..."
	@docker-compose down -v
	@docker-compose up --build -d
	@sleep 15
	@docker compose exec app npm install

restart:
	@echo "🔄 Restarting services..."
	@docker-compose restart

status:
	@echo "📊 Service status:"
	@docker-compose ps

fixtures:
	@echo "🌱 Running fixtures..."
	@docker compose exec app npm run fixtures:run

.PHONY: setup down logs clean install rebuild restart status fixtures
