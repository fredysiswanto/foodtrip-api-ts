import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { dishController } from "@/api/dish/dishController";
import { CreateDishSchema, DishSchema, UpdateDishSchema } from "@/api/dish/dishModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { adminAuthMiddleware } from "@/common/middleware/adminAuthMiddleware";
import { commonValidations } from "@/common/utils/commonValidation";
import { validateRequest } from "@/common/utils/httpHandlers";

export const dishRegistry = new OpenAPIRegistry();
export const dishRouter: Router = express.Router();

dishRegistry.register("Dish", DishSchema);
// Swagger docs Generated
// GET /dishes - Get all dishes
dishRegistry.registerPath({
	method: "get",
	path: "/api/admin/dishes",
	tags: ["Dish"],
	responses: createApiResponse(z.array(DishSchema), "Dishes retrieved successfully"),
});

// GET /dishes/:id - Get dish by ID
dishRegistry.registerPath({
	method: "get",
	path: "/api/admin/dishes/{id}",
	tags: ["Dish"],
	request: { params: z.object({ id: commonValidations.id }) },
	responses: createApiResponse(DishSchema, "Dish retrieved successfully"),
});

// POST /dishes - Create new dish (Admin only)
dishRegistry.registerPath({
	method: "post",
	path: "/api/admin/dishes",
	tags: ["Dish"],
	request: {
		body: {
			description: "Create dish payload",
			content: {
				"application/json": {
					schema: CreateDishSchema,
				},
			},
		},
	},
	responses: createApiResponse(DishSchema, "Dish created successfully"),
});

// PATCH /dishes/:id - Update dish (Admin only)
dishRegistry.registerPath({
	method: "patch",
	path: "/api/admin/dishes/{id}",
	tags: ["Dish"],
	request: {
		params: z.object({ id: commonValidations.id }),
		body: {
			description: "Update dish payload",
			content: {
				"application/json": {
					schema: UpdateDishSchema,
				},
			},
		},
	},
	responses: createApiResponse(DishSchema, "Dish updated successfully"),
});

// DELETE /dishes/:id - Delete dish (Admin only)
dishRegistry.registerPath({
	method: "delete",
	path: "/api/admin/dishes/{id}",
	tags: ["Dish"],
	request: { params: z.object({ id: commonValidations.id }) },
	responses: createApiResponse(z.null(), "Dish deleted successfully"),
});

dishRouter.get("/", dishController.getDishes);

dishRouter.get(
	"/:id",
	validateRequest(z.object({ params: z.object({ id: commonValidations.id }) })),
	dishController.getDishById,
);
dishRouter.post(
	"/",
	adminAuthMiddleware,
	validateRequest(z.object({ body: CreateDishSchema })),
	dishController.createDish,
);

dishRouter.patch(
	"/:id",
	adminAuthMiddleware,
	validateRequest(z.object({ params: z.object({ id: commonValidations.id }), body: UpdateDishSchema })),
	dishController.updateDish,
);

dishRouter.delete(
	"/:id",
	adminAuthMiddleware,
	validateRequest(z.object({ params: z.object({ id: commonValidations.id }) })),
	dishController.deleteDish,
);
