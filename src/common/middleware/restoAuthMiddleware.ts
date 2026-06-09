import type { NextFunction, Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "@/api/auth/authService";
import { UserRepository } from "@/api/user/userRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import type { RestaurantRole } from "@/generated/prisma/client";

const ALLOWED_RESTO_ROLES: RestaurantRole[] = ["OWNER", "ADMIN", "STAFF"];

export const restoAuthMiddleware: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
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
		const userHasRestaurants = await userRepository.userRestaurantIds(payload.userId, ALLOWED_RESTO_ROLES);

		// if (!user || !ALLOWED_RESTO_ROLES.includes(user.roleName as RestaurantRole)) {
		// 	const serviceResponse = ServiceResponse.failure("Restaurant access required.", null, StatusCodes.FORBIDDEN);
		// 	return res.status(serviceResponse.statusCode).send(serviceResponse);
		// }

		if (payload.restaurantId) {
			const hasRestaurantAccess = await userRepository.userHasRestaurantRole(
				payload.userId,
				payload.restaurantId[0],
				ALLOWED_RESTO_ROLES,
			);

			if (!hasRestaurantAccess) {
				const serviceResponse = ServiceResponse.failure("Restaurant access required.", null, StatusCodes.FORBIDDEN);
				return res.status(serviceResponse.statusCode).send(serviceResponse);
			}
		}

		if (userHasRestaurants.length === 0) {
			const serviceResponse = ServiceResponse.failure("Restaurant access required.", null, StatusCodes.FORBIDDEN);
			return res.status(serviceResponse.statusCode).send(serviceResponse);
		}
		payload.restaurantId = userHasRestaurants;

		(req as Request & { user?: JwtPayload }).user = payload;
		next();
	} catch {
		const serviceResponse = ServiceResponse.failure("Invalid or expired token.", null, StatusCodes.UNAUTHORIZED);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	}
};
