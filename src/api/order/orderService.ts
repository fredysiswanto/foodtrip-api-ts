import { StatusCodes } from "http-status-codes/build/cjs/status-codes";
import { cartRepository } from "@/api/cart/cartRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import type { CreateOrderInput, Order, UpdateOrderPaymentStatusInput, UpdateOrderStatusInput } from "./order.dto";
import { OrderRepository } from "./orderRepository";

export class OrderService {
	private readonly orderRepository = new OrderRepository();
	private readonly cartRepository = cartRepository;

	async findAll(userId: string | undefined): Promise<ServiceResponse<Order[] | null>> {
		if (!userId) {
			return ServiceResponse.failure("User ID is required.", null, StatusCodes.BAD_REQUEST);
		}

		try {
			const data = await this.orderRepository.findAllByUser(userId);
			return ServiceResponse.success("Orders found.", data);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to retrieve orders: ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async findById(userId: string | undefined, id: string): Promise<ServiceResponse<Order | null>> {
		if (!userId) {
			return ServiceResponse.failure("User ID is required.", null, StatusCodes.BAD_REQUEST);
		}

		try {
			const order = await this.orderRepository.findByUserAndId(userId, id);
			if (!order) {
				return ServiceResponse.failure("Order not found.", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success("Order found.", order);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to retrieve order: ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async findAllAdmin(): Promise<ServiceResponse<Order[] | null>> {
		try {
			const data = await this.orderRepository.findAll();
			return ServiceResponse.success("Orders found.", data);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to retrieve orders: ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async findByIdAdmin(id: string): Promise<ServiceResponse<Order | null>> {
		try {
			const order = await this.orderRepository.findById(id);
			if (!order) {
				return ServiceResponse.failure("Order not found.", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success("Order found.", order);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to retrieve order: ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async create(userId: string | undefined, payload: CreateOrderInput): Promise<ServiceResponse<Order | null>> {
		if (!userId) {
			return ServiceResponse.failure("User ID is required.", null, StatusCodes.BAD_REQUEST);
		}

		try {
			const cart = await this.cartRepository.findCart(userId, payload.restaurantId);
			if (!cart?.cartItems.length) {
				return ServiceResponse.failure("Cart is empty or not found.", null, StatusCodes.BAD_REQUEST);
			}

			const subtotal = cart.cartItems.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
			const deliveryFee = 0;
			const tax = 0;
			const total = subtotal + deliveryFee + tax;
			const orderNo = `ORDER-${Date.now()}`;

			const order = await this.orderRepository.createOrder({
				orderNo,
				userId,
				restaurantId: payload.restaurantId,
				subtotal,
				deliveryFee,
				tax,
				total,
				paymentMethod: payload.paymentMethod,
				customerName: payload.customerName,
				customerPhone: payload.customerPhone,
				deliveryAddress: payload.deliveryAddress,
				notes: payload.notes,
				items: cart.cartItems.map((item) => ({
					dishId: item.dishId,
					dishName: item.dish.name,
					dishPrice: Number(item.price),
					quantity: item.quantity,
					subtotal: Number(item.price) * item.quantity,
					notes: item.notes ?? null,
				})),
			});

			return ServiceResponse.success("Order created successfully.", order, StatusCodes.CREATED);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to create order: ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async updateStatus(id: string, payload: UpdateOrderStatusInput): Promise<ServiceResponse<Order | null>> {
		try {
			const order = await this.orderRepository.findById(id);
			if (!order) {
				return ServiceResponse.failure("Order not found.", null, StatusCodes.NOT_FOUND);
			}

			await this.orderRepository.updateStatus(id, payload.status);
			const updatedOrder = await this.orderRepository.findById(id);
			return ServiceResponse.success("Order status updated successfully.", updatedOrder);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to update order status: ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async updatePaymentStatus(
		id: string,
		payload: UpdateOrderPaymentStatusInput,
	): Promise<ServiceResponse<Order | null>> {
		try {
			const order = await this.orderRepository.findById(id);
			if (!order) {
				return ServiceResponse.failure("Order not found.", null, StatusCodes.NOT_FOUND);
			}

			await this.orderRepository.updatePaymentStatus(id, payload.paymentStatus);
			const updatedOrder = await this.orderRepository.findById(id);
			return ServiceResponse.success("Order payment status updated successfully.", updatedOrder);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to update order payment status: ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
