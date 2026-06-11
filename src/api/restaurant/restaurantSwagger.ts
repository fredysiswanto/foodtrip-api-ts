import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { commonValidations } from "@/common/utils/commonValidation";
import { CreateRestaurantSchema, RestaurantSchema, UpdateRestaurantSchema } from "./restaurantModel";
export const restaurantRegistry = new OpenAPIRegistry();
export const clientRestaurantRegistry = new OpenAPIRegistry();

const basePath = "/api/admin/restaurants";
const clientBasePath = "/api/restaurants";

// Client APIs
clientRestaurantRegistry.register("Restaurant", RestaurantSchema);
// GET /restaurants - Get all restaurants
clientRestaurantRegistry.registerPath({
	method: "get",
	path: clientBasePath,
	tags: ["Client Restaurant"],
	summary: "Get all restaurants",
	description: "Return list of all Restaurants.",
	parameters: [
		{
			name: "search",
			in: "query",
			description: "Search restaurants by name",
			required: false,
			schema: {
				type: "string",
			},
		},
		{
			name: "page",
			in: "query",
			description: "Page number for pagination (default: 1)",
			required: false,
			schema: {
				type: "string",
			},
		},
		{
			name: "limit",
			in: "query",
			description: "Number of items per page for pagination (default: 10)",
			required: false,
			schema: {
				type: "string",
			},
		},
		{
			name: "sortBy",
			in: "query",
			description: "Field to sort by (name, status,createdAt)",
			required: false,
			schema: {
				type: "string",
				enum: ["name", "status", "createdAt"],
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
	responses: createApiResponse(z.array(RestaurantSchema), "Restaurants retrieved successfully"),
});

clientRestaurantRegistry.registerPath({
	method: "get",
	path: `${clientBasePath}/{restaurantId}`,
	tags: ["Client Restaurant"],
	request: { params: z.object({ restaurantId: commonValidations.id }) },
	summary: "Get restaurant by ID",
	description: "Return single data Restaurant.",
	responses: createApiResponse(RestaurantSchema, "Restaurant retrieved successfully"),
});

// Admin APIs
restaurantRegistry.register("Restaurant", RestaurantSchema);
// GET /restaurants - Get all restaurants
restaurantRegistry.registerPath({
	method: "get",
	path: basePath,
	tags: ["Restaurant"],
	summary: "Get all restaurants",
	responses: createApiResponse(z.array(RestaurantSchema), "Restaurants retrieved successfully"),
});

// GET /restaurants/:restaurantId - Get restaurant by ID
restaurantRegistry.registerPath({
	method: "get",
	path: `${basePath}/{restaurantId}`,
	tags: ["Restaurant"],
	summary: "Get restaurant by ID",
	request: { params: z.object({ restaurantId: commonValidations.id }) },
	responses: createApiResponse(RestaurantSchema, "Restaurant retrieved successfully"),
});

// POST /restaurants - Create new restaurant (Admin only)
restaurantRegistry.registerPath({
	method: "post",
	path: basePath,
	tags: ["Restaurant"],
	summary: "Create new restaurant",
	request: {
		body: {
			description: "Create restaurant payload",
			content: {
				"application/json": {
					schema: CreateRestaurantSchema,
				},
			},
		},
	},
	responses: createApiResponse(RestaurantSchema, "Restaurant created successfully"),
});

// PATCH /restaurants/:restaurantId - Update restaurant (Admin only)
restaurantRegistry.registerPath({
	method: "patch",
	path: `${basePath}/{restaurantId}`,
	tags: ["Restaurant"],
	summary: "Update restaurant",
	request: {
		params: z.object({ restaurantId: commonValidations.id }),
		body: {
			description: "Update restaurant payload",
			content: {
				"application/json": {
					schema: UpdateRestaurantSchema,
				},
			},
		},
	},
	responses: createApiResponse(RestaurantSchema, "Restaurant updated successfully"),
});
