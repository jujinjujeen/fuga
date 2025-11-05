# Makefile

# Default target
.DEFAULT_GOAL := help

# Variables
COMPOSE=docker compose
PROJECT_NAME=fuga

# Commands
up: generate-types ## Start all services
	@echo "🟢 Starting containers..."
	@echo "🔗 Frontend: http://localhost:5445"
	@echo "🔗 Backend:  http://localhost:5444"
	$(COMPOSE) --project-name $(PROJECT_NAME) up --build

down: ## Stop all services
	$(COMPOSE) --project-name $(PROJECT_NAME) down --remove-orphans

generate-types: ## Generate TypeScript types from OpenAPI spec in backend/docs
	./generate-types.sh

init-env: ## Initialize .env files for backend and frontend from examples
	cp .env.example .env
	cp /backend/.env.example /backend/.env

restart: down up ## Restart all services

logs: ## Tail logs for all services
	$(COMPOSE) logs -f

build: ## Build all services without cache
	$(COMPOSE) --project-name $(PROJECT_NAME) build --no-cache

sh-frontend: ## Shell into frontend container
	$(COMPOSE) exec frontend sh

sh-backend: ## Shell into backend container
	$(COMPOSE) exec backend sh

prune: ## Remove all stopped containers, networks, and volumes
	docker system prune -f --volumes

help: ## Show help
	@echo "Usage: make <target>"
	@echo
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

.PHONY: up down restart logs build sh-frontend sh-backend prune help generate-types
