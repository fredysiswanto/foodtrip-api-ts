# FoodTrip API Documentation

This repository contains the FoodTrip API, a lightweight Express + TypeScript backend with built-in health checks, user endpoints, request validation, Swagger documentation, logging, and error handling.

## What is included

- Express server with TypeScript support
- Structured feature folders for `api`, `common`, and `api-docs`
- Swagger UI and OpenAPI schema generation
- Health check endpoint for uptime monitoring
- User endpoints with request validation and standardized responses
- Rate limiting, CORS, Helmet security hardening, and request logging
- Tests with Vitest and Supertest
- Build support using `tsc` + `tsup`

## Quick start

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Copy environment template:
   ```bash
   cp .env.template .env
   ```
3. Run in development mode:
   ```bash
   pnpm start:dev
   ```
4. Open the API docs:
   - Swagger UI: `http://localhost:8080`
   - OpenAPI JSON: `http://localhost:8080/swagger.json`

## Available commands

- `pnpm start:dev` — Run the server in development mode with `tsx`
- `pnpm build` — Compile TypeScript and bundle with `tsup`
- `pnpm start:prod` — Run production output from `dist/index.js`
- `pnpm test` — Run tests with Vitest
- `pnpm test:cov` — Run tests with coverage
- `pnpm check` — Run Biome formatting and lint checks

## Environment variables

The project uses `dotenv` with validation via Zod. Copy `.env.template` to `.env` and update values as needed.

- `NODE_ENV` — `development`, `production`, or `test`
- `HOST` — hostname for the server (default `localhost`)
- `PORT` — server port (default `8080`)
- `CORS_ORIGIN` — allowed origin for CORS requests
- `COMMON_RATE_LIMIT_MAX_REQUESTS` — maximum requests per rate limit window
- `COMMON_RATE_LIMIT_WINDOW_MS` — duration of the rate limit window in milliseconds

## API Endpoints

### Health Check

- `GET /health-check`
- Returns a JSON service response indicating the service is healthy.

### Authentication

- `POST /auth/login`
  - Accepts `{ email, password }` in the request body.
  - Returns a JWT access token on successful login.

- `GET /auth/me`
  - Returns the authenticated user details.
  - Requires `Authorization: Bearer <token>` header.

### Users

- `GET /users`
  - Retrieves the list of users.
  - Requires authentication.
  - Response body returns a standard `ServiceResponse` containing an array of users.

- `GET /users/:id`
  - Retrieves a user by numeric ID.
  - Requires authentication.
  - Validates `id` using Zod and returns 404 if not found.

## Swagger and API docs

The Swagger UI is served at the root path by default:

- `http://localhost:8080`

The OpenAPI JSON document is available at:

- `http://localhost:8080/swagger.json`

## Project structure

```
├── docs
│   ├── README.md
│   └── DEVELOPER_GUIDE.md
├── src
│   ├── api
│   │   ├── healthCheck
│   │   └── user
│   ├── api-docs
│   ├── common
│   ├── index.ts
│   └── server.ts
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── vite.config.mts
```

## Notes

- The API uses a simple in-memory user repository in `src/api/user/userRepository.ts`.
- Response payloads are standardized using `ServiceResponse`.
- Extend the service by adding new routers, controllers, and OpenAPI schemas.
