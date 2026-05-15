import type { Request, RequestHandler, Response } from "express";
import { restaurantService } from "./restaurantService";

class RestaurantController {
	public getRestaurants: RequestHandler = async (_req: Request, res: Response) => {
		const serviceResponse = await restaurantService.findAll();
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public getRestaurantById: RequestHandler = async (req: Request, res: Response) => {
		const { restaurantId } = req.params;
		const serviceResponse = await restaurantService.findById(restaurantId);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public createRestaurant: RequestHandler = async (req: Request, res: Response) => {
		const { name, slug, address, city, province, postalCode, email, phone } = req.body as {
			name: string;
			slug: string;
			address: string;
			city: string;
			province: string;
			postalCode: string;
			email?: string;
			phone?: string;
		};

		const serviceResponse = await restaurantService.create({
			name,
			slug,
			address,
			city,
			province,
			postalCode,
			email: email ?? null,
			phone: phone ?? null,
		});

		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public updateRestaurant: RequestHandler = async (req: Request, res: Response) => {
		const { restaurantId } = req.params;
		const updateData = req.body as Record<string, unknown>;

		const serviceResponse = await restaurantService.update(restaurantId, updateData);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const restaurantController = new RestaurantController();
