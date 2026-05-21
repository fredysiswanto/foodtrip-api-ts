import { StatusCodes } from "http-status-codes/build/cjs/status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import type { Category } from "@/generated/prisma/browser";
import { categoryRepository } from "./categoryRepository";

class CategoryService {
	private isSlugUnique = async (slug: string): Promise<boolean> => {
		const existingCategory = await categoryRepository.findBySlug(slug);
		return !existingCategory;
	};
	async findAll(): Promise<ServiceResponse<Category[] | null>> {
		try {
			const data = await categoryRepository.findAll();
			return ServiceResponse.success("Categories found.", data);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to retrieve categories. ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.NOT_FOUND,
			);
		}
	}

	async findById(id: string): Promise<ServiceResponse<Category | null>> {
		try {
			const data = await categoryRepository.findById(id);
			if (!data) {
				return ServiceResponse.failure("Category not found.", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success("Category found.", data);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to retrieve category. ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async create(data: Pick<Category, "name" | "description" | "slug">): Promise<ServiceResponse<Category | null>> {
		const isSlugUnique = await this.isSlugUnique(data.slug);
		if (!isSlugUnique) {
			return ServiceResponse.failure("Category with this slug already exists.", null, StatusCodes.CONFLICT);
		}

		try {
			const createdCategory = await categoryRepository.create(data);
			return ServiceResponse.success("Category created successfully.", createdCategory, StatusCodes.CREATED);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to create category. ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async update(
		id: string,
		data: Partial<Pick<Category, "name" | "description" | "slug">>,
	): Promise<ServiceResponse<Category | null>> {
		try {
			const existingCategoryResponse = await this.findById(id);
			if (!existingCategoryResponse.success || !existingCategoryResponse.data) {
				return ServiceResponse.failure("Category not found.", null, StatusCodes.NOT_FOUND);
			}

			const existingCategory = existingCategoryResponse.data;

			if (data.slug && data.slug !== existingCategory.slug) {
				const isSlugUnique = await this.isSlugUnique(data.slug);
				if (!isSlugUnique) {
					return ServiceResponse.failure("Category with this slug already exists.", null, StatusCodes.CONFLICT);
				}
			}

			const updatedData = { ...existingCategory, ...data };
			const updatedCategory = await categoryRepository.update(id, updatedData);
			return ServiceResponse.success("Category updated successfully.", updatedCategory);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to update category. ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async delete(id: string): Promise<ServiceResponse<null>> {
		try {
			const existingCategoryResponse = await this.findById(id);
			if (!existingCategoryResponse.success || !existingCategoryResponse.data) {
				return ServiceResponse.failure("Category not found.", null, StatusCodes.NOT_FOUND);
			}

			await categoryRepository.delete(id);
			return ServiceResponse.success("Category deleted successfully.", null);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to delete category. ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
}

export const categoryService = new CategoryService();
