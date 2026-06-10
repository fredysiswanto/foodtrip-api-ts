import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type User = z.infer<typeof UserSchema>;
export const UserSchema = z.object({
	id: z.string().uuid(),
	roleId: z.string().uuid(),
	roleName: z.string(),
	fullName: z.string(),
	email: z.string().email(),
	phone: z.string().nullable(),
	isActive: z.boolean(),
	lastLoginAt: z.date().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	deletedAt: z.date().nullable(),
	restaurants: z
		.array(
			z.object({
				restaurantId: z.string().uuid(),
				restaurantRole: z.string(),
			}),
		)
		.optional(),
});

// Input Validation for 'GET users/:id' endpoint
export const GetUserSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});

export type UserRegister = z.infer<typeof UserRegisterSchema>;
export const UserRegisterSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
	fullName: z.string().min(1),
	phone: z.string().optional(),
});
