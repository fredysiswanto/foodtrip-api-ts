import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { validateData } from "@/common/utils/commonValidation";
import { dishController } from "../dishController";
import { dishService } from "../dishServices";

vi.mock("../dishServices", () => ({
	dishService: {
		findAll: vi.fn(),
		findById: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		findAllByRestaurants: vi.fn(),
	},
}));

vi.mock("@/common/utils/commonValidation", () => ({
	validateData: vi.fn(),
}));

describe("DishController", () => {
	let req: Partial<Request>;
	let res: Partial<Response>;

	beforeEach(() => {
		vi.clearAllMocks();

		res = {
			status: vi.fn().mockReturnThis(),
			send: vi.fn(),
		};
	});

	describe("getDishes", () => {
		it("should return dishes", async () => {
			req = {
				query: {
					page: "1",
				},
			};

			const serviceResponse = {
				success: true,
				message: "Dishes found.",
				statusCode: StatusCodes.OK,
				responseObject: [],
			};

			vi.mocked(dishService.findAll).mockResolvedValue(serviceResponse as any);

			await dishController.getDishes(req as Request, res as Response, vi.fn());

			expect(dishService.findAll).toHaveBeenCalledWith(req.query);

			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);

			expect(res.send).toHaveBeenCalledWith(serviceResponse);
		});
	});

	describe("getDishById", () => {
		it("should return dish by id", async () => {
			req = {
				params: {
					id: "dish-1",
				},
			};

			const serviceResponse = {
				success: true,
				statusCode: StatusCodes.OK,
			};

			vi.mocked(dishService.findById).mockResolvedValue(serviceResponse as any);

			await dishController.getDishById(req as Request, res as Response, vi.fn());

			expect(dishService.findById).toHaveBeenCalledWith("dish-1");

			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
		});
	});

	describe("createDish", () => {
		it("should create dish when payload is valid", async () => {
			req = {
				body: {
					name: "Nasi Goreng",
				},
			};

			vi.mocked(validateData).mockReturnValue(req.body as any);

			const serviceResponse = {
				success: true,
				statusCode: StatusCodes.CREATED,
			};

			vi.mocked(dishService.create).mockResolvedValue(serviceResponse as any);

			await dishController.createDish(req as Request, res as Response, vi.fn());

			expect(validateData).toHaveBeenCalled();

			expect(dishService.create).toHaveBeenCalledWith(req.body);

			expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
		});

		it("should return 400 when validation fails", async () => {
			req = {
				body: {},
			};

			vi.mocked(validateData).mockReturnValue(false);

			await dishController.createDish(req as Request, res as Response, vi.fn());

			expect(dishService.create).not.toHaveBeenCalled();

			expect(res.status).toHaveBeenCalledWith(400);

			expect(res.send).toHaveBeenCalledWith({
				success: false,
				message: "Oh No!. Invalid input data!.",
				data: null,
			});
		});
	});

	describe("updateDish", () => {
		it("should update dish when payload is valid", async () => {
			req = {
				params: {
					id: "dish-1",
				},
				body: {
					name: "Mie Goreng",
				},
			};

			vi.mocked(validateData).mockReturnValue(req.body as any);

			const serviceResponse = {
				success: true,
				statusCode: StatusCodes.OK,
			};

			vi.mocked(dishService.update).mockResolvedValue(serviceResponse as any);

			await dishController.updateDish(req as Request, res as Response, vi.fn());

			expect(dishService.update).toHaveBeenCalledWith("dish-1", req.body);

			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
		});

		it("should return 400 when validation fails", async () => {
			req = {
				params: {
					id: "dish-1",
				},
				body: {},
			};

			vi.mocked(validateData).mockReturnValue(false);

			await dishController.updateDish(req as Request, res as Response, vi.fn());

			expect(dishService.update).not.toHaveBeenCalled();

			expect(res.status).toHaveBeenCalledWith(400);
		});
	});

	describe("deleteDish", () => {
		it("should delete dish", async () => {
			req = {
				params: {
					id: "dish-1",
				},
			};

			const serviceResponse = {
				success: true,
				statusCode: StatusCodes.OK,
			};

			vi.mocked(dishService.delete).mockResolvedValue(serviceResponse as any);

			await dishController.deleteDish(req as Request, res as Response, vi.fn());

			expect(dishService.delete).toHaveBeenCalledWith("dish-1");

			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
		});
	});

	describe("getDishesByRestaurant", () => {
		it("should return bad request when restaurant context missing", async () => {
			req = {
				user: {},
			} as any;

			await dishController.getDishesByRestaurant(req as Request, res as Response, vi.fn());

			expect(dishService.findAllByRestaurants).not.toHaveBeenCalled();

			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		});

		it("should return dishes by restaurant", async () => {
			req = {
				user: {
					restaurantId: ["restaurant-1"],
				},
				query: {
					page: "1",
				},
			} as any;

			const serviceResponse = {
				success: true,
				statusCode: StatusCodes.OK,
			};

			vi.mocked(dishService.findAllByRestaurants).mockResolvedValue(serviceResponse as any);

			await dishController.getDishesByRestaurant(req as Request, res as Response, vi.fn());

			expect(dishService.findAllByRestaurants).toHaveBeenCalledWith(["restaurant-1"], req.query);

			expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
		});
	});
});
