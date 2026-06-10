import { StatusCodes } from "http-status-codes";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DishRepository } from "../dishRepository";
import { DishService } from "../dishServices";

vi.mock("../dishRepository");

describe("DishService", () => {
	let service: DishService;

	let repositoryMock: {
		findAll: ReturnType<typeof vi.fn>;
		findAllByRestaurantIds: ReturnType<typeof vi.fn>;
		findById: ReturnType<typeof vi.fn>;
		create: ReturnType<typeof vi.fn>;
		update: ReturnType<typeof vi.fn>;
		delete: ReturnType<typeof vi.fn>;
		restaurantExists: ReturnType<typeof vi.fn>;
		categoryExists: ReturnType<typeof vi.fn>;
		findByRestaurantAndSlug: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		repositoryMock = {
			findAll: vi.fn(),
			findAllByRestaurantIds: vi.fn(),
			findById: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			restaurantExists: vi.fn(),
			categoryExists: vi.fn(),
			findByRestaurantAndSlug: vi.fn(),
		};

		vi.mocked(DishRepository).mockImplementation(() => repositoryMock as any);

		service = new DishService();
	});

	describe("findById()", () => {
		it("should return dish when found", async () => {
			const dish = {
				id: "dish-1",
				name: "Nasi Goreng",
				description: "Delicious fried rice",
				price: 20000,
				isAvailable: true,
				createdAt: new Date(),
			};

			repositoryMock.findById.mockResolvedValue(dish);

			const result = await service.findById("dish-1");

			expect(result.success).toBe(true);
			expect(result.message).toBe("Dish found.");
			expect(result.data).toEqual(dish);
		});

		it("should return not found when dish does not exist", async () => {
			repositoryMock.findById.mockResolvedValue(null);

			const result = await service.findById("dish-1");

			expect(result.success).toBe(false);
			expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
			expect(result.message).toBe("Dish not found.");
		});

		it("should handle repository error", async () => {
			repositoryMock.findById.mockRejectedValue(new Error("Database Error"));

			const result = await service.findById("dish-1");

			expect(result.success).toBe(false);
			expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
		});
	});

	describe("create()", () => {
		const payload = {
			restaurantId: "restaurant-1",
			categoryId: "category-1",
			name: "Nasi Goreng",
			slug: "nasi-goreng",
			price: 20000,
		};

		it("should create dish successfully", async () => {
			repositoryMock.restaurantExists.mockResolvedValue(true);
			repositoryMock.categoryExists.mockResolvedValue(true);
			repositoryMock.findByRestaurantAndSlug.mockResolvedValue(null);

			repositoryMock.create.mockResolvedValue({
				id: "dish-1",
				name: "Nasi Goreng",
				slug: "nasi-goreng",
				price: 20000,
				isAvailable: true,
			});

			const result = await service.create(payload as any);

			expect(result.success).toBe(true);
			expect(result.statusCode).toBe(StatusCodes.CREATED);
			expect(result.message).toBe("Dish created successfully.");

			expect(repositoryMock.create).toHaveBeenCalledWith(payload);
		});

		it("should fail when restaurant does not exist", async () => {
			repositoryMock.restaurantExists.mockResolvedValue(false);

			const result = await service.create(payload as any);

			expect(result.success).toBe(false);
			expect(result.statusCode).toBe(StatusCodes.BAD_REQUEST);
			expect(result.message).toBe("The provided restaurantId does not exist.");
		});

		it("should fail when category does not exist", async () => {
			repositoryMock.restaurantExists.mockResolvedValue(true);

			repositoryMock.categoryExists.mockResolvedValue(false);

			const result = await service.create(payload as any);

			expect(result.success).toBe(false);
			expect(result.statusCode).toBe(StatusCodes.BAD_REQUEST);
			expect(result.message).toBe("The provided categoryId does not exist.");
		});

		it("should fail when slug already exists", async () => {
			repositoryMock.restaurantExists.mockResolvedValue(true);

			repositoryMock.categoryExists.mockResolvedValue(true);

			repositoryMock.findByRestaurantAndSlug.mockResolvedValue({
				id: "dish-existing",
			});

			const result = await service.create(payload as any);

			expect(result.success).toBe(false);
			expect(result.statusCode).toBe(StatusCodes.CONFLICT);
			expect(result.message).toBe("A dish with this slug already exists for the selected restaurant.");
		});
	});

	describe("update()", () => {
		it("should update dish successfully", async () => {
			const existingDish = {
				id: "dish-1",
				restaurantId: "restaurant-1",
				slug: "old-slug",
			};

			const updatedDish = {
				...existingDish,
				slug: "new-slug",
			};

			repositoryMock.findById.mockResolvedValue(existingDish);

			repositoryMock.findByRestaurantAndSlug.mockResolvedValue(null);

			repositoryMock.update.mockResolvedValue(updatedDish);

			const result = await service.update("dish-1", {
				slug: "new-slug",
			});

			expect(result.success).toBe(true);
			expect(result.message).toBe("Dish updated successfully.");
			expect(result.data).toEqual(updatedDish);
		});

		it("should return not found when dish does not exist", async () => {
			repositoryMock.findById.mockResolvedValue(null);

			const result = await service.update("dish-1", {
				slug: "new-slug",
			});

			expect(result.success).toBe(false);
			expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
		});
	});

	describe("delete()", () => {
		it("should delete dish successfully", async () => {
			repositoryMock.findById.mockResolvedValue({
				id: "dish-1",
			});

			repositoryMock.delete.mockResolvedValue({
				id: "dish-1",
				name: "Nasi Goreng",
				deletedAt: new Date(),
			});

			const result = await service.delete("dish-1");

			expect(result.success).toBe(true);
			expect(result.message).toBe("Dish deleted successfully.");
		});

		it("should return not found when dish does not exist", async () => {
			repositoryMock.findById.mockResolvedValue(null);

			const result = await service.delete("dish-1");

			expect(result.success).toBe(false);
			expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
		});
	});

	describe("findAllByRestaurants()", () => {
		it("should return bad request when restaurant ids are empty", async () => {
			const result = await service.findAllByRestaurants([], {});

			expect(result.success).toBe(false);
			expect(result.statusCode).toBe(StatusCodes.BAD_REQUEST);
		});

		it("should return dishes", async () => {
			repositoryMock.findAllByRestaurantIds.mockResolvedValue({
				data: [],
				meta: {
					page: 1,
					limit: 10,
					total: 0,
					totalPages: 0,
				},
			});

			const result = await service.findAllByRestaurants(["restaurant-1"], {});

			expect(result.success).toBe(true);
		});
	});
});
