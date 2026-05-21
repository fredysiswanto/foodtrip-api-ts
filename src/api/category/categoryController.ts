import type { Request, RequestHandler, Response } from "express";
import type { ServiceResponseType } from "@/common/models/serviceResponse";
import { validateData } from "@/common/utils/commonValidation";
import type { Category } from "@/generated/prisma/browser";
import { type CreateCategoryInput, CreateCategorySchema } from "./category.dto";
import { categoryService } from "./categoryService";

class CategoryController {
	// Responds with a ServiceResponse containing an array of Category
	getCategories: RequestHandler = async (_req: Request, res: Response<ServiceResponseType<Category[] | null>>) => {
		const serviceResponse = await categoryService.findAll();
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	getCategoryById: RequestHandler = async (req: Request, res: Response<ServiceResponseType<Category | null>>) => {
		const { id } = req.params;
		const serviceResponse = await categoryService.findById(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	createCategory: RequestHandler = async (req: Request, res: Response<ServiceResponseType<Category | null>>) => {
		const data = req.body as CreateCategoryInput;
		const isValid = validateData(CreateCategorySchema, data);

		if (isValid) {
			const serviceResponse = await categoryService.create(isValid);
			res.status(serviceResponse.statusCode).send(serviceResponse);
		} else {
			res.status(400).send({
				success: false,
				message: "Oh No!. Invalid input data!.",
				data: null,
				statusCode: 400,
			});
		}
	};

	updateCategory: RequestHandler = async (req: Request, res: Response<ServiceResponseType<Category | null>>) => {
		const { id } = req.params;
		const data = req.body as Partial<CreateCategoryInput>;
		const isValid = validateData(CreateCategorySchema.partial(), data);

		if (isValid) {
			const serviceResponse = await categoryService.update(id, isValid);
			res.status(serviceResponse.statusCode).send(serviceResponse);
		} else {
			res.status(400).send({
				success: false,
				message: "Oh No!. Invalid input data!.",
				data: null,
				statusCode: 400,
			});
		}
	};

	deleteCategory: RequestHandler = async (req: Request, res: Response<ServiceResponseType<null>>) => {
		const { id } = req.params;
		const serviceResponse = await categoryService.delete(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const categoryController = new CategoryController();
