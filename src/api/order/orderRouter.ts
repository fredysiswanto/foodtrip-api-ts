import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { adminAuthMiddleware } from "@/common/middleware/adminAuthMiddleware";
import { orderAccessMiddleware } from "@/common/middleware/restaurantAccessMiddleware";
import { commonValidations } from "@/common/utils/commonValidation";
import { validateRequest } from "@/common/utils/httpHandlers";
import { CreateOrderSchema, OrderSchema, UpdateOrderPaymentStatusSchema, UpdateOrderStatusSchema } from "./order.dto";
import { orderController } from "./orderController";

export const orderRegistry = new OpenAPIRegistry();
export const orderRouter: Router = express.Router();

orderRegistry.register("Order", OrderSchema);

orderRegistry.registerPath({
	method: "get",
	path: "/api/admin/orders",
	tags: ["Order"],
	responses: createApiResponse(z.array(OrderSchema), "Orders retrieved successfully"),
});

orderRegistry.registerPath({
	method: "get",
	path: "/api/admin/orders/{id}",
	tags: ["Order"],
	request: { params: z.object({ id: commonValidations.id }) },
	responses: createApiResponse(OrderSchema, "Order retrieved successfully"),
});

orderRegistry.registerPath({
	method: "post",
	path: "/api/admin/orders",
	tags: ["Order"],
	request: {
		body: {
			description: "Create order payload",
			content: {
				"application/json": {
					schema: CreateOrderSchema,
				},
			},
		},
	},
	responses: createApiResponse(OrderSchema, "Order created successfully"),
});

orderRegistry.registerPath({
	method: "patch",
	path: "/api/admin/orders/{id}/status",
	tags: ["Order"],
	request: {
		params: z.object({ id: commonValidations.id }),
		body: {
			description: "Update order status payload",
			content: {
				"application/json": {
					schema: UpdateOrderStatusSchema,
				},
			},
		},
	},
	responses: createApiResponse(OrderSchema, "Order status updated successfully"),
});

orderRegistry.registerPath({
	method: "patch",
	path: "/api/admin/orders/{id}/payment-status",
	tags: ["Order"],
	request: {
		params: z.object({ id: commonValidations.id }),
		body: {
			description: "Update order payment status payload",
			content: {
				"application/json": {
					schema: UpdateOrderPaymentStatusSchema,
				},
			},
		},
	},
	responses: createApiResponse(OrderSchema, "Order payment status updated successfully"),
});

orderRouter.get("/", adminAuthMiddleware, orderController.getOrdersAdmin);
orderRouter.get(
	"/:id",
	orderAccessMiddleware(["OWNER", "ADMIN", "STAFF"]),
	validateRequest(z.object({ params: z.object({ id: commonValidations.id }) })),
	orderController.getOrderByIdAdmin,
);
orderRouter.post(
	"/",
	adminAuthMiddleware,
	validateRequest(z.object({ body: CreateOrderSchema })),
	orderController.createOrder,
);
orderRouter.patch(
	"/:id/status",
	orderAccessMiddleware(["OWNER", "ADMIN", "STAFF"]),
	validateRequest(z.object({ params: z.object({ id: commonValidations.id }), body: UpdateOrderStatusSchema })),
	orderController.updateOrderStatus,
);
orderRouter.patch(
	"/:id/payment-status",
	orderAccessMiddleware(["OWNER", "ADMIN", "STAFF"]),
	validateRequest(z.object({ params: z.object({ id: commonValidations.id }), body: UpdateOrderPaymentStatusSchema })),
	orderController.updateOrderPaymentStatus,
);
