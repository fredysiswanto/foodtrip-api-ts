import { prisma } from "@/utils/prismaClient";
import type { Category } from "./category.dto";

class CategoryRepository {
	async findBySlug(slug: string): Promise<Category | null> {
		return prisma.category.findUnique({
			where: { slug, deletedAt: null },
		});
	}

	async findAll(): Promise<Category[] | null> {
		return prisma.category.findMany({ where: { deletedAt: null } });
	}

	async findById(id: string): Promise<Category | null> {
		return prisma.category.findUnique({
			where: { id, deletedAt: null },
		});
	}

	async create(data: Pick<Category, "name" | "description" | "slug">): Promise<Category> {
		return prisma.category.create({
			data,
		});
	}

	async update(id: string, data: Partial<Pick<Category, "name" | "description" | "slug">>): Promise<Category> {
		return prisma.category.update({
			where: { id, deletedAt: null },
			data,
		});
	}

	async delete(id: string): Promise<void> {
		await prisma.category.update({
			where: { id, deletedAt: null },
			data: { deletedAt: new Date() },
		});
	}
}

export const categoryRepository = new CategoryRepository();
