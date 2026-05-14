import type { Request, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "@/api/auth/authService";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";

export const authMiddleware: RequestHandler = (req, res, next) => {
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
		(req as Request & { user?: JwtPayload }).user = payload;
		next();
	} catch {
		const serviceResponse = ServiceResponse.failure("Invalid or expired token.", null, StatusCodes.UNAUTHORIZED);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	}
};
