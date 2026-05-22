# OpenAPI/Swagger Documentation Guide

This project uses **Zod** for schema validation and **@asteasolutions/zod-to-openapi** for generating OpenAPI documentation directly from Zod schemas.

## Overview

The OpenAPI documentation system is fully integrated with the codebase and automatically generates Swagger UI documentation from your API code. All documentation lives alongside your code - there's no separate spec file to maintain.

## Architecture

### File Structure

```
src/
├── api/
│   ├── auth/
│   │   ├── authRouter.ts        # Defines routes + OpenAPI specs
│   │   ├── authModel.ts         # Zod schemas
│   │   └── authController.ts    # Route handlers
│   ├── user/
│   │   ├── userRouter.ts        # Defines routes + OpenAPI specs
│   │   ├── userModel.ts         # Zod schemas
│   │   └── userController.ts    # Route handlers
│   ├── category/
│   │   ├── categoryRouter.ts    # Defines routes + OpenAPI specs (NEW)
│   │   ├── category.dto.ts      # Zod schemas
│   │   └── categoryController.ts
│   ├── dish/
│   │   ├── dishRouter.ts        # Defines routes + OpenAPI specs (NEW)
│   │   ├── dishModel.ts         # Zod schemas
│   │   └── dishController.ts
│   ├── restaurant/
│   │   ├── restaurantRouter.ts  # Defines routes + OpenAPI specs (NEW)
│   │   ├── restaurantModel.ts   # Zod schemas
│   │   └── restaurantController.ts
│   ├── upload/
│   │   ├── uploadRouter.ts      # Defines routes + OpenAPI specs (NEW)
│   │   ├── uploadModel.ts       # Zod schemas
│   │   └── uploadController.ts
│   ├── routes/
│   │   ├── adminRouter.ts       # Combines admin APIs
│   │   └── clientRouter.ts      # Combines public APIs
│   └── healthCheck/
│       └── healthCheckRouter.ts
├── api-docs/
│   ├── openAPIDocumentGenerator.ts  # Combines all registries
│   ├── openAPIResponseBuilders.ts   # Helper for response schemas
│   └── openAPIRouter.ts             # Serves Swagger UI + JSON
└── common/
    └── utils/
        └── commonValidation.ts      # Reusable validation schemas
```

### Key Components

1. **API Module Router** (e.g., `categoryRouter.ts`)
   - Creates an `OpenAPIRegistry` instance
   - Creates an Express `Router` instance
   - Registers OpenAPI path specifications
   - Defines express routes with controllers

2. **Zod Schemas** (e.g., `category.dto.ts`)
   - Defines request/response data structures
   - Used for both validation and documentation

3. **openAPIDocumentGenerator.ts**
   - Combines all registries
   - Generates the complete OpenAPI spec
   - Returns a document ready for Swagger UI

4. **openAPIRouter.ts**
   - Serves Swagger UI at `/api/docs`
   - Serves raw spec at `/api/swagger.json`

## How It Works

### Step 1: Create Zod Schemas

Define your data structures using Zod:

```typescript
// category.dto.ts
import { z } from "zod";

export const CategorySchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	description: z.string().nullable().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const CreateCategorySchema = z.object({
	name: z.string(),
	description: z.string().nullable(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();
```

### Step 2: Create Router with OpenAPI Registration

In your router file, register both the schema and the path:

```typescript
// categoryRouter.ts
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

export const categoryRegistry = new OpenAPIRegistry();
export const categoryRouter: Router = express.Router();

// Register the schema
categoryRegistry.register("Category", CategorySchema);

// Register API path with documentation
categoryRegistry.registerPath({
	method: "get",
	path: "/api/categories",
	tags: ["Category"],
	responses: createApiResponse(z.array(CategorySchema), "Categories retrieved successfully"),
});

// Define the actual route
categoryRouter.get("/", categoryController.getCategories);
```

### Step 3: Add Router to OpenAPI Document Generator

Include your registry in the document generator:

```typescript
// openAPIDocumentGenerator.ts
export function generateOpenAPIDocument(): OpenAPIDocument {
	const registry = new OpenAPIRegistry([
		// ... other registries
		categoryRegistry,  // Add your registry here
	]);
	
	const generator = new OpenApiGeneratorV3(registry.definitions);
	// ... rest of generator
}
```

### Step 4: Mount Router in API Routes

Add your router to either admin or client router:

```typescript
// adminRouter.ts
adminRouter.use("/categories", categoryRouter);
```

## Accessing the Documentation

