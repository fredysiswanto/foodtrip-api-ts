// import { StatusCodes } from "http-status-codes/build/cjs/status-codes";
// import { ServiceResponse } from "@/common/models/serviceResponse";
// import type { Category } from "@/generated/prisma/browser";
// import { CategoryRepository } from "./categoryRepository";

// export class CategoryService {
// 	private categoryRepository = new CategoryRepository();
// 	private isSlugUnique = async (slug: string): Promise<boolean> => {
// 		const existingCategory = await this.categoryRepository.findBySlug(slug);
// 		return !existingCategory;
// 	};
// 	async findAll(): Promise<ServiceResponse<Category[] | null>> {
// 		try {
// 			const data = await this.categoryRepository.findAll();
// 			return ServiceResponse.success("Categories found.", data);
// 		} catch (error) {
// 			return ServiceResponse.failure(
// 				`Unable to retrieve categories. ${error instanceof Error ? error.message : "Unknown error"}`,
// 				null,
// 				StatusCodes.INTERNAL_SERVER_ERROR,
// 			);
// 		}
// 	}

// 	async findById(id: string): Promise<ServiceResponse<Category | null>> {
// 		try {
// 			const data = await this.categoryRepository.findById(id);
// 			if (!data) {
// 				return ServiceResponse.failure("Category not found.", null, StatusCodes.NOT_FOUND);
// 			}
// 			return ServiceResponse.success("Category found.", data);
// 		} catch (error) {
// 			return ServiceResponse.failure(
// 				`Unable to retrieve category. ${error instanceof Error ? error.message : "Unknown error"}`,
// 				null,
// 				StatusCodes.INTERNAL_SERVER_ERROR,
// 			);
// 		}
// 	}

// 	async create(data: Pick<Category, "name" | "description" | "slug">): Promise<ServiceResponse<Category | null>> {
// 		const isSlugUnique = await this.isSlugUnique(data.slug);
// 		if (!isSlugUnique) {
// 			return ServiceResponse.failure("Category with this slug already exists.", null, StatusCodes.CONFLICT);
// 		}

// 		try {
// 			const createdCategory = await this.categoryRepository.create(data);
// 			return ServiceResponse.success("Category created successfully.", createdCategory, StatusCodes.CREATED);
// 		} catch (error) {
// 			return ServiceResponse.failure(
// 				`Unable to create category. ${error instanceof Error ? error.message : "Unknown error"}`,
// 				null,
// 				StatusCodes.INTERNAL_SERVER_ERROR,
// 			);
// 		}
// 	}

// 	async update(
// 		id: string,
// 		data: Pick<Category, "name" | "description" | "slug">,
// 	): Promise<ServiceResponse<Category | null>> {
// 		try {
// 			const existingCategoryResponse = await this.findById(id);
// 			if (!existingCategoryResponse.success || !existingCategoryResponse.data) {
// 				return ServiceResponse.failure("Category not found.", null, StatusCodes.NOT_FOUND);
// 			}

// 			const existingCategory = existingCategoryResponse.data;

// 			if (data.slug && data.slug !== existingCategory.slug) {
// 				const isSlugUnique = await this.isSlugUnique(data.slug);
// 				if (!isSlugUnique) {
// 					return ServiceResponse.failure("Category with this slug already exists.", null, StatusCodes.CONFLICT);
// 				}
// 			}

// 			const updatedData = { ...existingCategory, ...data };
// 			const updatedCategory = await this.categoryRepository.update(id, updatedData);
// 			return ServiceResponse.success("Category updated successfully.", updatedCategory);
// 		} catch (error) {
// 			return ServiceResponse.failure(
// 				`Unable to update category. ${error instanceof Error ? error.message : "Unknown error"}`,
// 				null,
// 				StatusCodes.INTERNAL_SERVER_ERROR,
// 			);
// 		}
// 	}

