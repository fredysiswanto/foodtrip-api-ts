import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { commonValidations } from "@/common/utils/commonValidation";
import { CreateOrderSchema, OrderSchema, UpdateOrderPaymentStatusSchema, UpdateOrderStatusSchema } from "./order.dto";

export const orderRegistry = new OpenAPIRegistry();
export const clientOrderRegistry = new OpenAPIRegistry();

// Client Apis
clientOrderRegistry.register("Order", OrderSchema);

clientOrderRegistry.registerPath({
	method: "get",
	path: "/api/my-orders",
	tags: ["Client Order"],
	summary: "Get all orders for the authenticated user",
	responses: createApiResponse(z.array(OrderSchema), "Orders retrieved successfully", StatusCodes.OK, true),
});

clientOrderRegistry.registerPath({
	method: "get",
	path: "/api/orders/{orderId}",
	tags: ["Client Order"],
	summary: "Get order by ID",
	request: { params: z.object({ orderId: commonValidations.id }) },
	responses: createApiResponse(OrderSchema, "Order retrieved successfully"),
});

clientOrderRegistry.registerPath({
	method: "post",
	path: "/api/orders",
	tags: ["Client Order"],
	summary: "Create a new order",
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

clientOrderRegistry.registerPath({
	method: "patch",
	path: "/api/orders/{orderId}/status",
	tags: ["Client Order"],
	summary: "Update order status",
	request: {
		params: z.object({ orderId: commonValidations.id }),
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

// Admin Apis
orderRegistry.register("Order", OrderSchema);

orderRegistry.registerPath({
	method: "get",
	path: "/api/admin/orders",
	tags: ["Order"],
	summary: "Get all orders for admin",
	responses: createApiResponse(z.array(OrderSchema), "Orders retrieved successfully"),
});

orderRegistry.registerPath({
	method: "get",
	path: "/api/admin/orders/{orderId}",
	tags: ["Order"],
	summary: "Get order by ID",
	request: { params: z.object({ orderId: commonValidations.id }) },
	responses: createApiResponse(OrderSchema, "Order retrieved successfully"),
});

orderRegistry.registerPath({
	method: "post",
	path: "/api/admin/orders",
	tags: ["Order"],
	summary: "Create a new order",
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
	path: "/api/admin/orders/{orderId}/status",
	tags: ["Order"],
	summary: "Update order status",
	request: {
		params: z.object({ orderId: commonValidations.id }),
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
	path: "/api/admin/orders/{orderId}/payment-status",
	tags: ["Order"],
	summary: "Update order payment status",
	request: {
		params: z.object({ orderId: commonValidations.id }),
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
