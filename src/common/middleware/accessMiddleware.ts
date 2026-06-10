import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { type RestaurantRole, RoleName } from "@/generated/prisma/client";

export const requireRestaurantAccess = (...allowedRoles: RestaurantRole[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		if (!user) {
			const serviceResponse = ServiceResponse.failure(
				"Authorization header missing or malformed.",
				null,
				StatusCodes.UNAUTHORIZED,
			);
			res.status(serviceResponse.statusCode).send(serviceResponse);
			return null;
		}

		const restaurantId = req.params.restaurantId;
		if (!restaurantId) {
			const serviceResponse = ServiceResponse.failure("Data Resource not found.", null, StatusCodes.NOT_FOUND);
			res.status(serviceResponse.statusCode).send(serviceResponse);
			return null;
		}

		// Super Admin & Admin global bisa akses semua restoran
		if (user.role === RoleName.SUPER_ADMIN || user.role === RoleName.ADMIN) {
			return next();
		}

		// Cek apakah user memiliki akses ke restoran ini
		const restaurantAccess = user.restaurants?.find((r) => r.restaurantId === restaurantId);

		if (!restaurantAccess) {
			const serviceResponse = ServiceResponse.failure("Restaurant access denied.", null, StatusCodes.FORBIDDEN);
			res.status(serviceResponse.statusCode).send(serviceResponse);
			return null;
		}

		// Jika allowedRoles diberikan, periksa apakah peran restoran user termasuk
		if (allowedRoles.length > 0 && !allowedRoles.includes(restaurantAccess.restaurantRole)) {
			const serviceResponse = ServiceResponse.failure(
				`Access denied: insufficient restaurant roles (required: ${allowedRoles.join(", ")})`,
				null,
				StatusCodes.BAD_REQUEST,
			);
			res.status(serviceResponse.statusCode).send(serviceResponse);
			return null;
		}

		next();
	};
};
