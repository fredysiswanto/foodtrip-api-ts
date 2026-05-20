import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { Prisma } from "@/generated/prisma/client";
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
	// private async validateRelations(data: Partial<CreateRestaurantInput>): Promise<string | null> {
	// 	if (data.restaurantId && !(await this.repository.restaurantExists(data.restaurantId))) {
	// 		return "The provided restaurantId does not exist.";
	// 	}

	// 	if (data.categoryId && !(await this.repository.categoryExists(data.categoryId))) {
	// 		return "The provided categoryId does not exist.";
	// 	}

	// 	return null;
	// }

	private async isSlugUnique(slug: string): Promise<boolean> {
		const existingSlug = await this.repository.findBySlug(slug);
		return !existingSlug;
	}

	private async isSlugUniqueForUpdate(slug: string, restaurantId: string): Promise<boolean> {
		const existingRestaurant = await this.repository.findBySlug(slug);
		return !existingRestaurant || existingRestaurant.id === restaurantId;
	}

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
		// const relationError = await this.validateRelations(data);
		// if (relationError) {
		// 	return ServiceResponse.failure(relationError, null, StatusCodes.BAD_REQUEST);
		// }

		if (!(await this.isSlugUnique(data.slug))) {
			return ServiceResponse.failure(
				"The provided slug is already in use. Please choose a different slug.",
				null,
				StatusCodes.CONFLICT,
			);
		}

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
			const existingRestaurant = await this.repository.findById(id);
			if (!existingRestaurant) {
				return ServiceResponse.failure("Restaurant not found.", null, StatusCodes.NOT_FOUND);
			}

			if (data.slug && data.slug !== existingRestaurant.slug) {
				if (!(await this.isSlugUniqueForUpdate(data.slug, id))) {
					return ServiceResponse.failure(
						"The provided slug is already in use. Please choose a different slug.",
						null,
						StatusCodes.CONFLICT,
					);
				}
			}

			const restaurant = await this.repository.update(id, data);
			return ServiceResponse.success("Restaurant updated.", restaurant);
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
				return ServiceResponse.failure(
					"The provided slug is already in use. Please choose a different slug.",
					null,
					StatusCodes.CONFLICT,
				);
			}

			return ServiceResponse.failure(
				`Unable to update restaurant. ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
}

export const restaurantService = new RestaurantService();
