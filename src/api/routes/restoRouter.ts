import express, { type Router } from "express";
import { z } from "zod";
import { authMiddleware } from "@/common/middleware/authMiddleware";
import { dishAccessMiddleware, restaurantAccessMiddleware } from "@/common/middleware/restaurantAccessMiddleware";
import { restoAuthMiddleware } from "@/common/middleware/restoAuthMiddleware";
import { commonValidations } from "@/common/utils/commonValidation";
import { validateRequest } from "@/common/utils/httpHandlers";
import { authController } from "../auth/authController";
import { RestaurantLoginRequestSchema } from "../auth/authModel";
import { dishController } from "../dish/dishController";
import { CreateDishSchema, UpdateDishSchema } from "../dish/dishModel";
import { dishRouter } from "../dish/dishRouter";
import { restaurantController } from "../restaurant/restaurantController";
import { UpdateRestaurantSchema } from "../restaurant/restaurantModel";

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

restoRouter.get("/dishes", restoAuthMiddleware, dishController.getDishesByRestaurant);
restoRouter.get(
	"/:id",
	dishAccessMiddleware(["OWNER", "ADMIN", "STAFF"]),
	validateRequest(z.object({ params: z.object({ id: commonValidations.id }) })),
	dishController.getDishById,
);
dishRouter.post(
	"/",
	restaurantAccessMiddleware(["OWNER", "ADMIN"]),
	validateRequest(z.object({ body: CreateDishSchema })),
	dishController.createDish,
);

dishRouter.patch(
	"/:id",
	dishAccessMiddleware(["OWNER", "ADMIN"]),
	validateRequest(z.object({ params: z.object({ id: commonValidations.id }), body: UpdateDishSchema })),
	dishController.updateDish,
);

dishRouter.delete(
	"/:id",
	dishAccessMiddleware(["OWNER", "ADMIN"]),
	validateRequest(z.object({ params: z.object({ id: commonValidations.id }) })),
	dishController.deleteDish,
);
