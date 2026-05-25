import type { Request, RequestHandler, Response } from "express";
import { validateData } from "@/common/utils/commonValidation";
import { type CreateRestaurantInput, CreateRestaurantSchema } from "./restaurantModel";
import { restaurantService } from "./restaurantService";

class RestaurantController {
	public getRestaurants: RequestHandler = async (_req: Request, res: Response) => {
		const query = _req.query;
		const serviceResponse = await restaurantService.findAll(query);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public getRestaurantById: RequestHandler = async (req: Request, res: Response) => {
		const { id } = req.params;
		const serviceResponse = await restaurantService.findById(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public createRestaurant: RequestHandler = async (req: Request, res: Response) => {
		const data = req.body as CreateRestaurantInput;
		const isValid = validateData(CreateRestaurantSchema, data);

		if (isValid) {
			const serviceResponse = await restaurantService.create(isValid);
			res.status(serviceResponse.statusCode).send(serviceResponse);
		} else {
			res.status(400).send({
				success: false,
				message: "Oh No!. Invalid input data!.",
				data: null,
			});
		}
	};

	public updateRestaurant: RequestHandler = async (req: Request, res: Response) => {
		const { id } = req.params;
		const updateData = req.body as Record<string, unknown>;

		const serviceResponse = await restaurantService.update(id, updateData);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const restaurantController = new RestaurantController();
