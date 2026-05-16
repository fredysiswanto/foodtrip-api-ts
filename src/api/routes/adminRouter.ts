import express, { type Router } from "express";
import { dishController } from "@/api/dish/dishController";
import { restaurantController } from "@/api/restaurant/restaurantController";
import { adminAuthMiddleware } from "@/common/middleware/adminAuthMiddleware";

export const adminRouter: Router = express.Router();

adminRouter.use(adminAuthMiddleware);

adminRouter.get("/restaurants", restaurantController.getRestaurants);
adminRouter.post("/restaurants", restaurantController.createRestaurant);
adminRouter.patch("/restaurants/:restaurantId", restaurantController.updateRestaurant);

adminRouter.get("/dishes", dishController.getDishes);
adminRouter.get("/dishes/:id", dishController.getDishById);
adminRouter.post("/dishes", dishController.createDish);
adminRouter.patch("/dishes/:id", dishController.updateDish);
adminRouter.delete("/dishes/:id", dishController.deleteDish);
