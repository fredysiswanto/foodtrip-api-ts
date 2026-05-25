import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";

extendZodWithOpenApi(z);

export const OrderStatusSchema = z.enum(["PENDING", "CONFIRMED", "PREPARING", "DELIVERING", "COMPLETED", "CANCELLED"]);
export const PaymentStatusSchema = z.enum(["UNPAID", "PAID", "FAILED", "REFUNDED"]);
export const PaymentMethodSchema = z.enum(["CASH", "TRANSFER", "EWALLET", "QRIS"]);

export type Order = Prisma.OrderModel;

export const OrderItemSchema = z.object({
	id: z.string().uuid(),
	dishId: z.string().uuid(),
	dishName: z.string(),
	dishPrice: z.number().nonnegative(),
	quantity: z.number().int().positive(),
	subtotal: z.number().nonnegative(),
	notes: z.string().optional(),
	createdAt: z.date(),
});

export const OrderSchema = z.object({
	id: z.string().uuid(),
	orderNo: z.string(),
	userId: z.string().uuid(),
	restaurantId: z.string().uuid(),
	subtotal: z.number().nonnegative(),
	deliveryFee: z.number().nonnegative(),
	tax: z.number().nonnegative(),
	total: z.number().nonnegative(),
	status: OrderStatusSchema,
	paymentStatus: PaymentStatusSchema,
	paymentMethod: PaymentMethodSchema.optional(),
	customerName: z.string(),
	customerPhone: z.string(),
	deliveryAddress: z.string(),
	notes: z.string().optional(),
	orderedAt: z.date(),
	confirmedAt: z.date().nullable(),
	deliveredAt: z.date().nullable(),
	completedAt: z.date().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	deletedAt: z.date().nullable(),
	orderItems: z.array(OrderItemSchema),
});

export const CreateOrderSchema = z.object({
	restaurantId: z.string().uuid(),
	paymentMethod: PaymentMethodSchema.optional(),
	customerName: z.string().min(1),
	customerPhone: z.string().min(1),
	deliveryAddress: z.string().min(1),
	notes: z.string().optional(),
});

export const UpdateOrderStatusSchema = z.object({
	status: OrderStatusSchema,
});

export const UpdateOrderPaymentStatusSchema = z.object({
	paymentStatus: PaymentStatusSchema,
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
export type UpdateOrderPaymentStatusInput = z.infer<typeof UpdateOrderPaymentStatusSchema>;
