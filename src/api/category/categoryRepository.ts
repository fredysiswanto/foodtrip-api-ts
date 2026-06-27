import { prisma } from "@/utils/prismaClient";
import type { Category, PlaywrightDemo } from "./category.dto";

export class CategoryRepository {
	async findBySlug(slug: string): Promise<Category | null> {
		return prisma.category.findUnique({
			where: { slug },
		});
	}

	async findAll(): Promise<Category[] | null> {
		return prisma.category.findMany({ where: { deletedAt: null } });
	}

	async findById(id: string): Promise<Category | null> {
		return prisma.category.findFirst({
			where: { id },
		});
	}

	async create(data: Pick<Category, "name" | "description" | "slug">): Promise<Pick<Category, "id" | "name">> {
		return prisma.category.create({
			select: { id: true, name: true },
			data,
		});
	}

	async createEnv(data: Pick<PlaywrightDemo, "name" | "description">): Promise<Pick<PlaywrightDemo, "id" | "name">> {
		return prisma.playwrightDemo.create({
			select: { id: true, name: true },
			data,
		});
	}

	async update(id: string, data: Partial<Pick<Category, "name" | "description" | "slug">>): Promise<Category> {
		return prisma.category.update({
			where: { id },
			data,
		});
	}

	async delete(id: string): Promise<void> {
		await prisma.category.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}
