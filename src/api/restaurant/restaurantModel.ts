import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

import { z } from "zod";
import { type Prisma, RestaurantStatus } from "@/generated/prisma/client";

extendZodWithOpenApi(z);

export type Restaurant = Prisma.RestaurantModel;
export const RestaurantSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	description: z.string().nullable(),
	address: z.string(),
	phone: z.string().nullable(),
	email: z.string().email().nullable(),
	imageId: z.string().uuid().nullable(),
	isAvailable: z.boolean(),
	version: z.number().int().nonnegative(),
	createdAt: z.date(),
	updatedAt: z.date(),
	deletedAt: z.date().nullable(),
});

export type CreateRestaurantInput = z.infer<typeof CreateRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof UpdateRestaurantSchema>;
export const CreateRestaurantSchema = z.object({
	name: z.string().min(3).max(150),
	slug: z
		.string()
		.min(3)
		.max(150)
		.regex(/^[a-z0-9-]+$/, {
			message: "Slug must contain lowercase letters, numbers, and hyphens only",
		}),
	description: z.string().max(2000).optional().nullable(),
	phone: z.string().max(30).optional(),
	email: z.string().email().max(150).optional(),
	address: z.string().min(5),
	city: z.string().max(100).optional(),
	province: z.string().max(100).optional(),
	postalCode: z.string().max(20).optional(),
	latitude: z.number().min(-90).max(90).optional().nullable(),
	longitude: z.number().min(-180).max(180).optional().nullable(),
	logoId: z.string().uuid().optional().nullable(),
	bannerId: z.string().uuid().optional().nullable(),
	status: z.nativeEnum(RestaurantStatus).optional(),
	isOpen: z.boolean().optional(),
	openTime: z.string().datetime().optional().nullable(),
	closeTime: z.string().datetime().optional().nullable(),
	rejectedReason: z.string().max(1000).optional(),
});

export const UpdateRestaurantSchema = CreateRestaurantSchema.partial();