- **Swagger UI**: http://localhost:3000/api/docs
- **Raw OpenAPI Spec**: http://localhost:3000/api/swagger.json

## Common Patterns

### GET All Endpoint

```typescript
categoryRegistry.registerPath({
	method: "get",
	path: "/api/categories",
	tags: ["Category"],
	responses: createApiResponse(z.array(CategorySchema), "Success"),
});

categoryRouter.get("/", categoryController.getCategories);
```

### GET by ID Endpoint

```typescript
categoryRegistry.registerPath({
	method: "get",
	path: "/api/categories/{id}",
	tags: ["Category"],
	request: { params: z.object({ id: commonValidations.id }) },
	responses: createApiResponse(CategorySchema, "Success"),
});

categoryRouter.get(
	"/:id",
	validateRequest(z.object({ params: z.object({ id: commonValidations.id }) })),
	categoryController.getCategoryById
);
```

### POST Create Endpoint

```typescript
categoryRegistry.registerPath({
	method: "post",
	path: "/api/categories",
	tags: ["Category"],
	request: {
		body: {
			description: "Create category payload",
			content: {
				"application/json": {
					schema: CreateCategorySchema,
				},
			},
		},
	},
	responses: createApiResponse(CategorySchema, "Category created successfully"),
});

categoryRouter.post(
	"/",
	adminAuthMiddleware,
	validateRequest(z.object({ body: CreateCategorySchema })),
	categoryController.createCategory
);
```

### PATCH Update Endpoint

```typescript
categoryRegistry.registerPath({
	method: "patch",
	path: "/api/categories/{id}",
	tags: ["Category"],
	request: {
		params: z.object({ id: commonValidations.id }),
		body: {
			description: "Update category payload",
			content: {
				"application/json": {
					schema: UpdateCategorySchema,
				},
			},
		},
	},
	responses: createApiResponse(CategorySchema, "Category updated successfully"),
});

categoryRouter.patch(
	"/:id",
	adminAuthMiddleware,
	validateRequest(z.object({ params: z.object({ id: commonValidations.id }), body: UpdateCategorySchema })),
	categoryController.updateCategory
);
```

### DELETE Endpoint

```typescript
categoryRegistry.registerPath({
	method: "delete",
	path: "/api/categories/{id}",
	tags: ["Category"],
	request: { params: z.object({ id: commonValidations.id }) },
	responses: createApiResponse(z.null(), "Success"),
});

categoryRouter.delete(
	"/:id",
	adminAuthMiddleware,
	validateRequest(z.object({ params: z.object({ id: commonValidations.id }) })),
	categoryController.deleteCategory
);
```

## Best Practices

1. **Keep Schemas in Separate Files**: Define all Zod schemas in `*Model.ts` or `*.dto.ts` files
2. **Use commonValidations**: Reuse validation patterns from `common/utils/commonValidation.ts`
3. **Tag Your Endpoints**: Group related endpoints using tags (e.g., `tags: ["Category"]`)
4. **Use Descriptions**: Add clear descriptions to all endpoints and request bodies
5. **Match Paths**: Ensure registered paths match actual route paths (including `/api/` prefix)
6. **Validate Requests**: Use `validateRequest` middleware with Zod schemas
7. **Type Your Responses**: Use `createApiResponse` helper for consistent response format

## Response Format

All responses follow the `ServiceResponse` model:

```typescript
{
	success: boolean;
	message: string;
	statusCode: number;
	data: T;
}
```

This is automatically applied by the `createApiResponse` helper function.

## Adding a New API Module

To add documentation for a new API module:

1. Create schema definitions in `module/moduleModel.ts`
2. Create `module/moduleRouter.ts` with:
   - `OpenAPIRegistry` export
   - `Router` export
   - All path registrations
   - All route definitions
3. Export the `registry` in the router file
4. Add the registry to `openAPIDocumentGenerator.ts`
5. Mount the router in appropriate route file (admin/client)

## Troubleshooting

### Paths Not Appearing in Swagger UI

- Ensure the registered path matches the actual route (with `/api/` prefix)
- Verify the registry is added to `generateOpenAPIDocument()`
- Check that the router is mounted in server.ts

### Validation Errors

- Make sure Zod schemas are imported correctly
- Verify `validateRequest` middleware is used for request validation
- Check that schema keys match request data structure

### Response Type Mismatch

- Use `createApiResponse` helper for consistent response wrapping
- Ensure response schema matches the actual data type
- Check `ServiceResponse` model in `common/models/serviceResponse.ts`
