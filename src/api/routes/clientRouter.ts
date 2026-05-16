import express, { type Router } from "express";
import { restaurantController } from "@/api/restaurant/restaurantController";

export const clientRouter: Router = express.Router();

clientRouter.get("/restaurants", restaurantController.getRestaurants);
clientRouter.get("/restaurants/:restaurantId", restaurantController.getRestaurantById);
