import {
	buildOrderBy,
	buildSearch,
	createPaginationResponse,
	getPagination,
	type PaginationMeta,
} from "@/common/utils/paginationHelper";
import { prisma } from "@/utils/prismaClient";
import type { CreateDishInput, Dish } from "./dishModel";
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

	async create(data: any): Promise<Dish> {
		return prisma.dish.create({
			data,
		});
	}
}
