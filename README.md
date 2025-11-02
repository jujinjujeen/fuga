# FUGA test assignment

The app includes searchable CRUD product (title, artist, image). It is designed to easily run locally with docker-compose, but can be easily deployed since it has frontend and backend containerized services that depend on the environment variables. Unfortunately I didn't have enough time to deploy it to prod.

## Startup guide

> Prerequisites: Node v24^, docker, docker-compose, `.env` file (sent in an email, can be custom from `.env.example`)

```
make up 
# generates types, spins up all the necessary services, serves the app
# shared types are generated to libs/types/api.d.ts, docs/openapi.yaml spec is used as the source

make help 
# shows all available commands
```

## Summary


