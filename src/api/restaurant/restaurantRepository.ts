import {
	buildOrderBy,
	buildSearch,
	createPaginationResponse,
	getPagination,
	type PaginationMeta,
} from "@/common/utils/paginationHelper";
import { prisma } from "@/common/utils/prismaClient";
import type { Prisma, RestaurantStatus } from "@/generated/prisma/client";
import type { CreateRestaurantInput } from "./restaurantModel";
import type { GetRestaurantsQuery } from "./restaurantService";

type Restaurant = Prisma.RestaurantModel;

export type CreateRestaurantData = {
	name: string;
	slug: string;
	address: string;
	city: string;
	province: string;
	postalCode: string;
	email?: string | null;
	phone?: string | null;
};

export type UpdateRestaurantData = Partial<CreateRestaurantData> & {
	status?: RestaurantStatus;
	isOpen?: boolean;
};

export class RestaurantRepository {
	async findAll(
		query: GetRestaurantsQuery,
		restaurantIds?: string[],
	): Promise<{
		data: Pick<Restaurant, "id" | "name" | "slug" | "address" | "status" | "isOpen" | "createdAt">[];
		meta: PaginationMeta;
	}> {
		const { page, limit, skip } = getPagination(query);
		const where: Record<string, unknown> = buildSearch(query.search, ["name"]);

		if (restaurantIds) {
			where.id = { in: restaurantIds };
		}

		if (restaurantIds && restaurantIds.length === 0) {
			return createPaginationResponse([], 0, page, limit);
		}

		const orderBy = buildOrderBy(query.sortBy, query.sortOrder, ["name", "createdAt", "status"]);
		const [restaurants, totalItems] = await Promise.all([
			prisma.restaurant.findMany({
				select: {
					id: true,
					name: true,
					slug: true,
					address: true,
					status: true,
					isOpen: true,
					createdAt: true,
				},
				where,
				skip,
				take: limit,
				orderBy,
			}),
			prisma.restaurant.count({ where }),
		]);

		return createPaginationResponse(restaurants, totalItems, page, limit);
	}

	async findById(id: string): Promise<Restaurant | null> {
		return prisma.restaurant.findUnique({ where: { id } });
	}

	async create(data: CreateRestaurantInput): Promise<Pick<Restaurant, "id" | "name" | "createdAt">> {
		return prisma.restaurant.create({
			select: {
				id: true,
				name: true,
				createdAt: true,
			},
			data,
		});
	}

	async update(id: string, data: UpdateRestaurantData): Promise<Restaurant> {
		return prisma.restaurant.update({ where: { id }, data });
	}

	async findBySlug(slug: string): Promise<Restaurant | null> {
		return prisma.restaurant.findFirst({
			where: {
				slug,
			},
		});
	}
}
