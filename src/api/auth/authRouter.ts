import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { StatusCodes } from "http-status-codes";
import { UserSchema } from "@/api/user/userModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { authMiddleware } from "@/common/middleware/authMiddleware";
import { validateRequest } from "@/common/utils/httpHandlers";
import { authController } from "./authController";
import { AuthTokenSchema, LoginRequestSchema, RegisterRequestSchema } from "./authModel";

export const authRegistry = new OpenAPIRegistry();
export const authRouter: Router = express.Router();

authRegistry.registerPath({
	method: "post",
	path: "/api/auth/login",
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
	method: "post",
	path: "/api/auth/register",
	tags: ["Auth"],
	description: "Register a new user account",
	request: {
		body: {
			description: "User registration payload with email, password, full name, and phone",
			content: {
				"application/json": {
					schema: RegisterRequestSchema.shape.body,
				},
			},
		},
	},
	responses: {
		[StatusCodes.CREATED]: {
			description: "User registered successfully",
			content: {
				"application/json": {
					schema: createApiResponse(UserSchema, "User registered successfully", StatusCodes.CREATED)[
						StatusCodes.CREATED
					].content["application/json"].schema,
				},
			},
		},
		[StatusCodes.BAD_REQUEST]: {
			description: "Invalid input - missing or invalid email, password (min 8 chars), full name, or phone number",
			content: {
				"application/json": {
					schema: createApiResponse(UserSchema, "Invalid input", StatusCodes.BAD_REQUEST)[StatusCodes.BAD_REQUEST]
						.content["application/json"].schema,
				},
			},
		},
		[StatusCodes.CONFLICT]: {
			description: "Conflict - email or phone number already registered",
			content: {
				"application/json": {
					schema: createApiResponse(UserSchema, "Email or phone already exists", StatusCodes.CONFLICT)[
						StatusCodes.CONFLICT
					].content["application/json"].schema,
				},
			},
		},
		[StatusCodes.INTERNAL_SERVER_ERROR]: {
			description: "Server error - failed to create user account",
			content: {
				"application/json": {
					schema: createApiResponse(UserSchema, "Server error", StatusCodes.INTERNAL_SERVER_ERROR)[
						StatusCodes.INTERNAL_SERVER_ERROR
					].content["application/json"].schema,
				},
			},
		},
	},
});

authRegistry.registerPath({
	method: "get",
	path: "/api/auth/me",
	tags: ["Auth"],
	responses: createApiResponse(UserSchema, "Authenticated user"),
});

authRouter.post("/login", validateRequest(LoginRequestSchema), authController.login);
authRouter.post("/register", validateRequest(RegisterRequestSchema), authController.register);
authRouter.get("/me", authMiddleware, authController.me);
