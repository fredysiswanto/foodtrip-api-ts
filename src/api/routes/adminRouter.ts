import express, { type Router } from "express";
import { dishController } from "@/api/dish/dishController";
import { restaurantController } from "@/api/restaurant/restaurantController";
import { adminAuthMiddleware } from "@/common/middleware/adminAuthMiddleware";
import { uploadMiddleware } from "@/common/utils/uploadHelper";
import { categoryController } from "../category/categoryController";
import { uploadController } from "../upload/uploadController";

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

adminRouter.post("/uploads", uploadMiddleware.single("file"), uploadController.create);
adminRouter.get("/uploads", uploadController.getUploads);
adminRouter.get("/uploads/:id", uploadController.getUploadById);
adminRouter.delete("/uploads/:id", uploadController.deleteUpload);

adminRouter.get("/categories", categoryController.getCategories);
adminRouter.get("/categories/:id", categoryController.getCategoryById);
adminRouter.post("/categories", categoryController.createCategory);
adminRouter.patch("/categories/:id", categoryController.updateCategory);
adminRouter.delete("/categories/:id", categoryController.deleteCategory);
