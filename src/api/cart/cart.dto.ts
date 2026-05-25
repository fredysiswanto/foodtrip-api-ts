import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";

extendZodWithOpenApi(z);

export type Cart = Prisma.CartModel;
export const CartSchema = z.object({
	id: z.string().uuid(),
	userId: z.string().uuid(),
	restaurantId: z.string().uuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const CreateCartSchema = z.object({
	userId: z.string().uuid(),
	restaurantId: z.string().uuid(),
	items: z.array(
		z.object({
			dishId: z.string().uuid(),
			quantity: z.number().int().positive(),
			price: z.number().nonnegative(),
			note: z.string().optional(),
		}),
	),
});

export type CreateCartInput = z.infer<typeof CreateCartSchema>;
export type UpdateCartInput = z.infer<typeof UpdateCartSchema>;
export const UpdateCartSchema = CreateCartSchema.partial();

export type CartItem = Prisma.CartItemModel;
export const CartItemSchema = z.object({
	id: z.string().uuid(),
	cartId: z.string().uuid(),
	dishId: z.string().uuid(),
	quantity: z.number().int().positive(),
	price: z.number().nonnegative(),
	notes: z.string().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});
