import express, { type Router } from "express";
import { z } from "zod";
import { CreateCategorySchema, UpdateCategorySchema } from "@/api/category/category.dto";
import { categoryController } from "@/api/category/categoryController";
import { adminAuthMiddleware } from "@/common/middleware/adminAuthMiddleware";
import { commonValidations } from "@/common/utils/commonValidation";
import { validateRequest } from "@/common/utils/httpHandlers";

export const categoryRouter: Router = express.Router();

// Routes
categoryRouter.get("/", categoryController.getCategories);
categoryRouter.get(
	"/:id",
	validateRequest(z.object({ params: z.object({ id: commonValidations.id }) })),
	categoryController.getCategoryById,
);
categoryRouter.post(
	"/",
	adminAuthMiddleware,
	validateRequest(z.object({ body: CreateCategorySchema })),
	categoryController.createCategory,
);
categoryRouter.patch(
	"/:id",
	adminAuthMiddleware,
	validateRequest(z.object({ params: z.object({ id: commonValidations.id }), body: UpdateCategorySchema })),
	categoryController.updateCategory,
);
categoryRouter.delete(
	"/:id",
	adminAuthMiddleware,
	validateRequest(z.object({ params: z.object({ id: commonValidations.id }) })),
	categoryController.deleteCategory,
);
