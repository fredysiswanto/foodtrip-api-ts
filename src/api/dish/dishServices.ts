import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import type { Prisma } from "@/generated/prisma/client";
import { DishRepository } from "./dishRepository";

type Dish = Prisma.DishModel;
export interface GetDishesQuery {
	page?: string;
	limit?: string;
	search?: string;
	sortBy?: "name" | "prices" | "createdAt";
	sortOrder?: "asc" | "desc";
}

export class DishService {
	private repository = new DishRepository();

	async findAll(query: GetDishesQuery): Promise<ServiceResponse<Dish[] | null>> {
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

	async create(data: Prisma.DishCreateInput): Promise<ServiceResponse<Dish>> {
		try {
			const dish = await this.repository.create(data);
			return ServiceResponse.success("Dish created successfully.", dish, StatusCodes.CREATED);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to create dish. ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
}

export const dishService = new DishService();
