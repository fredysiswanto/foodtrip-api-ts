import type { Request, RequestHandler, Response } from "express";
import { userService } from "@/api/user/userService";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { authService } from "./authService";

export class AuthController {
	public login: RequestHandler = async (req: Request, res: Response) => {
		const { email, password } = req.body as { email: string; password: string };
		const serviceResponse = await authService.login(email, password);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public me: RequestHandler = async (req: Request, res: Response) => {
		const authPayload = (req as Request & { user?: { userId: string } }).user;
		if (!authPayload) {
			const serviceResponse = ServiceResponse.failure("Authentication payload missing.", null, 401);
			return res.status(serviceResponse.statusCode).send(serviceResponse);
		}

		const serviceResponse = await userService.findById(authPayload.userId);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const authController = new AuthController();
