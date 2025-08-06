default: setup

setup:
	@echo "🚀 Setting up Articles REST API..."
	@echo "📋 Copying environment file..."
	@cp .env.example .env
	@echo "🐳 Building and starting Docker containers..."
	@docker-compose up --build -d
	@echo "⏳ Waiting for services to be ready..."
	@sleep 3
	@echo "✅ Setup complete!"
	@echo ""
	@echo "📊 Service URLs:"
	@echo "  • API: http://localhost:3030"
	@echo "  • PostgreSQL: localhost:5440"
	@echo "  • Redis: localhost:6399"
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

restart:
	@echo "🔄 Restarting services..."
	@docker-compose restart

status:
	@echo "📊 Service status:"
	@docker-compose ps

.PHONY: setup down logs clean restart status
