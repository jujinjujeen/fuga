# Music Product Catalog

A searchable CRUD app for managing music products with image uploads. Built as a coding assignment, it is designed to easily run locally with docker-compose, but can be easily deployed since it has frontend and backend containerized services that depend on the environment variables.

- **Backend**: Node.js/Express with TypeScript, Prisma ORM (PostgreSQL), Redis for caching, s3
- **Frontend**: React with Vite, Radix UI, TailwindCSS 4, Tanstack Query, React-router, react-hook-form
- **Infrastructure**: Docker Compose with PostgreSQL, Redis, minio s3 compatible storage, backend, and frontend services

## Quick Start

> **Prerequisites:** Node v24+, Docker, Docker Compose, existing .env

```bash
make up                 # Spins up everything (backend, frontend, DB, Redis, MinIO)
```

Frontend: http://localhost:5445
Backend API: http://localhost:5444
Swagger docs: http://localhost:5444/docs

```bash
make down               # Stop everything
make logs               # Tail logs
make help               # See all commands
```

## Project Structure

```
/backend
  /src
    /api           - Feature-based API endpoints
      /products    - CRUD for products (route, controller, service, repo)
      /health      - Health check endpoint
      /presign     - Presigned URL generation for image uploads
    /middleware    - Express middleware (auth, cache, validation, error handling)
    /services      - Business logic (storage, cleanup)
    /jobs          - Cron jobs (cleanup.cron.ts for temp file pruning)
    /lib           - Third-party clients (Prisma, Redis, S3)
    /mappers       - Data transformation between layers
    /utils         - Helper functions
    /constants     - Shared constants (HTTP status, time constants)
  /prisma          - Database schema and migrations
  /docs            - OpenAPI spec (openapi.yaml)

/frontend
  /src
    /features      - Feature-based modules
      /products    - Product list, search, grid display
      /product     - Single product CRUD (create/edit forms, modals)
    /components
      /UI          - Reusable UI (Sidebar, LoadingSpinner, ErrorMessage)
    /layouts       - Page layouts with animated backgrounds
    /pages         - Route pages (HomePage, etc.)
    /hooks         - Custom React hooks
    /utils         - Helper functions

/config            - Shared configs

/docs              - Symlink to api spec

/libs/types        - Shared TypeScript types (auto-generated from OpenAPI)

```

**How to navigate:**

- **Backend**: Start at `/api/{feature}/{feature}.route.ts` to see endpoints, follow to controller → service → repo
- **Frontend**: Look in `/features/{feature}` for everything related to that feature (components, hooks, API calls)
- **Shared contract**: Check `/docs/openapi.yaml` to see API spec, then run `make generate-types` to sync types

## Motivation

**Monorepo with shared types:** I wanted type safety across frontend/backend without duplicate definitions. OpenAPI spec generates TypeScript types automatically (`make generate-types`), so the contract is the source of truth.

**Presigned URL uploads:** Instead of piping images through the backend, users upload directly to S3 via presigned POSTs. This keeps the server lightweight and offloads the heavy lifting to object storage. A cron job cleans up temp files that never get promoted to products.

**Redis caching:** Added response caching and rate limiting to show I'm thinking about performance/security, though honestly, with this dataset size, it's overkill. Mostly for demonstration.

**Feature-based structure:** Both frontend and backend organize code by feature (e.g., `/products`, `/health`), not by layer (routes/controllers/services). Makes it easier to find related code.

## What I'd Do Differently

Given more time or in a production setting:

- **Auth:** No authentication layer. Obvious requirement for production.
- **Deploy it:** Ran out of time for deployment. Everything's containerized, so it's deploy-ready, but I'd add CI/CD, environment configs, and proper monitoring.
- **Better error boundaries:** The frontend error handling is basic. I'd add proper error boundaries and user-friendly error messages.
- **Image optimization:** No image resizing/compression. In production, I'd add automatic thumbnail generation and WebP conversion.
- **Pagination:** Currently loads all products. I'd add cursor-based pagination for real usage. While on that note I'd also make search-queries and pagination part of navigation for convenience.
- **E2E tests:** Just unit tests for now. I'd add Cypress for critical user flows.

## Development Notes

```bash
# Backend or Frontend (from respective directories)
npm run dev         # Dev server with hot reload
npm run test        # Run all tests in watch mode, can be also run with :ci or :coverage
npm run lint        # ESLint

# Database migrations (from /backend)
npx prisma migrate dev    # Create/apply migration
npx prisma studio         # GUI for DB (port 5555)
npx prisma generate       # Generate Prisma Client
```

**Note:** Prisma commands need a local DATABASE_URL in `/backend/.env` (change `postgres` service name to `localhost` from root `.env`).

## Image Upload Flow

1. User selects image → frontend validates (type, size)
2. GET presigned POST URL from `/api/presign` (rate-limited)
3. Upload directly to MinIO temp bucket via presigned URL
4. Submit form with returned `storageKey`
5. Backend moves image from temp → permanent bucket, links to product
6. Cron job cleans temp bucket every 2 hours (deletes files older than 5min TTL)

This keeps image handling off the main request path and lets us enforce upload constraints at the storage level.
