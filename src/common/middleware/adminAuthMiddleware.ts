import type { NextFunction, Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { JwtHelper } from "@/common/utils/jwtHelper";
import type { RestaurantRole, RoleName } from "@/generated/prisma/browser";

const ALLOWED_ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"] as RoleName[];

export const adminAuthMiddleware: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
	const jwtHelper = new JwtHelper();
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
		const payload = await jwtHelper.decodeToken(token);
		// const userRepository = new UserRepository();
		// const user = await userRepository.findByIdAsync(payload.userId);

		if (!payload || !ALLOWED_ADMIN_ROLES.includes(payload.role as RoleName)) {
			const serviceResponse = ServiceResponse.failure("Administrator access required.", null, StatusCodes.FORBIDDEN);
			return res.status(serviceResponse.statusCode).send(serviceResponse);
		}

		// (req as Request & { user?: JwtPayload }).user = payload;
		req.user = {
			userId: payload.userId,
			email: payload.email,
			role: payload.role as RoleName,
			permissions: payload.permissions,
			restaurants: payload.restaurants?.map((restaurant) => ({
				restaurantId: restaurant.restaurantId,
				restaurantRole: restaurant.restaurantRole as RestaurantRole,
			})),
		};
		next();
	} catch {
		const serviceResponse = ServiceResponse.failure("Invalid or expired token.", null, StatusCodes.UNAUTHORIZED);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	}
};
