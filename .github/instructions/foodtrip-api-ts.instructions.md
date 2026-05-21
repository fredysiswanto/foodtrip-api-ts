# FoodTrip API TypeScript Instructions

## Purpose

These instructions are for GitHub Copilot to generate code consistent with the FoodTrip API TypeScript backend.

## Applies to

- TypeScript Express backend in this repository
- `src/api/*`, `src/common/*`, `src/api-docs/*`, `docs/*.md`
- Prisma database models and repository code
- Zod validation schemas used for request validation and OpenAPI generation
- Vitest tests and Supertest API tests
- Biome / Prettier formatting and strict TypeScript settings

## Project conventions

1. Keep the existing feature-based folder structure:
   - `src/api/<feature>/...`
   - `src/common/middleware`, `src/common/models`, `src/common/utils`
   - `src/api-docs/*`
2. Follow the **Controller → DTO → Service → Repository** pattern described in `docs/PATTENT_GUIDE.md`.
3. Prefer route modules and Express routers over monolithic route definitions.
4. Use path aliases from `tsconfig.json`:
   - `@/*`
   - `@/common/*`
   - `@/api/*`
   - `@/generated/*`
   - `@/utils/*`
5. Keep the repo's ESM/`type: module` style and `ES2023` target.

## Coding standards

- Use `async/await` and modern ES module imports.
- Keep TypeScript `strict` type safety.
- Use Zod for validation and schema inference.
- Use `ServiceResponse` for consistent API response shapes.
- **Logging**: Use `req.log` (Pino) inside request handlers. Never use `console.log` in committed code.
- **DTOs**: Define `CreateXDTO` and `UpdateXDTO` as readonly interfaces. Do not add methods to DTOs.
- **Soft delete**: In repository queries, filter `deleted_at IS NULL` by default. Provide an option `includeDeleted` only when needed.
- Use `helmet`, `cors`, `express-rate-limit`, and **`authMiddleware`** for authentication.
- Prefer reusable utility functions inside `src/common/utils`.
- Do not introduce new global runtime patterns that conflict with Express middleware flow.

## API design

- **Authentication**: Protect private routes with `authMiddleware` from `src/common/middleware/authMiddleware.ts`.
- **Restaurant permissions**: For endpoints that access a restaurant, verify membership via `restaurant_users` (roles: OWNER, ADMIN, STAFF).
- Keep controllers focused on request/response handling – call services with DTOs.
- Keep services focused on business logic – use repositories, never touch `req`/`res`.
- Keep repositories focused on Prisma access – no business logic.
- **OpenAPI**: When adding a route, register its metadata using the project’s helper (see `src/api/user/userRouter.ts` for an example).
- Use named route handlers and middleware functions for easier testing.

## Testing

- Add unit and integration tests under the existing `__tests__` folders.
- Use Vitest for test definitions.
- Use Supertest for HTTP route tests.
- Keep tests isolated, deterministic, and aligned with the repo's existing patterns.

## Formatting and quality

- Preserve the current `biome` and `prettier` style.
- Use `pnpm` commands and follow repo package scripts for build, formatting, and tests.
- Avoid adding dependencies unless required by the project goal.

## Safety

- Do not hardcode secrets or environment values.
- Respect the repository's `.env` and config structure.
- Keep changes minimal and aligned with existing patterns.

## Suggested prompt examples

- “Add a new feature route for `restaurant` search using the existing controller/service/repository structure.”
- “Update the OpenAPI docs for the user login route and keep the Zod validation schema consistent.”
- “Write a new Vitest suite for `src/api/auth/authService.ts` using existing test style.”