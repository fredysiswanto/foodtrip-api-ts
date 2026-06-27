import type { Request, RequestHandler, Response } from "express";
import type { ServiceResponseType } from "@/common/models/serviceResponse";
import { validateData } from "@/common/utils/commonValidation";
import type { Category } from "@/generated/prisma/browser";
import {
	CreateCategoryEnvSchema,
	CreateCategorySchema,
	type PlaywrightDemo,
	UpdateCategorySchema,
} from "./category.dto";
import { CategoryService } from "./categoryService";

export class CategoryController {
	private readonly categoryService = new CategoryService();

	public getCategories: RequestHandler = async (
		_req: Request,
		res: Response<ServiceResponseType<Category[] | null>>,
	) => {
		try {
			const serviceResponse = await this.categoryService.findAll();
			res.status(serviceResponse.statusCode).send(serviceResponse);
		} catch (error) {
			this.handleUnexpectedError(res, error);
		}
	};

	public getCategoryById: RequestHandler = async (
		req: Request,
		res: Response<ServiceResponseType<Category | null>>,
	) => {
		try {
			const { id } = req.params;
			const serviceResponse = await this.categoryService.findById(id);
			res.status(serviceResponse.statusCode).send(serviceResponse);
		} catch (error) {
			this.handleUnexpectedError(res, error);
		}
	};

	public createCategory: RequestHandler = async (
		req: Request,
		res: Response<ServiceResponseType<Pick<Category, "id" | "name"> | null>>,
	) => {
		try {
			const validatedData = validateData(CreateCategorySchema, req.body);

			const serviceResponse = await this.categoryService.create(validatedData);
			res.status(serviceResponse.statusCode).send(serviceResponse);
		} catch (error) {
			this.handleValidationErrorOrPanic(res, error);
		}
	};
	public createCategoryEnv: RequestHandler = async (
		req: Request,
		res: Response<ServiceResponseType<Pick<PlaywrightDemo, "id" | "name"> | null>>,
	) => {
		try {
			const validatedData = validateData(CreateCategoryEnvSchema, req.body);

			const serviceResponse = await this.categoryService.createEnv(validatedData);
			res.status(serviceResponse.statusCode).send(serviceResponse);
		} catch (error) {
			this.handleValidationErrorOrPanic(res, error);
		}
	};

	public updateCategory: RequestHandler = async (req: Request, res: Response<ServiceResponseType<Category | null>>) => {
		try {
			const { id } = req.params;
			const validatedData = validateData(UpdateCategorySchema, req.body) as Pick<
				Category,
				"name" | "description" | "slug"
			>;

			const serviceResponse = await this.categoryService.update(id, validatedData);
			res.status(serviceResponse.statusCode).send(serviceResponse);
		} catch (error) {
			this.handleValidationErrorOrPanic(res, error);
		}
	};

	public deleteCategory: RequestHandler = async (req: Request, res: Response<ServiceResponseType<null>>) => {
		try {
			const { id } = req.params;
			const serviceResponse = await this.categoryService.delete(id);
			res.status(serviceResponse.statusCode).send(serviceResponse);
		} catch (error) {
			this.handleUnexpectedError(res, error);
		}
	};

	private handleValidationErrorOrPanic(res: Response, error: unknown) {
		if (error instanceof Error) {
			try {
				const parsedErrors = JSON.parse(error.message);
				return res.status(400).json({
					success: false,
					message: parsedErrors[0]?.message || "Oh No!. Invalid input data!.",
					data: null,
					statusCode: 400,
					errors: parsedErrors,
				});
			} catch {
				return res.status(400).json({
					success: false,
					message: error.message,
					data: null,
					statusCode: 400,
				});
			}
		}
		this.handleUnexpectedError(res, error);
	}

	private handleUnexpectedError(res: Response, _error: unknown) {
		res.status(500).json({
			success: false,
			message: "Internal server error",
			data: null,
			statusCode: 500,
		});
	}
}

export const categoryController = new CategoryController();
