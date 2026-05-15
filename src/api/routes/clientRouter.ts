import express from "express";
import { restaurantController } from "@/api/restaurant/restaurantController";

export const clientRouter = express.Router();

clientRouter.get("/restaurants", restaurantController.getRestaurants);
clientRouter.get("/restaurants/:restaurantId", restaurantController.getRestaurantById);
