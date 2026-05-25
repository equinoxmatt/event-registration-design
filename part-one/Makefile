.DEFAULT_GOAL := help

.PHONY: help setup build up down restart ps logs shell-api shell-web shell-db \
        install migrate migrate-fresh seed key-generate tinker test test-web stan lint generate-types dev

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: .env build up migrate

.env:
	@cp .env.example .env
	@echo "Copied .env.example → .env. Fill in your values, then re-run 'make setup'."
	@exit 1

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

ps:
	docker compose ps

logs:
	docker compose logs -f

logs-%:
	docker compose logs -f $*

shell-api:
	docker compose exec api sh

shell-web:
	docker compose exec web sh

shell-db:
	docker compose exec db mysql -u $${DB_USERNAME:-events} -p$${DB_PASSWORD:-secret} $${DB_DATABASE:-events}

install:
	docker compose run --rm --no-deps api composer install
	docker compose run --rm --no-deps web npm install

migrate:
	docker compose exec api php artisan migrate --force

migrate-fresh:
	docker compose exec api php artisan migrate:fresh --seed --force

seed:
	docker compose exec api php artisan db:seed --force

key-generate:
	docker compose exec api php artisan key:generate

tinker:
	docker compose exec api php artisan tinker

test-setup:
	docker compose exec db mysql -uroot -p$${DB_ROOT_PASSWORD:-root_secret} \
		-e "CREATE DATABASE IF NOT EXISTS events_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

test:
	docker compose exec api php artisan test

test-web:
	docker compose exec web npm test

stan:
	docker compose exec api ./vendor/bin/phpstan analyse --no-progress

lint:
	docker compose exec api ./vendor/bin/pint --test
	docker compose exec web npm run lint

generate-types:
	cp openapi.yaml web/openapi.yaml
	docker compose exec -T web sh -c "cd /app && npm run generate:types"
	rm web/openapi.yaml

dev: .env
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
