import type { NextFunction, Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { JwtHelper, type JwtPayload } from "@/common/utils/jwtHelper";
import type { RestaurantRole, RoleName } from "@/generated/prisma/browser";

export const authMiddleware: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
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
		const payload = (await jwtHelper.decodeToken(token)) as JwtPayload;
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

/**
 * Mengizinkan akses berdasarkan role enum
 */
export const authorizeRoles = (...allowedRoles: RoleName[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		if (!user) {
			const serviceResponse = ServiceResponse.failure("Access denied: unauthenticated", null, StatusCodes.FORBIDDEN);
			return res.status(serviceResponse.statusCode).send(serviceResponse);
		}
		if (!allowedRoles.includes(user.role)) {
			const serviceResponse = ServiceResponse.failure("Access denied: insufficient roles", null, StatusCodes.FORBIDDEN);
			return res.status(serviceResponse.statusCode).send(serviceResponse);
		}
		next();
	};
};

/**
 * Mengizinkan akses berdasarkan permission string
 */
export const authorizePermissions = (...requiredPermissions: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		if (!user) {
			const serviceResponse = ServiceResponse.failure("Access denied: unauthenticated", null, StatusCodes.FORBIDDEN);
			return res.status(serviceResponse.statusCode).send(serviceResponse);
		}
		const hasAllPermissions = requiredPermissions.every((permission) => user.permissions.includes(permission));
		if (!hasAllPermissions) {
			const serviceResponse = ServiceResponse.failure(
				"Access denied: insufficient permissions",
				null,
				StatusCodes.FORBIDDEN,
			);
			return res.status(serviceResponse.statusCode).send(serviceResponse);
		}
		next();
	};
};
