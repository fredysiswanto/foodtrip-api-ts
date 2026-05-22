# FoodTrip API Developer Guide

This guide is for developers working on the FoodTrip API project.

## Project overview

FoodTrip API is a TypeScript-based Express backend with the following core concepts:

- `src/server.ts` — Express app configuration and middleware setup
- `src/index.ts` — server startup and graceful shutdown logic
- `src/api` — route modules, controllers, services, and repositories
- `src/common` — middleware, validation utilities, and shared models
- `src/api-docs` — OpenAPI document generation and Swagger UI

## Getting started

### Install dependencies

```bash
pnpm install
```

### Environment setup

Copy the environment template:

```bash
cp .env.template .env
```

Update the values in `.env` as needed.

### Run the app in development

```bash
pnpm start:dev
```

The server will start on `http://localhost:8080` by default.

### Build for production

```bash
pnpm build
pnpm start:prod
```

### Run tests

```bash
pnpm test
pnpm test:cov
```

### Code formatting and checks

```bash
pnpm check
```

## Code structure and conventions

### Routes and controllers

- `src/api/*/*Router.ts` defines Express routes.
- `src/api/*/*Controller.ts` contains request handlers.
- `src/api/*/*Service.ts` contains business logic and response creation.
- `src/api/*/*Repository.ts` manages data access.

### Authentication

- `src/api/auth/authRouter.ts` defines authentication endpoints.
- `src/api/auth/authController.ts` handles login and user profile requests.
- `src/api/auth/authService.ts` validates credentials and issues JWTs.
- `src/common/middleware/authMiddleware.ts` protects routes that require a valid token.

Protected endpoints should use the `authMiddleware` before controller routes.

When adding a new feature:

1. Create a new router and register it in `src/server.ts`.
2. Add controllers for endpoint handlers.
3. Implement service methods for the core logic.
4. Use a repository to encapsulate data access.
5. Follow the Controller-Service-Repository-DTO pattern described in `docs/PATTENT_GUIDE.md`.

### Architecture patterns

- The canonical architecture pattern for this project is defined in `docs/PATTENT_GUIDE.md`.
- Follow the Controller-Service-Repository-DTO pattern for new routes, resources, and feature development.
- The pattern guide includes layer responsibilities, implementation rules, and a code skeleton for new modules.

### Request validation

- Request validation uses Zod schemas.
- Example: `src/api/user/userModel.ts` defines `GetUserSchema` for route params.
- The middleware `validateRequest` is used before controller execution.

### API documentation

- `src/api-docs/openAPIRouter.ts` serves Swagger UI and OpenAPI JSON.
- `src/api-docs/openAPIDocumentGenerator.ts` composes API metadata from registered Zod schemas.

When adding a new route, register the path with the OpenAPI registry so the endpoint appears in Swagger.

### Environment configuration

- `src/common/utils/envConfig.ts` loads `.env` and validates variables with Zod.
- The app will fail startup if required env values are invalid.

### Error handling and middleware

- `src/common/middleware/errorHandler.ts` handles uncaught errors.
- `src/common/middleware/requestLogger.ts` logs incoming requests.
- `src/common/middleware/rateLimiter.ts` protects endpoints from abuse.

### Logging

- Pino is used for structured logging.
- The server logs startup, shutdown, and internal errors.

## Extending the API

### Add a new resource

1. Add a new folder under `src/api` for the resource.
2. Define the Zod model(s) in `*Model.ts`.
3. Create request validation schemas in the same model file.
4. Add repository methods in `*Repository.ts`.
5. Add service methods in `*Service.ts`.
6. Add controller handlers in `*Controller.ts`.
7. Add router routes in `*Router.ts`.
8. Register the router in `src/server.ts`.
9. Register OpenAPI metadata in the router file.

### Example structure for a new resource

```
src/api/product/
  productModel.ts
  productRepository.ts
  productService.ts
  productController.ts
  productRouter.ts
```

### Testing new routes

- Add tests under `src/api/*/__tests__`.
- Use Supertest to call endpoints against the Express app.
- Ensure coverage for success and failure cases.

## Troubleshooting

- If the app fails on startup, check `.env` against `src/common/utils/envConfig.ts`.
- If routes do not appear in Swagger, verify the OpenAPI registry registration in the router file.
- For unexpected behavior, review logs from `pino` and the error handler.
- If Prisma schema generation or db push fails, verify `prisma.config.ts` and `DATABASE_URL` in your `.env`.

## Prisma integration notes

- Prisma 7 stores connection details in `prisma.config.ts`, not in `schema.prisma`.
- The app uses a request-safe global Prisma client in `src/common/utils/prismaClient.ts`.
- The current database is configured with `@prisma/adapter-mariadb` for MySQL-compatible connections.
- Run `pnpm prisma:generate`, `pnpm prisma:db:push`, and `pnpm prisma:seed` to sync and populate the database.

## Additional notes

- The current user data is stored in memory in `src/api/user/userRepository.ts`.
- For production, replace the repository with a real database or persistence layer.
- Keep validation schemas in sync with the service response models.
