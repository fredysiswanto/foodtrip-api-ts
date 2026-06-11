import express, { type Router } from "express";
import { z } from "zod";
import { dishController } from "@/api/dish/dishController";
import { CreateDishSchema, UpdateDishSchema } from "@/api/dish/dishModel";
import { authMiddleware } from "@/common/middleware/authMiddleware";
import { dishAccessMiddleware, restaurantAccessMiddleware } from "@/common/middleware/restaurantAccessMiddleware";
import { commonValidations } from "@/common/utils/commonValidation";
import { validateRequest } from "@/common/utils/httpHandlers";

export const dishRouter: Router = express.Router();

dishRouter.get("/", authMiddleware, dishController.getDishes);

dishRouter.get(
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
