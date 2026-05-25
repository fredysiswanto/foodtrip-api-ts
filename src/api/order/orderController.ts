import type { Request, RequestHandler, Response } from "express";
import type { ServiceResponseType } from "@/common/models/serviceResponse";
import { validateData } from "@/common/utils/commonValidation";
import type { Order } from "./order.dto";
import { CreateOrderSchema, UpdateOrderPaymentStatusSchema, UpdateOrderStatusSchema } from "./order.dto";
import { OrderService } from "./orderService";

export class OrderController {
	private readonly orderService = new OrderService();

	public getOrders: RequestHandler = async (_req: Request, res: Response<ServiceResponseType<Order[] | null>>) => {
		const userId = (_req as Request & { user?: { userId: string } }).user?.userId;
		try {
			const serviceResponse = await this.orderService.findAll(userId);
			res.status(serviceResponse.statusCode).send(serviceResponse);
		} catch (error) {
			this.handleUnexpectedError(res, error);
		}
	};

	public getOrderById: RequestHandler = async (req: Request, res: Response<ServiceResponseType<Order | null>>) => {
		const userId = (req as Request & { user?: { userId: string } }).user?.userId;
		const { id } = req.params;
		try {
			const serviceResponse = await this.orderService.findById(userId, id);
			res.status(serviceResponse.statusCode).send(serviceResponse);
		} catch (error) {
			this.handleUnexpectedError(res, error);
		}
	};

	public getOrdersAdmin: RequestHandler = async (_req: Request, res: Response<ServiceResponseType<Order[] | null>>) => {
		try {
			const serviceResponse = await this.orderService.findAllAdmin();
			res.status(serviceResponse.statusCode).send(serviceResponse);
		} catch (error) {
			this.handleUnexpectedError(res, error);
		}
	};

	public getOrderByIdAdmin: RequestHandler = async (req: Request, res: Response<ServiceResponseType<Order | null>>) => {
		const { id } = req.params;
		try {
			const serviceResponse = await this.orderService.findByIdAdmin(id);
			res.status(serviceResponse.statusCode).send(serviceResponse);
		} catch (error) {
			this.handleUnexpectedError(res, error);
		}
	};

	public createOrder: RequestHandler = async (req: Request, res: Response<ServiceResponseType<Order | null>>) => {
		const userId = (req as Request & { user?: { userId: string } }).user?.userId;
		try {
			const validatedData = validateData(CreateOrderSchema, req.body);
			const serviceResponse = await this.orderService.create(userId, validatedData);
			res.status(serviceResponse.statusCode).send(serviceResponse);
		} catch (error) {
			this.handleValidationErrorOrPanic(res, error);
		}
	};

	public updateOrderStatus: RequestHandler = async (req: Request, res: Response<ServiceResponseType<Order | null>>) => {
		const { id } = req.params;
		try {
			const validatedData = validateData(UpdateOrderStatusSchema, req.body);
			const serviceResponse = await this.orderService.updateStatus(id, validatedData);
			res.status(serviceResponse.statusCode).send(serviceResponse);
		} catch (error) {
			this.handleValidationErrorOrPanic(res, error);
		}
	};

	public updateOrderPaymentStatus: RequestHandler = async (
		req: Request,
		res: Response<ServiceResponseType<Order | null>>,
	) => {
		const { id } = req.params;
		try {
			const validatedData = validateData(UpdateOrderPaymentStatusSchema, req.body);
			const serviceResponse = await this.orderService.updatePaymentStatus(id, validatedData);
			res.status(serviceResponse.statusCode).send(serviceResponse);
		} catch (error) {
			this.handleValidationErrorOrPanic(res, error);
		}
	};

	private handleValidationErrorOrPanic(res: Response, error: unknown) {
		if (error instanceof Error) {
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

export const orderController = new OrderController();
