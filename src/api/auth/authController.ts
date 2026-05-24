import type { Request, RequestHandler, Response } from "express";
import { userService } from "@/api/user/userService";
import { ServiceResponse } from "@/common/models/serviceResponse";
import type { RegisterRequest } from "./authModel";
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

	public register: RequestHandler = async (req: Request, res: Response) => {
		const payload = req.body as RegisterRequest;
		req.log?.info({ email: payload.email, fullName: payload.fullName }, "User registration attempt");
		const serviceResponse = await authService.register(payload);
		if (serviceResponse.statusCode === 201) {
			req.log?.info({ userId: serviceResponse.data?.id }, "User registered successfully");
		} else {
			req.log?.warn(
				{ statusCode: serviceResponse.statusCode, message: serviceResponse.message },
				"Registration failed",
			);
		}
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const authController = new AuthController();
