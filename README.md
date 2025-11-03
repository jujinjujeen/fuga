# FUGA test assignment

The app includes searchable CRUD product (title, artist, image). It is designed to easily run locally with docker-compose, but can be easily deployed since it has frontend and backend containerized services that depend on the environment variables. Unfortunately I didn't have enough time to deploy it to prod.

**Tech Stack:**

- **Backend**: Node.js/Express with TypeScript, Prisma ORM (PostgreSQL), Redis for caching, s3
- **Frontend**: React with Vite, Radix UI, TailwindCSS 4
- **Infrastructure**: Docker Compose with PostgreSQL, Redis, minio s3 compatible storage, backend, and frontend services

## Startup guide

### Environment Setup

Before starting, ensure you have a `.env` file in the root directory. Copy from the example:

```bash
cp .env.example .env  # Copy and customize as needed
```

###

> Prerequisites: Node v24^, docker, docker-compose, `.env` file

```bash
make up
# generates types, spins up all the necessary services, serves the app
# shared types are generated to libs/types/api.d.ts, docs/openapi.yaml spec is used as the source

make down            # Stop all services
make restart         # Restart all services
make logs            # Tail logs for all services
make help            # shows all available commands
```

## Summary

### Building and Testing

```bash
# Backend (from /backend) or Frontend (from /frontend)
npm run dev                # Run backend in dev mode with tsx watch
npm run build              # Build backend for production
npm run test               # Run tests in watch mode can be run with :ci or :coverage
npm run lint               # Lint backend code

# Database
cd backend
npx prisma migrate dev     # Create and apply migrations
npx prisma studio          # Open Prisma Studio (port 5555)
npx prisma generate        # Generate Prisma Client
# for these commands to work /backend/.env with DATABASE_URL equal to root .env variable
# except for service name changed to localhost
# DATABASE_URL=postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@localhost:{POSTGRES_PORT}/{POSTGRES_DB}
```

## Tech decisions and flows

### Shared types

`/libs/types/api.d.ts` is automatically generated from OpenAPI spec. `api-schemas.d.ts` uses generated types to improve readability. The types then used to have transparent contract between client and server, ensure type safety.

```bash
make generate-types        # Generate TypeScript types from OpenAPI spec
# or
./generate-types.sh        # Generates libs/types/api.d.ts from backend/docs/openapi.yaml
```

### Uploading image flow

I'm using presigned URL POST to upload directly to image storage. Motivation was to unload the image handling from backend service directly to object storage. Utilizing POST constraints lets us handle it securely (size, type, url ttl). The presign is rate limited.

1. User selects an image.
2. We hit `POST /api/presign` endpoint with image metadata.
3. Presign URL is issued and the image is uploaded to the temporary bucket. The storageKey is returned.
4. User fills the rest of the form, submits with `POST /api/products`. Image is promoted to permanent bucket and linked to the Product.
5. Temporary bucket is pruned in a cron job to remove images older than presign TTL.

### Backend service




