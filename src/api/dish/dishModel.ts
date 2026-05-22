import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";

extendZodWithOpenApi(z);

export type Dish = Prisma.DishModel;
export const DishSchema = z.object({
	id: z.string().uuid(),
	restaurantId: z.string().uuid(),
	categoryId: z.string().uuid(),
	slug: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	price: z.number().nonnegative(),
	imageId: z.string().uuid().nullable(),
	stock: z.number().int().nonnegative(),
	isAvailable: z.boolean(),
	isFeatured: z.boolean(),
	version: z.number().int().nonnegative(),
	createdAt: z.date(),
	updatedAt: z.date(),
	deletedAt: z.date().nullable(),
});

export type CreateDishInput = z.infer<typeof CreateDishSchema>;
export type UpdateDishInput = z.infer<typeof UpdateDishSchema>;
export const CreateDishSchema = z.object({
	restaurantId: z.string().uuid(),
	categoryId: z.string().uuid(),
	slug: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	price: z.number().nonnegative(),
	// price: z.string(),
	imageId: z.string().uuid().nullable(),
	stock: z.number().int().nonnegative().default(0),
	isAvailable: z.boolean().default(true),
	isFeatured: z.boolean().default(false),
});

export const UpdateDishSchema = CreateDishSchema.partial();
