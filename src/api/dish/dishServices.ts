import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { Prisma } from "@/generated/prisma/client";
import type { CreateDishInput, UpdateDishInput } from "./dishModel";
import { DishRepository } from "./dishRepository";

type Dish = Prisma.DishModel;
export interface GetDishesQuery {
	page?: string;
	limit?: string;
	search?: string;
	sortBy?: "name" | "price" | "createdAt";
	sortOrder?: "asc" | "desc";
}

export class DishService {
	private repository = new DishRepository();

	private async validateRelations(data: Partial<CreateDishInput>): Promise<string | null> {
		if (data.restaurantId && !(await this.repository.restaurantExists(data.restaurantId))) {
			return "The provided restaurantId does not exist.";
		}

		if (data.categoryId && !(await this.repository.categoryExists(data.categoryId))) {
			return "The provided categoryId does not exist.";
		}

		return null;
	}

	private async isSlugUnique(restaurantId: string, slug: string, excludeDishId?: string): Promise<boolean> {
		const existingDish = await this.repository.findByRestaurantAndSlug(restaurantId, slug);
		return !existingDish || existingDish.id === excludeDishId;
	}

	async findAll(
		query: GetDishesQuery,
	): Promise<
		ServiceResponse<Pick<Dish, "id" | "name" | "description" | "price" | "isAvailable" | "createdAt">[] | null>
	> {
		try {
			const { data, meta } = await this.repository.findAll(query);

			return ServiceResponse.paginatedSuccess("Dishes found.", data, meta);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to retrieve dishes. ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.NOT_FOUND,
			);
		}
	}

	async findById(id: string): Promise<ServiceResponse<Dish | null>> {
		try {
			const dish = await this.repository.findById(id);

			if (!dish) {
				return ServiceResponse.failure("Dish not found.", null, StatusCodes.NOT_FOUND);
			}

			return ServiceResponse.success("Dish found.", dish);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to retrieve dish. ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async create(data: CreateDishInput): Promise<ServiceResponse<Pick<Dish, "id" | "name"> | null>> {
		const relationError = await this.validateRelations(data);
		if (relationError) {
			return ServiceResponse.failure(relationError, null, StatusCodes.BAD_REQUEST);
		}

		if (!(await this.isSlugUnique(data.restaurantId, data.slug))) {
			return ServiceResponse.failure(
				"A dish with this slug already exists for the selected restaurant.",
				null,
				StatusCodes.CONFLICT,
			);
		}

		try {
			const dish = await this.repository.create(data);
			return ServiceResponse.success("Dish created successfully.", dish, StatusCodes.CREATED);
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					return ServiceResponse.failure("Dish slug already exists for this restaurant.", null, StatusCodes.CONFLICT);
				}
				if (error.code === "P2003") {
					return ServiceResponse.failure(
						"Invalid foreign key reference provided in dish data.",
						null,
						StatusCodes.BAD_REQUEST,
					);
				}
			}

			return ServiceResponse.failure(
				`Unable to create dish. ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async update(id: string, data: UpdateDishInput): Promise<ServiceResponse<Dish | null>> {
		try {
			const existingDish = await this.repository.findById(id);
			if (!existingDish) {
				return ServiceResponse.failure("Dish not found.", null, StatusCodes.NOT_FOUND);
			}

			const relationError = await this.validateRelations(data);
			if (relationError) {
				return ServiceResponse.failure(relationError, null, StatusCodes.BAD_REQUEST);
			}

			const restaurantId = data.restaurantId ?? existingDish.restaurantId;
			const slug = data.slug ?? existingDish.slug;
			if (!(await this.isSlugUnique(restaurantId, slug, id))) {
				return ServiceResponse.failure(
					"A dish with this slug already exists for the selected restaurant.",
					null,
					StatusCodes.CONFLICT,
				);
			}

			const updatedDish = await this.repository.update(id, data);
			return ServiceResponse.success("Dish updated successfully.", updatedDish);
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					return ServiceResponse.failure("Dish slug already exists for this restaurant.", null, StatusCodes.CONFLICT);
				}
				if (error.code === "P2003") {
					return ServiceResponse.failure(
						"Invalid foreign key reference provided in updated dish data.",
						null,
						StatusCodes.BAD_REQUEST,
					);
				}
			}

			return ServiceResponse.failure(
				`Unable to update dish. ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async delete(id: string): Promise<ServiceResponse<Pick<Dish, "id" | "name" | "deletedAt"> | null>> {
		try {
			const existingDish = await this.repository.findById(id);
			if (!existingDish) {
				return ServiceResponse.failure("Dish not found.", null, StatusCodes.NOT_FOUND);
			}

			const deletedDish = await this.repository.delete(id);
			return ServiceResponse.success("Dish deleted successfully.", {
				id: deletedDish.id,
				name: deletedDish.name,
				deletedAt: deletedDish.deletedAt,
			});
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to delete dish. ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
}

export const dishService = new DishService();
