import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { restaurantController } from "@/api/restaurant/restaurantController";
import { CreateRestaurantSchema, RestaurantSchema, UpdateRestaurantSchema } from "@/api/restaurant/restaurantModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { requireRestaurantAccess } from "@/common/middleware/accessMiddleware";
import { authMiddleware } from "@/common/middleware/authMiddleware";
import { commonValidations } from "@/common/utils/commonValidation";
import { validateRequest } from "@/common/utils/httpHandlers";

export const restaurantRegistry = new OpenAPIRegistry();
export const restaurantRouter: Router = express.Router();
const basePath = "/api/admin/restaurants";

restaurantRegistry.register("Restaurant", RestaurantSchema);
// Swagger docs Generated
// GET /restaurants - Get all restaurants
restaurantRegistry.registerPath({
	method: "get",
	path: basePath,
	tags: ["Restaurant"],
	responses: createApiResponse(z.array(RestaurantSchema), "Restaurants retrieved successfully"),
});

// GET /restaurants/:restaurantId - Get restaurant by ID
restaurantRegistry.registerPath({
	method: "get",
	path: `${basePath}/{restaurantId}`,
	tags: ["Restaurant"],
	request: { params: z.object({ restaurantId: commonValidations.id }) },
	responses: createApiResponse(RestaurantSchema, "Restaurant retrieved successfully"),
});

// POST /restaurants - Create new restaurant (Admin only)
restaurantRegistry.registerPath({
	method: "post",
	path: basePath,
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

// PATCH /restaurants/:restaurantId - Update restaurant (Admin only)
restaurantRegistry.registerPath({
	method: "patch",
	path: `${basePath}/{restaurantId}`,
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

restaurantRouter.get("/", authMiddleware, restaurantController.getRestaurants);

restaurantRouter.get("/my", authMiddleware, restaurantController.getMyRestaurants);

restaurantRouter.get(
	"/:restaurantId",
	authMiddleware,
	requireRestaurantAccess("OWNER", "ADMIN", "STAFF"),
	validateRequest(z.object({ params: z.object({ restaurantId: commonValidations.id }) })),
	restaurantController.getRestaurantById,
);

restaurantRouter.post(
	"/",
	authMiddleware,
	// authorizePermissions(PERMISSIONS.MANAGE_RESTAURANTS),
	requireRestaurantAccess("OWNER", "ADMIN"),
	validateRequest(z.object({ body: CreateRestaurantSchema })),
	restaurantController.createRestaurant,
);
restaurantRouter.patch(
	"/:restaurantId",
	authMiddleware,
	// authorizePermissions(PERMISSIONS.MANAGE_RESTAURANTS),
	requireRestaurantAccess("OWNER", "ADMIN", "STAFF"),
	validateRequest(z.object({ params: z.object({ restaurantId: commonValidations.id }), body: UpdateRestaurantSchema })),
	restaurantController.updateRestaurant,
);
