import express, { type Router } from "express";
import { authMiddleware } from "@/common/middleware/authMiddleware";
import { cartController } from "../cart/cartController";
import { dishController } from "../dish/dishController";
import { restaurantController } from "../restaurant/restaurantController";

export const clientRouter: Router = express.Router();
clientRouter.use(authMiddleware);

clientRouter.get("/restaurants/:id", restaurantController.getRestaurantById);
clientRouter.get("/restaurants", restaurantController.getRestaurants);
clientRouter.get("/dishes/:id", dishController.getDishById);
clientRouter.get("/dishes", dishController.getDishes);
clientRouter.get("/my-carts", cartController.getCarts);
clientRouter.post("/add-cart", cartController.createCart);
clientRouter.patch("/cart-items/:itemId", cartController.updateCartItem);
clientRouter.delete("/cart-items/:itemId", cartController.deleteCartItem);
