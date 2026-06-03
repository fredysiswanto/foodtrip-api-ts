import express, { type Router } from "express";
import { categoryRouter } from "@/api/category/categoryRouter";
import { dishRouter } from "@/api/dish/dishRouter";
import { orderRouter } from "@/api/order/orderRouter";
import { restaurantRouter } from "@/api/restaurant/restaurantRouter";
import { uploadRouter } from "@/api/upload/uploadRouter";
import { userRouter } from "@/api/user/userRouter";
import { adminAuthMiddleware } from "@/common/middleware/adminAuthMiddleware";
import { cartController } from "../cart/cartController";

export const adminRouter: Router = express.Router();

adminRouter.use("/restaurants", restaurantRouter);
adminRouter.use("/dishes", dishRouter);
adminRouter.use("/uploads", uploadRouter);
adminRouter.use("/categories", categoryRouter);
adminRouter.use("/users", userRouter);
adminRouter.use("/orders", orderRouter);
adminRouter.get("/carts", adminAuthMiddleware, cartController.getCarts);
