import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";

extendZodWithOpenApi(z);

export type Category = Prisma.CategoryModel;
export const CategorySchema = z.object({
	id: z.string().uuid(),
	slug: z.string(),
	name: z.string(),
	description: z.string().nullable().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
	deletedAt: z.date().nullable(),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export const CreateCategorySchema = z.object({
	slug: z.string(),
	name: z.string(),
	description: z.string().nullable(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();
