import type { Request, RequestHandler, Response } from "express";
import type { CreateDishInput, UpdateDishInput } from "./dishModel";
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
		const serviceResponse = await dishService.create(data);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public updateDish: RequestHandler = async (req: Request, res: Response) => {
		const { id } = req.params;
		const data = req.body as UpdateDishInput;
		const serviceResponse = await dishService.update(id, data);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public deleteDish: RequestHandler = async (req: Request, res: Response) => {
		const { id } = req.params;
		const serviceResponse = await dishService.delete(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const dishController = new DishController();
