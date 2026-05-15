import type { Request, RequestHandler, Response } from "express";
import { dishService } from "./dishServices";

class DishController {
	public getDishes: RequestHandler = async (_req: Request, res: Response) => {
		const query = _req.query;
		const serviceResponse = await dishService.findAll(query);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const dishController = new DishController();
