import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { UserSchema } from "@/api/user/userModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { authMiddleware } from "@/common/middleware/authMiddleware";
import { authController } from "./authController";
import { AuthTokenSchema, LoginRequestSchema } from "./authModel";

export const authRegistry = new OpenAPIRegistry();
export const authRouter: Router = express.Router();

authRegistry.registerPath({
	method: "post",
	path: "/auth/login",
	tags: ["Auth"],
	request: {
		body: {
			description: "Login payload",
			content: {
				"application/json": {
					schema: LoginRequestSchema.shape.body,
				},
			},
		},
	},
	responses: createApiResponse(AuthTokenSchema, "Login successful"),
});

authRegistry.registerPath({
	method: "get",
	path: "/auth/me",
	tags: ["Auth"],
	responses: createApiResponse(UserSchema, "Authenticated user"),
});

authRouter.post("/login", authController.login);
authRouter.get("/me", authMiddleware, authController.me);
