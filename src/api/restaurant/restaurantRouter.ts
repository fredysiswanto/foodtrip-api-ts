import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { restaurantController } from "@/api/restaurant/restaurantController";
import { CreateRestaurantSchema, RestaurantSchema, UpdateRestaurantSchema } from "@/api/restaurant/restaurantModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { adminAuthMiddleware } from "@/common/middleware/adminAuthMiddleware";
import { commonValidations } from "@/common/utils/commonValidation";
import { validateRequest } from "@/common/utils/httpHandlers";

export const restaurantRegistry = new OpenAPIRegistry();
export const restaurantRouter: Router = express.Router();

restaurantRegistry.register("Restaurant", RestaurantSchema);

// GET /restaurants - Get all restaurants
restaurantRegistry.registerPath({
	method: "get",
	path: "/api/restaurants",
	tags: ["Restaurant"],
	responses: createApiResponse(z.array(RestaurantSchema), "Restaurants retrieved successfully"),
});

restaurantRouter.get("/", restaurantController.getRestaurants);

// GET /restaurants/:restaurantId - Get restaurant by ID
restaurantRegistry.registerPath({
	method: "get",
	path: "/api/restaurants/{restaurantId}",
	tags: ["Restaurant"],
	request: { params: z.object({ restaurantId: commonValidations.id }) },
	responses: createApiResponse(RestaurantSchema, "Restaurant retrieved successfully"),
});

restaurantRouter.get(
	"/:restaurantId",
	validateRequest(z.object({ params: z.object({ restaurantId: commonValidations.id }) })),
	restaurantController.getRestaurantById,
);

// POST /restaurants - Create new restaurant (Admin only)
restaurantRegistry.registerPath({
	method: "post",
	path: "/api/restaurants",
	tags: ["Restaurant"],
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

restaurantRouter.post(
	"/",
	adminAuthMiddleware,
	validateRequest(z.object({ body: CreateRestaurantSchema })),
	restaurantController.createRestaurant,
);

// PATCH /restaurants/:restaurantId - Update restaurant (Admin only)
restaurantRegistry.registerPath({
	method: "patch",
	path: "/api/restaurants/{restaurantId}",
	tags: ["Restaurant"],
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

restaurantRouter.patch(
	"/:restaurantId",
	adminAuthMiddleware,
	validateRequest(z.object({ params: z.object({ restaurantId: commonValidations.id }), body: UpdateRestaurantSchema })),
	restaurantController.updateRestaurant,
);
