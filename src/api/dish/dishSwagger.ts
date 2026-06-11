import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { StatusCodes } from "http-status-codes/build/cjs/status-codes";
import { z } from "zod";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { commonValidations } from "@/common/utils/commonValidation";
import { CreateDishSchema, DishSchema, UpdateDishSchema } from "./dishModel";

export const dishRegistry = new OpenAPIRegistry();
export const clientDishRegistry = new OpenAPIRegistry();

const adminBasePath = "/api/admin/dishes";
const clientBasePath = "/api/dishes";

// Client APIs
clientDishRegistry.register("Dish", DishSchema);
// GET /dishes - Get all dishes for a restaurant
clientDishRegistry.registerPath({
	method: "get",
	path: clientBasePath,
	tags: ["Client Dish"],
	summary: "Get all dishes",
	parameters: [
		{
			name: "page",
			in: "query",
			description: "Page number for pagination (default: 1)",
			required: true,
			schema: {
				type: "string",
			},
		},
		{
			name: "limit",
			in: "query",
			description: "Number of items per page for pagination (default: 10)",
			required: true,
			schema: {
				type: "string",
			},
		},
		{
			name: "search",
			in: "query",
			description: "Search dishes by name or by restaurant name",
			required: false,
			schema: {
				type: "string",
			},
		},
		{
			name: "sortBy",
			in: "query",
			description: "Field to sort by (name, price,createdAt)",
			required: false,
			schema: {
				type: "string",
				enum: ["name", "price", "createdAt"],
			},
		},
		{
			name: "sortOrder",
			in: "query",
			description: "Sort order (asc or desc)",
			required: false,
			schema: {
				type: "string",
				enum: ["asc", "desc"],
			},
		},
	],
	responses: createApiResponse(z.array(DishSchema), "Dishes retrieved successfully", StatusCodes.OK, true),
});

clientDishRegistry.registerPath({
	method: "get",
	path: `${clientBasePath}/{id}`,
	tags: ["Client Dish"],
	request: { params: z.object({ id: commonValidations.id }) },
	summary: "Get dish by ID",
	responses: createApiResponse(DishSchema, "Dish retrieved successfully"),
});

// Admin APIs
dishRegistry.register("Dish", DishSchema);
// Swagger docs Generated
// GET /dishes - Get all dishes
dishRegistry.registerPath({
	method: "get",
	path: adminBasePath,
	tags: ["Dish"],
	summary: "Get all dishes",
	parameters: [
		{
			name: "page",
			in: "query",
			description: "Page number for pagination (default: 1)",
			required: true,
			schema: {
				type: "string",
			},
		},
		{
			name: "limit",
			in: "query",
			description: "Number of items per page for pagination (default: 10)",
			required: true,
			schema: {
				type: "string",
			},
		},
		{
			name: "search",
			in: "query",
			description: "Search dishes by name or by restaurant name",
			required: false,
			schema: {
				type: "string",
			},
		},
		{
			name: "sortBy",
			in: "query",
			description: "Field to sort by (name, price,createdAt)",
			required: false,
			schema: {
				type: "string",
				enum: ["name", "price", "createdAt"],
			},
		},
		{
			name: "sortOrder",
			in: "query",
			description: "Sort order (asc or desc)",
			required: false,
			schema: {
				type: "string",
				enum: ["asc", "desc"],
			},
		},
	],
	responses: createApiResponse(z.array(DishSchema), "Dishes retrieved successfully", StatusCodes.OK, true),
});

// GET /dishes/:id - Get dish by ID
dishRegistry.registerPath({
	method: "get",
	path: `${adminBasePath}/{id}`,
	tags: ["Dish"],
	request: { params: z.object({ id: commonValidations.id }) },
	summary: "Get dish by ID",
	responses: createApiResponse(DishSchema, "Dish retrieved successfully"),
});

// POST /dishes - Create new dish (Admin only)
dishRegistry.registerPath({
	method: "post",
	path: adminBasePath,
	tags: ["Dish"],
	summary: "Create new dish",
	request: {
		body: {
			description: "Create dish payload",
			content: {
				"application/json": {
					schema: CreateDishSchema,
				},
			},
		},
	},
	responses: createApiResponse(DishSchema, "Dish created successfully", StatusCodes.CREATED),
});

// PATCH /dishes/:id - Update dish (Admin only)
dishRegistry.registerPath({
	method: "patch",
	path: `${adminBasePath}/{id}`,
	tags: ["Dish"],
	summary: "Update dish",
	request: {
		params: z.object({ id: commonValidations.id }),
		body: {
			description: "Update dish payload",
			content: {
				"application/json": {
					schema: UpdateDishSchema,
				},
			},
		},
	},
	responses: createApiResponse(DishSchema, "Dish updated successfully"),
});

// DELETE /dishes/:id - Delete dish (Admin only)
dishRegistry.registerPath({
	method: "delete",
	path: `${adminBasePath}/{id}`,
	tags: ["Dish"],
	summary: "Delete dish",
	request: { params: z.object({ id: commonValidations.id }) },
	responses: createApiResponse(z.null(), "Dish deleted successfully"),
});
