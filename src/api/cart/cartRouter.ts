import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { commonValidations } from "@/common/utils/commonValidation";
import { CartWithItemsSchema, CreateCartSchema, UpdateCartItemSchema } from "./cart.dto";
import { cartController } from "./cartController";

export const cartRegistry = new OpenAPIRegistry();
export const cartRouter: Router = express.Router();

cartRegistry.register("Cart", CartWithItemsSchema);

cartRegistry.registerPath({
	method: "get",
	path: "/api/admin/carts",
	tags: ["Cart"],
	responses: createApiResponse(z.array(CartWithItemsSchema), "Carts retrieved successfully"),
});

cartRegistry.registerPath({
	method: "post",
	path: "/api/admin/carts",
	tags: ["Cart"],
	request: {
		body: {
			description: "Add items to cart payload",
			content: {
				"application/json": {
					schema: CreateCartSchema,
				},
			},
		},
	},
	responses: createApiResponse(CartWithItemsSchema, "Cart created or updated successfully"),
});

cartRegistry.registerPath({
	method: "patch",
	path: "/api/admin/carts/items/{itemId}",
	tags: ["Cart"],
	request: {
		params: z.object({ itemId: commonValidations.id }),
		body: {
			description: "Update cart item payload",
			content: {
				"application/json": {
					schema: UpdateCartItemSchema,
				},
			},
		},
	},
	responses: createApiResponse(CartWithItemsSchema, "Cart item updated successfully"),
});

cartRegistry.registerPath({
	method: "delete",
	path: "/api/admin/carts/items/{itemId}",
	tags: ["Cart"],
	request: { params: z.object({ itemId: commonValidations.id }) },
	responses: createApiResponse(z.null(), "Cart item deleted successfully"),
});

// Routes admin only can view
cartRouter.get("/", cartController.getCarts);
cartRouter.post("/", cartController.createCart);
cartRouter.patch("/items/:itemId", cartController.updateCartItem);
cartRouter.delete("/items/:itemId", cartController.deleteCartItem);
