import express, { type Router } from "express";
import { restaurantRouter } from "@/api/restaurant/restaurantRouter";

export const clientRouter: Router = express.Router();

clientRouter.use("/restaurants", restaurantRouter);
