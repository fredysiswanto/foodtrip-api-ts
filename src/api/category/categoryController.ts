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
		try {
			const isValid = validateData(CreateCategorySchema, data);
			const serviceResponse = await categoryService.create(isValid);
			res.status(serviceResponse.statusCode).send(serviceResponse);
		} catch (error) {
			if (error instanceof Error) {
				return res.status(400).json({
					success: false,
					message: JSON.parse(error.message)[0].message || "Oh No!. Invalid input data!.",
					data: null,
					statusCode: 400,
				});
			}

			return res.status(500).json({
				success: false,
				message: "Internal server error",
				data: null,
				statusCode: 500,
			});
		}
	};

	updateCategory: RequestHandler = async (req: Request, res: Response<ServiceResponseType<Category | null>>) => {
		const { id } = req.params;

		try {
			const data = req.body as Partial<CreateCategoryInput>;
			const isValid = validateData(CreateCategorySchema.partial(), data);
			const serviceResponse = await categoryService.update(
				id,
				isValid as Pick<Category, "name" | "description" | "slug">,
			);
			res.status(serviceResponse.statusCode).send(serviceResponse);
		} catch (error) {
			if (error instanceof Error) {
				return res.status(400).json({
					success: false,
					message: JSON.parse(error.message)[0].message || "Oh No!. Invalid input data!.",
					data: null,
					statusCode: 400,
				});
			}

			return res.status(500).json({
				success: false,
				message: "Internal server error",
				data: null,
				statusCode: 500,
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
