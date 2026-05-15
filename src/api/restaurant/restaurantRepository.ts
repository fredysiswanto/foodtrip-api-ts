import { prisma } from "@/common/utils/prismaClient";
import type { Prisma, RestaurantStatus } from "@/generated/prisma/client";

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
	async findAll(): Promise<Restaurant[]> {
		return prisma.restaurant.findMany({
			orderBy: { createdAt: "desc" },
		});
	}

	async findById(id: string): Promise<Restaurant | null> {
		return prisma.restaurant.findUnique({ where: { id } });
	}

	async create(data: CreateRestaurantData): Promise<Restaurant> {
		return prisma.restaurant.create({ data });
	}

	async update(id: string, data: UpdateRestaurantData): Promise<Restaurant> {
		return prisma.restaurant.update({ where: { id }, data });
	}
}
