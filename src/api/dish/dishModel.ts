import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";

extendZodWithOpenApi(z);

export type Dish = Prisma.DishModel;
export const DishSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	description: z.string().nullable(),
	price: z.number().nonnegative(),
	imageUrl: z.string().url().nullable(),
	isAvailable: z.boolean(),
	createdAt: z.date(),
	updatedAt: z.date(),
	deletedAt: z.date().nullable(),
});

export type CreateDishInput = z.infer<typeof CreateDishSchema>;
export const CreateDishSchema = z.object({
	name: z.string(),
	description: z.string().nullable(),
	price: z.number().nonnegative(),
	imageUrl: z.string().url().nullable(),
	isAvailable: z.boolean().default(false),
});
