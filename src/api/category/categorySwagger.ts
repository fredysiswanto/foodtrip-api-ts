import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { commonValidations } from "@/common/utils/commonValidation";
import { CategorySchema, CreateCategorySchema, UpdateCategorySchema } from "./category.dto";

export const categoryRegistry = new OpenAPIRegistry();
export const clientCategoryRegistry = new OpenAPIRegistry();

const adminBasePath = "/api/admin/categories";
const clientBasePath = "/api/categories";

// Client APIs
clientCategoryRegistry.register("Category", CategorySchema);

clientCategoryRegistry.registerPath({
	method: "get",
	path: clientBasePath,
	tags: ["Client Category"],
	summary: "Get all categories",
	responses: createApiResponse(z.array(CategorySchema), "Categories retrieved successfully"),
});

clientCategoryRegistry.registerPath({
	method: "get",
	path: `${clientBasePath}/{id}`,
	tags: ["Client Category"],
	summary: "Get category by ID",
	request: { params: z.object({ id: commonValidations.id }) },
	responses: createApiResponse(CategorySchema, "Category retrieved successfully"),
});

// Admin APIs

categoryRegistry.register("Category", CategorySchema);
// GET /categories - Get all categories
categoryRegistry.registerPath({
	method: "get",
	path: adminBasePath,
	tags: ["Category"],
	summary: "Get all categories",
	responses: createApiResponse(z.array(CategorySchema), "Categories retrieved successfully"),
});

// GET /categories/:id - Get category by ID
categoryRegistry.registerPath({
	method: "get",
	path: `${adminBasePath}/{id}`,
	tags: ["Category"],
	summary: "Get category by ID",
	request: { params: z.object({ id: commonValidations.id }) },
	responses: createApiResponse(CategorySchema, "Category retrieved successfully"),
});

// POST /categories - Create new category (Admin only)
categoryRegistry.registerPath({
	method: "post",
	path: adminBasePath,
	tags: ["Category"],
	summary: "Create new category",
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
	responses: createApiResponse(CategorySchema, "Category created successfully", StatusCodes.CREATED),
});

// PATCH /categories/:id - Update category (Admin only)
categoryRegistry.registerPath({
	method: "patch",
	path: `${adminBasePath}/{id}`,
	tags: ["Category"],
	summary: "Update category",
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

// DELETE /categories/:id - Delete category (Admin only)
categoryRegistry.registerPath({
	method: "delete",
	path: `${adminBasePath}/{id}`,
	tags: ["Category"],
	summary: "Delete category",
	request: { params: z.object({ id: commonValidations.id }) },
	responses: createApiResponse(z.null(), "Category deleted successfully"),
});
