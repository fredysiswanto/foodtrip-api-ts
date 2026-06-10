import type { Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "@/api/auth/authService";
import { DishRepository } from "@/api/dish/dishRepository";
import { OrderRepository } from "@/api/order/orderRepository";
import { UserRepository } from "@/api/user/userRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import type { RestaurantRole } from "@/generated/prisma/client";

const extractTokenPayload = (token: string): JwtPayload => jwt.verify(token, env.JWT_SECRET) as JwtPayload;

const requireAuthorization = (req: Request, res: Response): JwtPayload | null => {
	const authHeader = req.headers.authorization;
	if (!authHeader?.startsWith("Bearer ")) {
		const serviceResponse = ServiceResponse.failure(
			"Authorization header missing or malformed.",
			null,
			StatusCodes.UNAUTHORIZED,
		);
		res.status(serviceResponse.statusCode).send(serviceResponse);
		return null;
	}

	try {
		return extractTokenPayload(authHeader.split(" ")[1]);
	} catch {
		const serviceResponse = ServiceResponse.failure("Invalid or expired token.", null, StatusCodes.UNAUTHORIZED);
		res.status(serviceResponse.statusCode).send(serviceResponse);
		return null;
	}
};

const createResourceAccessMiddleware = (
	getRestaurantId: (req: Request) => Promise<string | null>,
	allowedRoles: Array<RestaurantRole> = ["OWNER", "ADMIN", "STAFF"],
): RequestHandler => {
	return async (req, res, next) => {
		const payload = requireAuthorization(req, res);
		if (!payload) {
			return;
		}

		const restaurantId = await getRestaurantId(req);
		if (!restaurantId) {
			const serviceResponse = ServiceResponse.failure("Data Resource not found.", null, StatusCodes.NOT_FOUND);
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

		// (req as Request & { user?: JwtPayload }).user = payload;
		next();
	};
};

const getRestaurantIdFromRequest = (req: Request): string | null => {
	return (req.params?.restaurantId as string | undefined) ?? (req.body?.restaurantId as string | undefined) ?? null;
};

export const restaurantAccessMiddleware = (
	allowedRoles: Array<RestaurantRole> = ["OWNER", "ADMIN", "STAFF"],
): RequestHandler =>
	createResourceAccessMiddleware(async (req) => Promise.resolve(getRestaurantIdFromRequest(req)), allowedRoles);

export const dishAccessMiddleware = (
	allowedRoles: Array<RestaurantRole> = ["OWNER", "ADMIN", "STAFF"],
): RequestHandler =>
	createResourceAccessMiddleware(async (req) => {
		const dishId = req.params.id;
		if (!dishId) {
			return null;
		}

		const dish = await new DishRepository().findById(dishId);
		return dish?.restaurantId ?? null;
	}, allowedRoles);

export const orderAccessMiddleware = (
	allowedRoles: Array<RestaurantRole> = ["OWNER", "ADMIN", "STAFF"],
): RequestHandler =>
	createResourceAccessMiddleware(async (req) => {
		const orderId = req.params.id;
		if (!orderId) {
			return null;
		}

		const order = await new OrderRepository().findById(orderId);
		return order?.restaurantId ?? null;
	}, allowedRoles);