// 	async delete(id: string): Promise<ServiceResponse<null>> {
// 		try {
// 			const existingCategoryResponse = await this.findById(id);
// 			if (!existingCategoryResponse.success || !existingCategoryResponse.data) {
// 				return ServiceResponse.failure("Category not found.", null, StatusCodes.NOT_FOUND);
// 			}

// 			await this.categoryRepository.delete(id);
// 			return ServiceResponse.success("Category deleted successfully.", null);
// 		} catch (error) {
// 			return ServiceResponse.failure(
// 				`Unable to delete category. ${error instanceof Error ? error.message : "Unknown error"}`,
// 				null,
// 				StatusCodes.INTERNAL_SERVER_ERROR,
// 			);
// 		}
// 	}
// }

import { StatusCodes } from "http-status-codes"; // Cleaned up import target
import { ServiceResponse } from "@/common/models/serviceResponse";
import type { Category } from "@/generated/prisma/browser";
import { CategoryRepository } from "./categoryRepository";

export class CategoryService {
	private readonly categoryRepository = new CategoryRepository();

	private async isSlugUnique(slug: string): Promise<boolean> {
		const existingCategory = await this.categoryRepository.findBySlug(slug);
		return !existingCategory;
	}

	async findAll(): Promise<ServiceResponse<Category[] | null>> {
		try {
			const data = await this.categoryRepository.findAll();
			return ServiceResponse.success("Categories found.", data);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to retrieve categories: ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async findById(id: string): Promise<ServiceResponse<Category | null>> {
		try {
			const data = await this.categoryRepository.findById(id);
			if (!data) {
				return ServiceResponse.failure("Category not found.", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success("Category found.", data);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to retrieve category: ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async create(data: Pick<Category, "name" | "description" | "slug">): Promise<ServiceResponse<Category | null>> {
		try {
			// Early business logic validation check
			const isSlugUnique = await this.isSlugUnique(data.slug);
			if (!isSlugUnique) {
				return ServiceResponse.failure("Category with this slug already exists.", null, StatusCodes.CONFLICT);
			}

			const createdCategory = await this.categoryRepository.create(data);
			return ServiceResponse.success("Category created successfully.", createdCategory, StatusCodes.CREATED);
		} catch (error) {
			// Handling database race conditions (Prisma unique constraint code: P2002)
			// if (error?.code === "P2002" || error?.message?.includes("unique constraint")) {
			// 	return ServiceResponse.failure("Category with this slug already exists.", null, StatusCodes.CONFLICT, );
			// }
			return ServiceResponse.failure(
				`Unable to create category: ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async update(
		id: string,
		data: Partial<Pick<Category, "name" | "description" | "slug">>, // Changed to Partial for flexibility
	): Promise<ServiceResponse<Category | null>> {
		try {
			// Query repository directly to cut down on ServiceResponse overhead parsing
			const existingCategory = await this.categoryRepository.findById(id);
			if (!existingCategory) {
				return ServiceResponse.failure("Category not found.", null, StatusCodes.NOT_FOUND);
			}

			if (data.slug && data.slug !== existingCategory.slug) {
				const isSlugUnique = await this.isSlugUnique(data.slug);
				if (!isSlugUnique) {
					return ServiceResponse.failure("Category with this slug already exists.", null, StatusCodes.CONFLICT);
				}
			}

			const updatedCategory = await this.categoryRepository.update(id, data);
			return ServiceResponse.success("Category updated successfully.", updatedCategory);
		} catch (error) {
			// if (error?.code === "P2002" || error?.message?.includes("unique constraint")) {
			// 	return ServiceResponse.failure("Category with this slug already exists.", null, StatusCodes.CONFLICT);
			// }
			return ServiceResponse.failure(
				`Unable to update category: ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async delete(id: string): Promise<ServiceResponse<null>> {
		try {
			const existingCategory = await this.categoryRepository.findById(id);
			if (!existingCategory) {
				return ServiceResponse.failure("Category not found.", null, StatusCodes.NOT_FOUND);
			}

			await this.categoryRepository.delete(id);
			return ServiceResponse.success("Category deleted successfully.", null);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to delete category: ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
