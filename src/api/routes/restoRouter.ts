import express, { type Router } from "express";
import { validateRequest } from "@/common/utils/httpHandlers";
import { authController } from "../auth/authController";
import { RestaurantLoginRequestSchema } from "../auth/authModel";

export const restoRouter: Router = express.Router();

restoRouter.post("/login", validateRequest(RestaurantLoginRequestSchema), authController.loginRestaurant);
