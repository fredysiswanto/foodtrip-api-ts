import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { GetUserSchema, UserSchema } from "@/api/user/userModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { adminAuthMiddleware } from "@/common/middleware/adminAuthMiddleware";
import { validateRequest } from "@/common/utils/httpHandlers";
import { userController } from "./userController";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

userRouter.use(adminAuthMiddleware);

// Swagger docs Generated
userRegistry.register("User", UserSchema);

userRegistry.registerPath({
	method: "get",
	path: "/api/admin/users",
	tags: ["User"],
	responses: createApiResponse(z.array(UserSchema), "Success"),
});

userRegistry.registerPath({
	method: "get",
	path: "/api/admin/users/{id}",
	tags: ["User"],
	request: { params: GetUserSchema.shape.params },
	responses: createApiResponse(UserSchema, "Success"),
});

userRouter.get("/", userController.getUsers);
userRouter.get("/:id", validateRequest(GetUserSchema), userController.getUser);
