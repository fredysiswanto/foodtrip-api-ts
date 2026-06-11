import express, { type Router } from "express";
import { z } from "zod";
import { restaurantController } from "@/api/restaurant/restaurantController";
import { CreateRestaurantSchema, UpdateRestaurantSchema } from "@/api/restaurant/restaurantModel";
import { requireRestaurantAccess } from "@/common/middleware/accessMiddleware";
import { authMiddleware } from "@/common/middleware/authMiddleware";
import { commonValidations } from "@/common/utils/commonValidation";
import { validateRequest } from "@/common/utils/httpHandlers";

export const restaurantRouter: Router = express.Router();

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
	// requireRestaurantAccess("OWNER", "ADMIN"),
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
