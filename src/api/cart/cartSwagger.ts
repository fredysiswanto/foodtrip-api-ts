import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { commonValidations } from "@/common/utils/commonValidation";
import { CartWithItemsSchema, CreateCartSchema, UpdateCartItemSchema } from "./cart.dto";

export const cartRegistry = new OpenAPIRegistry();
export const clientCartRegistry = new OpenAPIRegistry();

const adminBasePath = "/api/admin/carts";

// Client APIs
clientCartRegistry.register("Cart", CartWithItemsSchema);
clientCartRegistry.registerPath({
	method: "get",
	path: "/api/my-carts",
	tags: ["Client Cart"],
	summary: "Get cart for a user",
	responses: createApiResponse(z.array(CartWithItemsSchema), "Carts retrieved successfully", StatusCodes.OK, true),
});

clientCartRegistry.registerPath({
	method: "post",
	path: "/api/add-cart",
	tags: ["Client Cart"],
	summary: "Add cart for a user",
	request: {
		body: {
			description: "Create cart payload",
			content: {
				"application/json": {
					schema: CreateCartSchema.omit({ userId: true }),
				},
			},
		},
	},
	responses: createApiResponse(CartWithItemsSchema, "Cart created successfully", StatusCodes.CREATED),
});

clientCartRegistry.registerPath({
	method: "patch",
	path: "/api/cart-items/{itemId}",
	tags: ["Client Cart"],
	summary: "Update cart item for a user",
	request: { params: z.object({ itemId: commonValidations.id }) },
	responses: createApiResponse(CartWithItemsSchema, "Cart item updated successfully", StatusCodes.OK),
});

clientCartRegistry.registerPath({
	method: "delete",
	path: "/api/cart-items/{itemId}",
	tags: ["Client Cart"],
	summary: "Delete cart item for a user",
	request: { params: z.object({ itemId: commonValidations.id }) },
	responses: createApiResponse(z.null(), "Cart item deleted successfully"),
});

// Admin APIs

cartRegistry.register("Cart", CartWithItemsSchema);

cartRegistry.registerPath({
	method: "get",
	path: adminBasePath,
	tags: ["Cart"],
	responses: createApiResponse(z.array(CartWithItemsSchema), "Carts retrieved successfully", StatusCodes.OK, true),
});

cartRegistry.registerPath({
	method: "post",
	path: adminBasePath,
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
	responses: createApiResponse(CartWithItemsSchema, "Cart created or updated successfully", StatusCodes.CREATED),
});

cartRegistry.registerPath({
	method: "patch",
	path: `${adminBasePath}/items/{itemId}`,
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
	path: `${adminBasePath}/items/{itemId}`,
	tags: ["Cart"],
	request: { params: z.object({ itemId: commonValidations.id }) },
	responses: createApiResponse(z.null(), "Cart item deleted successfully"),
});
