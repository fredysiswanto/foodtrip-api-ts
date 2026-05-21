import { StatusCodes } from "http-status-codes";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Category } from "@/api/category/category.dto";
import { CategoryService } from "../categoryService";

const mockedCategoryRepository = {
	findBySlug: vi.fn(),
	findAll: vi.fn(),
	findById: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
};

vi.mock("@/api/category/categoryRepository", () => ({
	CategoryRepository: vi.fn(() => mockedCategoryRepository),
}));

describe("categoryService", () => {
	const categoryServiceInstance = new CategoryService();

	const sampleCategory: Category = {
		id: "11111111-1111-1111-1111-111111111111",
		slug: "breakfast",
		name: "Breakfast",
		description: "Morning favorites",
		createdAt: new Date("2026-01-01T00:00:00.000Z"),
		updatedAt: new Date("2026-01-01T00:00:00.000Z"),
		deletedAt: null,
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("findAll", () => {
		it("returns a list of categories", async () => {
			mockedCategoryRepository.findAll.mockResolvedValue([sampleCategory]);

			const result = await categoryServiceInstance.findAll();

			expect(result.statusCode).toEqual(StatusCodes.OK);
			expect(result.success).toBeTruthy();
			expect(result.data).toEqual([sampleCategory]);
		});

		it("returns internal server error when repository throws", async () => {
			mockedCategoryRepository.findAll.mockRejectedValue(new Error("Database failure"));

			const result = await categoryServiceInstance.findAll();

			expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
			expect(result.success).toBeFalsy();
			expect(result.data).toBeNull();
			expect(result.message).toContain("Unable to retrieve categories");
		});
	});

	describe("findById", () => {
		it("returns a category when found", async () => {
			mockedCategoryRepository.findById.mockResolvedValue(sampleCategory);

			const result = await categoryServiceInstance.findById(sampleCategory.id);

			expect(result.statusCode).toEqual(StatusCodes.OK);
			expect(result.success).toBeTruthy();
			expect(result.data).toEqual(sampleCategory);
		});

		it("returns not found when category does not exist", async () => {
			mockedCategoryRepository.findById.mockResolvedValue(null);

			const result = await categoryServiceInstance.findById(sampleCategory.id);

			expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
			expect(result.success).toBeFalsy();
			expect(result.data).toBeNull();
		});

		it("returns internal server error when repository throws", async () => {
			mockedCategoryRepository.findById.mockRejectedValue(new Error("Repository error"));

			const result = await categoryServiceInstance.findById(sampleCategory.id);

			expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
			expect(result.success).toBeFalsy();
			expect(result.data).toBeNull();
		});
	});

	describe("create", () => {
		it("creates a category when slug is unique", async () => {
			mockedCategoryRepository.findBySlug.mockResolvedValue(null);
			mockedCategoryRepository.create.mockResolvedValue(sampleCategory);

			const result = await categoryServiceInstance.create({
				name: sampleCategory.name,
				description: sampleCategory.description,
				slug: sampleCategory.slug,
			});

			expect(result.statusCode).toEqual(StatusCodes.CREATED);
			expect(result.success).toBeTruthy();
			expect(result.data).toEqual(sampleCategory);
		});

		it("returns conflict when the slug already exists", async () => {
			mockedCategoryRepository.findBySlug.mockResolvedValue(sampleCategory);

			const result = await categoryServiceInstance.create({
				name: sampleCategory.name,
				description: sampleCategory.description,
				slug: sampleCategory.slug,
			});

			expect(result.statusCode).toEqual(StatusCodes.CONFLICT);
			expect(result.success).toBeFalsy();
			expect(result.data).toBeNull();
		});
	});

	describe("update", () => {
		const updatedCategory: Category = {
			...sampleCategory,
			name: "Brunch",
			slug: "brunch",
			updatedAt: new Date("2026-01-02T00:00:00.000Z"),
		};

		it("updates a category when ID exists and slug is unique", async () => {
			mockedCategoryRepository.findById.mockResolvedValue(sampleCategory);
			mockedCategoryRepository.findBySlug.mockResolvedValue(null);
			mockedCategoryRepository.update.mockResolvedValue(updatedCategory);

			const result = await categoryServiceInstance.update(sampleCategory.id, {
				name: updatedCategory.name,
				description: updatedCategory.description,
				slug: updatedCategory.slug,
			});

			expect(result.statusCode).toEqual(StatusCodes.OK);
			expect(result.success).toBeTruthy();
			expect(result.data).toEqual(updatedCategory);
		});

		it("returns conflict when updating to a duplicate slug", async () => {
			mockedCategoryRepository.findById.mockResolvedValue(sampleCategory);
			mockedCategoryRepository.findBySlug.mockResolvedValue({
				...sampleCategory,
				id: "22222222-2222-2222-2222-222222222222",
				slug: "brunch",
			});

			const result = await categoryServiceInstance.update(sampleCategory.id, {
				name: updatedCategory.name,
				description: updatedCategory.description,
				slug: updatedCategory.slug,
			});

			expect(result.statusCode).toEqual(StatusCodes.CONFLICT);
			expect(result.success).toBeFalsy();
			expect(result.data).toBeNull();
		});

		it("returns not found when the category does not exist", async () => {
			mockedCategoryRepository.findById.mockResolvedValue(null);

			const result = await categoryServiceInstance.update(sampleCategory.id, {
				name: updatedCategory.name,
				description: updatedCategory.description,
				slug: updatedCategory.slug,
			});

			expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
			expect(result.success).toBeFalsy();
			expect(result.data).toBeNull();
		});
	});

	describe("delete", () => {
		it("deletes a category when it exists", async () => {
			mockedCategoryRepository.findById.mockResolvedValue(sampleCategory);
			mockedCategoryRepository.delete.mockResolvedValue(undefined);

			const result = await categoryServiceInstance.delete(sampleCategory.id);

			expect(result.statusCode).toEqual(StatusCodes.OK);
			expect(result.success).toBeTruthy();
			expect(result.data).toBeNull();
		});

		it("returns not found when the category does not exist", async () => {
			mockedCategoryRepository.findById.mockResolvedValue(null);

			const result = await categoryServiceInstance.delete(sampleCategory.id);

			expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
			expect(result.success).toBeFalsy();
			expect(result.data).toBeNull();
		});
	});
});
