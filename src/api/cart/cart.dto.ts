import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

import { z } from "zod";
import { DishSchema } from "@/api/dish/dishModel";
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

export const CartItemWithDishSchema = z.object({
	id: z.string().uuid(),
	cartId: z.string().uuid(),
	dishId: z.string().uuid(),
	quantity: z.number().int().positive(),
	price: z.number().nonnegative(),
	notes: z.string().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
	dish: DishSchema,
});

export const CartWithItemsSchema = CartSchema.extend({
	cartItems: z.array(CartItemWithDishSchema),
});

export const CartItemPayloadSchema = z.object({
	dishId: z.string().uuid(),
	quantity: z.number().int().positive(),
	price: z.number().nonnegative().optional(),
	notes: z.string().optional(),
});

export const CreateCartSchema = z.object({
	userId: z.string().uuid(),
	restaurantId: z.string().uuid(),
	items: z.array(CartItemPayloadSchema).min(1),
});

export const CreateCartItemSchema = z.object({
	cartId: z.string().uuid(),
	dishId: z.string().uuid(),
	quantity: z.number().int().positive(),
	price: z.number().nonnegative(),
	notes: z.string().optional(),
});

export const UpdateCartItemSchema = z
	.object({
		quantity: z.number().int().positive().optional(),
		notes: z.string().optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field is required to update.",
	});

export type CreateCartInput = z.infer<typeof CreateCartSchema>;
export type CreateCartItemInput = z.infer<typeof CreateCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>;

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
