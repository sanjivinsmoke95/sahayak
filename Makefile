.PHONY: help install dev db-up db-down migrate test lint

help:
	@echo "install   Install frontend and backend dependencies"
	@echo "db-up     Start PostgreSQL in Docker"
	@echo "migrate   Create and apply database migrations"
	@echo "dev       Reminder of the two commands to run"
	@echo "test      Run backend tests and frontend typecheck"
	@echo "lint      Run ruff and eslint"

install:
	cd frontend && npm install
	cd backend && python -m venv .venv && ./.venv/bin/pip install -r requirements.txt

db-up:
	docker compose up -d db

db-down:
	docker compose down

migrate:
	cd backend && alembic revision --autogenerate -m "schema" && alembic upgrade head

dev:
	@echo "Run these in two terminals:"
	@echo "  cd backend  && uvicorn app.main:app --reload"
	@echo "  cd frontend && npm run dev"

test:
	cd backend && python -m pytest -q
	cd frontend && npx tsc --noEmit

lint:
	cd backend && python -m ruff check .
	cd frontend && npm run lint
