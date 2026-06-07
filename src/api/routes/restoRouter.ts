import express, { type Router } from "express";
import { z } from "zod";
import { adminAuthMiddleware } from "@/common/middleware/adminAuthMiddleware";
import { authMiddleware } from "@/common/middleware/authMiddleware";
import { restaurantAccessMiddleware } from "@/common/middleware/restaurantAccessMiddleware";
import { commonValidations } from "@/common/utils/commonValidation";
import { validateRequest } from "@/common/utils/httpHandlers";
import { authController } from "../auth/authController";
import { RestaurantLoginRequestSchema } from "../auth/authModel";
import { restaurantController } from "../restaurant/restaurantController";
import { CreateRestaurantSchema, UpdateRestaurantSchema } from "../restaurant/restaurantModel";

export const restoRouter: Router = express.Router();

restoRouter.post("/login", validateRequest(RestaurantLoginRequestSchema), authController.loginRestaurant);

restoRouter.get("/restaurants", authMiddleware, restaurantController.getMyRestaurants);

restoRouter.get(
	"/restaurants/:restaurantId",
	restaurantAccessMiddleware(["OWNER", "ADMIN", "STAFF"]),
	validateRequest(z.object({ params: z.object({ restaurantId: commonValidations.id }) })),
	restaurantController.getRestaurantById,
);

restoRouter.patch(
	"/restaurants/:restaurantId",
	restaurantAccessMiddleware(["OWNER"]),
	validateRequest(z.object({ params: z.object({ restaurantId: commonValidations.id }), body: UpdateRestaurantSchema })),
	restaurantController.updateRestaurant,
);
