import express from "express";
import { restaurantController } from "@/api/restaurant/restaurantController";
import { adminAuthMiddleware } from "@/common/middleware/adminAuthMiddleware";

export const adminRouter = express.Router();

adminRouter.use(adminAuthMiddleware);

adminRouter.get("/restaurants", restaurantController.getRestaurants);
adminRouter.post("/restaurants", restaurantController.createRestaurant);
adminRouter.patch("/restaurants/:restaurantId", restaurantController.updateRestaurant);
