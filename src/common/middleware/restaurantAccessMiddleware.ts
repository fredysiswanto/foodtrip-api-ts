import type { Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "@/api/auth/authService";
import { UserRepository } from "@/api/user/userRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import type { Prisma, RestaurantRole } from "@/generated/prisma/client";

const getRestaurantIdFromRequest = (req: Request): string | null => {
	return (
		(req.params?.restaurantId as string | undefined) ??
		(req.params?.id as string | undefined) ??
		(req.body?.restaurantId as string | undefined) ??
		null
	);
};

export const restaurantAccessMiddleware = (
	allowedRoles: Array<RestaurantRole> = ["OWNER", "ADMIN", "STAFF"],
): RequestHandler => {
	return async (req, res, next) => {
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
			const restaurantId = getRestaurantIdFromRequest(req);
			if (!restaurantId) {
				const serviceResponse = ServiceResponse.failure(
					"Restaurant ID is required for access control.",
					null,
					StatusCodes.BAD_REQUEST,
				);
				return res.status(serviceResponse.statusCode).send(serviceResponse);
			}

			const userRepository = new UserRepository();
			const isAdmin = await userRepository.userIsAdmin(payload.userId);
			const canAccess =
				isAdmin || (await userRepository.userHasRestaurantRole(payload.userId, restaurantId, allowedRoles));
			if (!canAccess) {
				const serviceResponse = ServiceResponse.failure("Restaurant access denied.", null, StatusCodes.FORBIDDEN);
				return res.status(serviceResponse.statusCode).send(serviceResponse);
			}

			(req as Request & { user?: JwtPayload }).user = payload;
			next();
		} catch {
			const serviceResponse = ServiceResponse.failure("Invalid or expired token.", null, StatusCodes.UNAUTHORIZED);
			return res.status(serviceResponse.statusCode).send(serviceResponse);
		}
	};
};
