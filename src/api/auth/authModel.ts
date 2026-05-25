import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";

extendZodWithOpenApi(z);

export type User = Prisma.UserModel;
export const LoginRequestSchema = z.object({
	body: z.object({
		email: z.string().email(),
		password: z.string().min(8),
	}),
});

export const AuthTokenSchema = z.object({
	accessToken: z.string().openapi({ description: "JWT access token" }),
	tokenType: z.literal("Bearer"),
	expiresIn: z.string().openapi({ description: "Token expiration interval" }),
});

export const RegisterRequestSchema = z.object({
	body: z.object({
		email: z.string().email(),
		password: z.string().min(8),
		fullName: z.string().min(2),
		phone: z.string().min(10).max(15),
	}),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>["body"];
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>["body"];
export type AuthTokenResponse = z.infer<typeof AuthTokenSchema>;
