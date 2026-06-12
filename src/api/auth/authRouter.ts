import express, { type Router } from "express";
import { authMiddleware } from "@/common/middleware/authMiddleware";
import { validateRequest } from "@/common/utils/httpHandlers";
import { authController } from "./authController";
import { LoginRequestSchema, RegisterRequestSchema } from "./authModel";

export const authRouter: Router = express.Router();

authRouter.post("/login", validateRequest(LoginRequestSchema), authController.login);
authRouter.post("/register", validateRequest(RegisterRequestSchema), authController.register);
authRouter.get("/me", authMiddleware, authController.me);
