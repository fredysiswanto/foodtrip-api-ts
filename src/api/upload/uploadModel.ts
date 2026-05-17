import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { type Prisma, UploadType } from "@/generated/prisma/client";

extendZodWithOpenApi(z);

export type Upload = Prisma.UploadModel;
export const UploadSchema = z.object({
	id: z.string().uuid(),
	originalName: z.string(),
	filename: z.string(),
	mimeType: z.string(),
	type: z.nativeEnum(UploadType),
	folder: z.string(),
	path: z.string(),
	size: z.number().nonnegative(),
	uploadedById: z.string().uuid().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export type CreateUploadInput = z.infer<typeof CreateUploadSchema>;
export type UpdateUploadInput = z.infer<typeof UpdateUploadSchema>;
export const CreateUploadSchema = z.object({
	originalName: z.string(),
	filename: z.string(),
	mimeType: z.string(),
	type: z.nativeEnum(UploadType),
	folder: z.string(),
	path: z.string(),
	size: z.number().nonnegative(),
	uploadedById: z.string().uuid().nullable(),
});

export const UpdateUploadSchema = CreateUploadSchema.partial();

export const UploadRequestBodySchema = z.object({
	type: z.nativeEnum(UploadType),
	file: z.any(),
});
