import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Category } from "@/api/category/category.dto";
import { categoryController } from "../categoryController";

const mockedCategoryService = {
	findAll: vi.fn(),
	findById: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
};

type MockedCategoryService = {
	findAll: Mock;
	findById: Mock;
	create: Mock;
	update: Mock;
	delete: Mock;
};

const controllerWithMockedService = categoryController as unknown as {
	categoryService: MockedCategoryService;
};

const createMockResponse = () => {
	const res: Partial<Response> = {
		status: vi.fn().mockReturnThis(),
		send: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
	};

	return res as Response & {
		status: Mock;
		send: Mock;
		json: Mock;
	};
};

const sampleCategory: Category = {
	id: "11111111-1111-1111-1111-111111111111",
	slug: "breakfast",
	name: "Breakfast",
	description: "Morning favorites",
	createdAt: new Date("2026-01-01T00:00:00.000Z"),
	updatedAt: new Date("2026-01-01T00:00:00.000Z"),
	deletedAt: null,
};

const mockedService = mockedCategoryService as unknown as MockedCategoryService;

describe("CategoryController", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		controllerWithMockedService.categoryService = mockedCategoryService as MockedCategoryService;
	});

	describe("getCategories", () => {
		it("should return categories from the service", async () => {
			mockedService.findAll.mockResolvedValue({
				success: true,
				message: "Categories found.",
				data: [sampleCategory],
				statusCode: StatusCodes.OK,
			});

			const res = createMockResponse();
			await categoryController.getCategories({} as Request, res, vi.fn());

			expect(mockedService.findAll).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: [sampleCategory],
				}),
			);
		});
	});

	describe("getCategoryById", () => {
		it("should return a single category from the service", async () => {
			mockedService.findById.mockResolvedValue({
				success: true,
				message: "Category found.",
				data: sampleCategory,
				statusCode: StatusCodes.OK,
			});

			const req = { params: { id: sampleCategory.id } } as unknown as Request;
			const res = createMockResponse();
			await categoryController.getCategoryById(req, res, vi.fn());

			expect(mockedService.findById).toHaveBeenCalledWith(sampleCategory.id);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: sampleCategory,
				}),
			);
		});
	});

	describe("createCategory", () => {
		it("should validate request body and create a category", async () => {
			mockedService.create.mockResolvedValue({
				success: true,
				message: "Category created successfully.",
				data: sampleCategory,
				statusCode: StatusCodes.CREATED,
			});

			const req = {
				body: {
					name: sampleCategory.name,
					description: sampleCategory.description,
					slug: sampleCategory.slug,
				},
			} as unknown as Request;
			const res = createMockResponse();
			await categoryController.createCategory(req, res, vi.fn());

			expect(mockedService.create).toHaveBeenCalledWith({
				name: sampleCategory.name,
				description: sampleCategory.description,
				slug: sampleCategory.slug,
			});
			expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
			expect(res.send).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: sampleCategory,
				}),
			);
		});

		it("should return 400 when create request body is invalid", async () => {
			const req = {
				body: {
					name: sampleCategory.name,
				},
			} as unknown as Request;
			const res = createMockResponse();
			await categoryController.createCategory(req, res, vi.fn());

			expect(mockedService.create).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					data: null,
					statusCode: StatusCodes.BAD_REQUEST,
				}),
			);
		});
	});

	describe("updateCategory", () => {
		it("should update a category when request is valid", async () => {
			const updatedCategory: Category = {
				...sampleCategory,
				name: "Brunch",
				slug: "brunch",
				updatedAt: new Date("2026-01-02T00:00:00.000Z"),
			};

			mockedService.update.mockResolvedValue({
				success: true,
				message: "Category updated successfully.",
				data: updatedCategory,
				statusCode: StatusCodes.OK,
			});

			const req = {
				params: { id: sampleCategory.id },
				body: {
					name: updatedCategory.name,
					description: updatedCategory.description,
					slug: updatedCategory.slug,
				},
			} as unknown as Request;
			const res = createMockResponse();
			await categoryController.updateCategory(req, res, vi.fn());

			expect(mockedService.update).toHaveBeenCalledWith(sampleCategory.id, {
				name: updatedCategory.name,
				description: updatedCategory.description,
				slug: updatedCategory.slug,
			});
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: updatedCategory,
				}),
			);
		});
	});

	describe("deleteCategory", () => {
		it("should call delete on the service and return its response", async () => {
			mockedService.delete.mockResolvedValue({
				success: true,
				message: "Category deleted successfully.",
				data: null,
				statusCode: StatusCodes.OK,
			});

			const req = { params: { id: sampleCategory.id } } as unknown as Request;
			const res = createMockResponse();
			await categoryController.deleteCategory(req, res, vi.fn());

			expect(mockedService.delete).toHaveBeenCalledWith(sampleCategory.id);
			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(res.send).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: null,
				}),
			);
		});
	});
});
