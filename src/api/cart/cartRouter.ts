import express, { type Router } from "express";
import { cartController } from "./cartController";

export const cartRouter: Router = express.Router();

// Routes admin only can view
cartRouter.get("/", cartController.getCarts);
cartRouter.post("/", cartController.createCart);
