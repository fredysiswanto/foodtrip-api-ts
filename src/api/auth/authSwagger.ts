import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { StatusCodes } from "http-status-codes";
import { createApiResponse, createApiResponses } from "@/api-docs/openAPIResponseBuilders";
import { ServicesResponseErrorSchema } from "@/common/models/serviceResponse";
import { UserSchema } from "../user/userModel";
import { AuthTokenSchema, LoginRequestSchema, RegisterRequestSchema } from "./authModel";

export const authRegistry = new OpenAPIRegistry();

authRegistry.registerPath({
	method: "post",
	path: "/api/auth/login",
	tags: ["Auth"],
	summary: "Authenticate user login",
	request: {
		body: {
			description: "Login payload",
			content: {
				"application/json": {
					schema: LoginRequestSchema,
				},
			},
		},
	},
	responses: createApiResponses([
		{
			schema: AuthTokenSchema,
			statusCode: StatusCodes.OK,
			description: "Login successful",
		},
		{
			schema: ServicesResponseErrorSchema,
			statusCode: StatusCodes.UNAUTHORIZED,
			description: "Invalid credentials - email not found or password mismatch",
			error: true,
		},
	]),
});

authRegistry.registerPath({
	method: "post",
	path: "/api/auth/register",
	tags: ["Auth"],
	summary: "Register a new user account",
	description: "Register a new user account",
	request: {
		body: {
			description: "User registration payload with email, password, full name, and phone",
			content: {
				"application/json": {
					schema: RegisterRequestSchema,
				},
			},
		},
	},
	responses: createApiResponses([
		{
			schema: UserSchema.omit({ restaurants: true, roleId: true }),
			statusCode: StatusCodes.CREATED,
			description: "User registered successfully",
		},
		{
			schema: ServicesResponseErrorSchema,
			statusCode: StatusCodes.BAD_REQUEST,
			description: "Invalid input - missing or invalid email, password (min 8 chars), full name, or phone number",
			error: true,
		},
	]),
});

authRegistry.registerPath({
	method: "get",
	path: "/api/auth/me",
	tags: ["Auth"],
	summary: "Get user details",
	responses: createApiResponse(UserSchema.omit({ restaurants: true, roleId: true }), "Authenticated user"),
});
