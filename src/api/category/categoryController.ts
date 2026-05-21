import type { Request, RequestHandler, Response } from "express";
import type { ServiceResponseType } from "@/common/models/serviceResponse";
import { validateData } from "@/common/utils/commonValidation";
import type { Category } from "@/generated/prisma/browser";
import { type CreateCategoryInput, CreateCategorySchema, UpdateCategorySchema } from "./category.dto";
import { CategoryService } from "./categoryService";

export class CategoryController {
	private readonly categoryService = new CategoryService();
	// Responds with a ServiceResponse containing an array of Category
	getCategories: RequestHandler = async (_req: Request, res: Response<ServiceResponseType<Category[] | null>>) => {
		const serviceResponse = await this.categoryService.findAll();
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	getCategoryById: RequestHandler = async (req: Request, res: Response<ServiceResponseType<Category | null>>) => {
		const { id } = req.params;
		const serviceResponse = await this.categoryService.findById(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	createCategory: RequestHandler = async (req: Request, res: Response<ServiceResponseType<Category | null>>) => {
		const data = req.body as CreateCategoryInput;
		try {
			validateData(CreateCategorySchema, data);
			const serviceResponse = await this.categoryService.create(
				data as Pick<Category, "name" | "description" | "slug">,
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

	updateCategory: RequestHandler = async (req: Request, res: Response<ServiceResponseType<Category | null>>) => {
		const { id } = req.params;
		const data = req.body as Partial<CreateCategoryInput>;

		try {
			validateData(UpdateCategorySchema, data);
			const serviceResponse = await this.categoryService.update(
				id,
				data as Pick<Category, "name" | "description" | "slug">,
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
		const serviceResponse = await this.categoryService.delete(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const categoryController = new CategoryController();
