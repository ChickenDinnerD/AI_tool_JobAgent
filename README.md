# Personal Job Intelligence System

A modular monolith foundation for a personal job-search intelligence platform. This phase focuses on the architecture, PostgreSQL schema, backend API, and dashboard UI, without implementing collectors, AI pipelines, or automated job discovery.

## Project structure

- apps/web — Next.js dashboard frontend
- apps/api — Node.js + Express API
- packages/database — Prisma schema and migrations
- packages/shared — shared models and system-facing constants
- infrastructure/ — reserved for future modules
- docs/ — future documentation

## Prerequisites

- Node.js 20+
- npm
- PostgreSQL 16
- Docker Compose (recommended for local development)

## Setup

1. Install dependencies:
   npm install
2. Copy environment variables:
   cp .env.example .env
3. Start PostgreSQL using Docker Compose:
   docker compose up -d
4. Generate Prisma client and apply migrations:
   npx prisma generate --schema packages/database/prisma/schema.prisma
   npx prisma migrate dev --name init --schema packages/database/prisma/schema.prisma
5. Start the application in development mode:
   npm run dev

## Services

- Frontend: http://localhost:3000
- API: http://localhost:4000/api
- Health endpoint: http://localhost:4000/api/health

## Notes

- The project is intentionally structured to support future Source Registry, Collector, Matching Engine, and AI modules.
- Dashboard data is loaded through the backend API and empty states are displayed when the database is empty.
- Demo data is intentionally not added to production-ready database state; the app works cleanly with empty tables.

## Commands

- Frontend:
  npm run dev:web
- API:
  npm run dev:api
- Prisma generate:
  npm run db:generate
- Prisma migrate:
  npm run db:migrate
- Product build:
  npm run build
- Lint:
  npm run lint
