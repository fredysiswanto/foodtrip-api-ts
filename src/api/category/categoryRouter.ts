import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { CategorySchema, CreateCategorySchema, UpdateCategorySchema } from "@/api/category/category.dto";
import { categoryController } from "@/api/category/categoryController";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { adminAuthMiddleware } from "@/common/middleware/adminAuthMiddleware";
import { commonValidations } from "@/common/utils/commonValidation";
import { validateRequest } from "@/common/utils/httpHandlers";

export const categoryRegistry = new OpenAPIRegistry();
export const categoryRouter: Router = express.Router();

categoryRegistry.register("Category", CategorySchema);

// GET /categories - Get all categories
categoryRegistry.registerPath({
	method: "get",
	path: "/api/categories",
	tags: ["Category"],
	responses: createApiResponse(z.array(CategorySchema), "Categories retrieved successfully"),
});

categoryRouter.get("/", categoryController.getCategories);

// GET /categories/:id - Get category by ID
categoryRegistry.registerPath({
	method: "get",
	path: "/api/categories/{id}",
	tags: ["Category"],
	request: { params: z.object({ id: commonValidations.id }) },
	responses: createApiResponse(CategorySchema, "Category retrieved successfully"),
});

categoryRouter.get(
	"/:id",
	validateRequest(z.object({ params: z.object({ id: commonValidations.id }) })),
	categoryController.getCategoryById,
);

// POST /categories - Create new category (Admin only)
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
	categoryController.createCategory,
);

// PATCH /categories/:id - Update category (Admin only)
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
	categoryController.updateCategory,
);

// DELETE /categories/:id - Delete category (Admin only)
categoryRegistry.registerPath({
	method: "delete",
	path: "/api/categories/{id}",
	tags: ["Category"],
	request: { params: z.object({ id: commonValidations.id }) },
	responses: createApiResponse(z.null(), "Category deleted successfully"),
});

categoryRouter.delete(
	"/:id",
	adminAuthMiddleware,
	validateRequest(z.object({ params: z.object({ id: commonValidations.id }) })),
	categoryController.deleteCategory,
);
