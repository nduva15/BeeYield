.PHONY: help build up down logs restart clean dev prod test

help: ## Show this help message
	@echo "BeeYield Docker Management"
	@echo "=========================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development Commands
dev: ## Start development environment with hot reload
	docker compose -f docker-compose.dev.yml up -d

dev-build: ## Build and start development environment
	docker compose -f docker-compose.dev.yml up -d --build

dev-logs: ## View development logs
	docker compose -f docker-compose.dev.yml logs -f

dev-down: ## Stop development environment
	docker compose -f docker-compose.dev.yml down

# Production Commands
build: ## Build all containers
	docker compose build

up: ## Start all services in production mode
	docker compose up -d

down: ## Stop all services
	docker compose down

restart: ## Restart all services
	docker compose restart

logs: ## View logs from all services
	docker compose logs -f

logs-frontend: ## View frontend logs
	docker compose logs -f frontend

logs-backend: ## View backend logs
	docker compose logs -f backend

logs-postgres: ## View postgres logs
	docker compose logs -f postgres

logs-redis: ## View redis logs
	docker compose logs -f redis

# Service Management
ps: ## Show running containers
	docker compose ps

stop: ## Stop all services without removing
	docker compose stop

start: ## Start stopped services
	docker compose start

# Database Commands
db-shell: ## Open PostgreSQL shell
	docker compose exec postgres psql -U postgres -d beeyield

db-backup: ## Backup database
	docker compose exec postgres pg_dump -U postgres beeyield > backup_$$(date +%Y%m%d_%H%M%S).sql

db-restore: ## Restore database from backup (usage: make db-restore FILE=backup.sql)
	docker compose exec -T postgres psql -U postgres -d beeyield < $(FILE)

# Redis Commands
redis-cli: ## Open Redis CLI
	docker compose exec redis redis-cli

redis-flush: ## Flush all Redis data
	docker compose exec redis redis-cli FLUSHALL

# Maintenance Commands
clean: ## Remove containers, volumes, and images
	docker compose down -v --rmi all

clean-volumes: ## Remove all volumes (WARNING: deletes data)
	docker compose down -v

prune: ## Remove unused Docker resources
	docker system prune -af --volumes

rebuild: ## Rebuild and restart all services
	docker compose down
	docker compose build --no-cache
	docker compose up -d

# Health Checks
health: ## Check health status of all services
	@docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"

# Frontend Commands
frontend-shell: ## Open shell in frontend container
	docker compose exec frontend sh

frontend-rebuild: ## Rebuild only frontend
	docker compose build frontend
	docker compose up -d frontend

# Backend Commands
backend-shell: ## Open shell in backend container
	docker compose exec backend sh

backend-rebuild: ## Rebuild only backend
	docker compose build backend
	docker compose up -d backend

backend-test: ## Run backend tests
	docker compose exec backend pytest

# Utility Commands
env-check: ## Verify environment variables
	@echo "Checking environment variables..."
	@test -f .env && echo "✓ .env file exists" || echo "✗ .env file missing - copy .env.example"
	@grep -q "VITE_SUPABASE_URL" .env && echo "✓ VITE_SUPABASE_URL set" || echo "✗ VITE_SUPABASE_URL not set"
	@grep -q "VITE_SUPABASE_ANON_KEY" .env && echo "✓ VITE_SUPABASE_ANON_KEY set" || echo "✗ VITE_SUPABASE_ANON_KEY not set"

stats: ## Show container resource usage
	docker stats --no-stream

inspect: ## Inspect Docker Compose configuration
	docker compose config
