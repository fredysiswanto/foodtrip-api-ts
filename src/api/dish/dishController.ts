import type { Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { validateData } from "@/common/utils/commonValidation";
import { type CreateDishInput, CreateDishSchema, type UpdateDishInput } from "./dishModel";
import { dishService } from "./dishServices";

class DishController {
	public getDishes: RequestHandler = async (_req: Request, res: Response) => {
		const query = _req.query;
		const serviceResponse = await dishService.findAll(query);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public getDishById: RequestHandler = async (_req: Request, res: Response) => {
		const { id } = _req.params;
		const serviceResponse = await dishService.findById(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public createDish: RequestHandler = async (req: Request, res: Response) => {
		const data = req.body as CreateDishInput;
		const isValid = validateData(CreateDishSchema, data);

		if (isValid) {
			const serviceResponse = await dishService.create(isValid);
			res.status(serviceResponse.statusCode).send(serviceResponse);
		} else {
			res.status(400).send({
				success: false,
				message: "Oh No!. Invalid input data!.",
				data: null,
			});
		}
	};

	public updateDish: RequestHandler = async (req: Request, res: Response) => {
		const { id } = req.params;
		const data = req.body as UpdateDishInput;
		const isValid = validateData(CreateDishSchema.partial(), data);
		if (isValid) {
			const serviceResponse = await dishService.update(id, data);
			res.status(serviceResponse.statusCode).send(serviceResponse);
		} else {
			res.status(400).send({
				success: false,
				message: "Oh No!. Invalid input data!.",
				data: null,
			});
		}
	};

	public deleteDish: RequestHandler = async (req: Request, res: Response) => {
		const { id } = req.params;
		const serviceResponse = await dishService.delete(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	getDishesByRestaurant: RequestHandler = async (req: Request, res: Response) => {
		const restaurantId = (req as Request & { user?: { restaurantId?: string[] } }).user?.restaurantId;

		if (!restaurantId || restaurantId.length === 0) {
			const serviceResponse = ServiceResponse.failure("Restaurant context is required.", null, StatusCodes.BAD_REQUEST);
			return res.status(serviceResponse.statusCode).send(serviceResponse);
		}

		const serviceResponse = await dishService.findAllByRestaurants(restaurantId, req.query);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const dishController = new DishController();
