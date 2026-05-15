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
}

export const dishService = new DishService();
