import type { Request, RequestHandler, Response } from "express";
import type { ServiceResponseType } from "@/common/models/serviceResponse";
import { validateData } from "@/common/utils/commonValidation";
import type { Cart } from "./cart.dto";
import { CreateCartSchema, UpdateCartItemSchema } from "./cart.dto";
import { CartService } from "./cartService";

class CartController {
	private readonly cartService = new CartService();
	public getCarts: RequestHandler = async (_req: Request, res: Response<ServiceResponseType<Cart[] | null>>) => {
		const userId = (_req as Request & { user?: { userId: string } }).user?.userId;
		try {
			const serviceResponse = await this.cartService.findAll(userId);
			res.status(serviceResponse.statusCode).send(serviceResponse);
		} catch (error) {
			this.handleUnexpectedError(res, error);
		}
	};

	public createCart: RequestHandler = async (req: Request, res: Response) => {
		const userId = (req as Request & { user?: { userId: string } }).user?.userId;
		const payload = req.body;

		try {
			const validatedData = validateData(CreateCartSchema, {
				userId: userId,
				restaurantId: payload.restaurantId,
				items: payload.items,
			});

			const serviceResponse = await this.cartService.create(userId, validatedData);
			res.status(serviceResponse.statusCode).send(serviceResponse);
		} catch (error) {
			this.handleValidationErrorOrPanic(res, error);
		}
	};

	public updateCartItem: RequestHandler = async (req: Request, res: Response) => {
		const userId = (req as Request & { user?: { userId: string } }).user?.userId;
		const itemId = req.params.itemId;
		const payload = req.body;

		try {
			const validatedData = validateData(UpdateCartItemSchema, payload);
			const serviceResponse = await this.cartService.updateCartItem(userId, itemId, validatedData);
			res.status(serviceResponse.statusCode).send(serviceResponse);
		} catch (error) {
			this.handleValidationErrorOrPanic(res, error);
		}
	};

	public deleteCartItem: RequestHandler = async (req: Request, res: Response) => {
		const userId = (req as Request & { user?: { userId: string } }).user?.userId;
		const itemId = req.params.itemId;

		try {
			const serviceResponse = await this.cartService.deleteCartItem(userId, itemId);
			res.status(serviceResponse.statusCode).send(serviceResponse);
		} catch (error) {
			this.handleUnexpectedError(res, error);
		}
	};

	private handleValidationErrorOrPanic(res: Response, error: unknown) {
		if (error instanceof Error) {
			if (error.name === "ZodError") {
				return res.status(400).json({
					success: false,
					message: error.message,
					data: null,
					statusCode: 400,
				});
			}

			try {
				const parsedErrors = JSON.parse(error.message);
				return res.status(400).json({
					success: false,
					message: parsedErrors[0]?.message || "Oh No!. Invalid input data!.",
					data: null,
					statusCode: 400,
					errors: parsedErrors,
				});
			} catch {
				return res.status(400).json({
					success: false,
					message: error.message,
					data: null,
					statusCode: 400,
				});
			}
		}
		this.handleUnexpectedError(res, error);
	}

	private handleUnexpectedError(res: Response, _error: unknown) {
		res.status(500).json({
			success: false,
			message: "Internal server error",
			data: null,
			statusCode: 500,
		});
	}
}

export const cartController = new CartController();
