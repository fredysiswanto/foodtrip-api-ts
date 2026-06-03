import type { Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "@/api/auth/authService";
import { UserRepository } from "@/api/user/userRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";

const ALLOWED_ADMIN_ROLES = ["SUPER_ADMIN"];

export const adminAuthMiddleware: RequestHandler = async (req: Request, res: Response, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader?.startsWith("Bearer ")) {
		const serviceResponse = ServiceResponse.failure(
			"Authorization header missing or malformed.",
			null,
			StatusCodes.UNAUTHORIZED,
		);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	}

	const token = authHeader.split(" ")[1];

	try {
		const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
		const userRepository = new UserRepository();
		const user = await userRepository.findByIdAsync(payload.userId);

		if (!user || !ALLOWED_ADMIN_ROLES.includes(user.roleName)) {
			const serviceResponse = ServiceResponse.failure("Administrator access required.", null, StatusCodes.FORBIDDEN);
			return res.status(serviceResponse.statusCode).send(serviceResponse);
		}

		(req as Request & { user?: JwtPayload }).user = payload;
		next();
	} catch {
		const serviceResponse = ServiceResponse.failure("Invalid or expired token.", null, StatusCodes.UNAUTHORIZED);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	}
};
