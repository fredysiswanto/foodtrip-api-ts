import express, { type Router } from "express";
import { categoryRouter } from "@/api/category/categoryRouter";
import { dishRouter } from "@/api/dish/dishRouter";
import { restaurantRouter } from "@/api/restaurant/restaurantRouter";
import { uploadRouter } from "@/api/upload/uploadRouter";
import { userRouter } from "@/api/user/userRouter";
import { adminAuthMiddleware } from "@/common/middleware/adminAuthMiddleware";

export const adminRouter: Router = express.Router();

adminRouter.use(adminAuthMiddleware);

adminRouter.use("/restaurants", restaurantRouter);
adminRouter.use("/dishes", dishRouter);
adminRouter.use("/uploads", uploadRouter);
adminRouter.use("/categories", categoryRouter);
adminRouter.use("/users", userRouter);
