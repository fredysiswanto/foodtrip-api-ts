import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import type { Prisma } from "@/generated/prisma/client";
import type { CreateRestaurantInput } from "./restaurantModel";
import { RestaurantRepository, type UpdateRestaurantData } from "./restaurantRepository";

type Restaurant = Prisma.RestaurantModel;

export interface GetRestaurantsQuery {
	page?: string;
	limit?: string;
	search?: string;
	sortBy?: "name" | "price" | "createdAt";
	sortOrder?: "asc" | "desc";
}

export class RestaurantService {
	private repository = new RestaurantRepository();

	async findAll(query: GetRestaurantsQuery): Promise<ServiceResponse<Restaurant[] | null>> {
		try {
			const { data, meta } = await this.repository.findAll(query);

			return ServiceResponse.paginatedSuccess("Restaurants found.", data, meta);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to retrieve restaurants. ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.NOT_FOUND,
			);
		}
	}

	async findById(id: string): Promise<ServiceResponse<Restaurant | null>> {
		try {
			const restaurant = await this.repository.findById(id);
			if (!restaurant) {
				return ServiceResponse.failure("Restaurant not found.", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success("Restaurant found.", restaurant);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to retrieve restaurant. ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async create(data: CreateRestaurantInput): Promise<ServiceResponse<Restaurant | null>> {
		try {
			const restaurant = await this.repository.create(data);
			return ServiceResponse.success("Restaurant created.", restaurant, StatusCodes.CREATED);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to create restaurant. ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async update(id: string, data: UpdateRestaurantData): Promise<ServiceResponse<Restaurant | null>> {
		try {
			const restaurant = await this.repository.update(id, data);
			return ServiceResponse.success("Restaurant updated.", restaurant);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to update restaurant. ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
}

export const restaurantService = new RestaurantService();
