import {
	buildOrderBy,
	buildSearch,
	createPaginationResponse,
	getPagination,
	type PaginationMeta,
} from "@/common/utils/paginationHelper";
import { prisma } from "@/utils/prismaClient";
import type { CreateDishInput, Dish, UpdateDishInput } from "./dishModel";
import type { GetDishesQuery } from "./dishServices";

export class DishRepository {
	async findAll(query: GetDishesQuery): Promise<{ data: Dish[]; meta: PaginationMeta }> {
		const { page, limit, skip } = getPagination(query);
		const where = buildSearch(query.search, ["name"]);
		const orderBy = buildOrderBy(query.sortBy, query.sortOrder, ["name", "price", "createdAt"]);
		const [dishes, totalItems] = await Promise.all([
			prisma.dish.findMany({
				where,
				skip,
				take: limit,
				orderBy,
			}),
			prisma.dish.count(),
		]);

		return createPaginationResponse(dishes, totalItems, page, limit);
	}

	async findById(id: string): Promise<Dish | null> {
		return prisma.dish.findUnique({
			where: { id },
		});
	}

	async create(data: CreateDishInput): Promise<Dish> {
		return prisma.dish.create({
			data,
		});
	}

	async update(id: string, data: UpdateDishInput): Promise<Dish> {
		return prisma.dish.update({
			where: { id },
			data,
		});
	}

	async delete(id: string): Promise<Dish> {
		return prisma.dish.update({
			where: { id },
			data: { deletedAt: new Date(), isAvailable: false },
		});
	}

	async restaurantExists(id: string): Promise<boolean> {
		const restaurant = await prisma.restaurant.findUnique({
			where: { id },
			select: { id: true },
		});
		return Boolean(restaurant);
	}

	async categoryExists(id: string): Promise<boolean> {
		const category = await prisma.category.findUnique({
			where: { id },
			select: { id: true },
		});
		return Boolean(category);
	}

	async findByRestaurantAndSlug(restaurantId: string, slug: string): Promise<Dish | null> {
		return prisma.dish.findFirst({
			where: {
				restaurantId,
				slug,
			},
		});
	}
}
