import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/generated/prisma/enums";
import { prisma } from "@/utils/prismaClient";
import type { Order } from "./order.dto";

export class OrderRepository {
	async findAllByUser(userId: string): Promise<Order[]> {
		return prisma.order.findMany({
			where: { userId },
			include: { orderItems: true },
		});
	}

	async findById(id: string): Promise<Order | null> {
		return prisma.order.findUnique({
			where: { id },
			include: { orderItems: true },
		});
	}

	async findByUserAndId(userId: string, id: string): Promise<Order | null> {
		return prisma.order.findFirst({
			where: { id, userId },
			include: { orderItems: true },
		});
	}

	async findAll(): Promise<Order[]> {
		return prisma.order.findMany({
			include: { orderItems: true },
		});
	}

	async createOrder(params: {
		orderNo: string;
		userId: string;
		restaurantId: string;
		subtotal: number;
		deliveryFee: number;
		tax: number;
		total: number;
		paymentMethod?: PaymentMethod;
		customerName: string;
		customerPhone: string;
		deliveryAddress: string;
		notes?: string;
		items: Array<{
			dishId: string;
			dishName: string;
			dishPrice: number;
			quantity: number;
			subtotal: number;
			notes?: string | null;
		}>;
	}): Promise<Order | null> {
		return prisma.$transaction(async (tx) => {
			const order = await tx.order.create({
				data: {
					orderNo: params.orderNo,
					userId: params.userId,
					restaurantId: params.restaurantId,
					subtotal: params.subtotal,
					deliveryFee: params.deliveryFee,
					tax: params.tax,
					total: params.total,
					paymentMethod: params.paymentMethod,
					customerName: params.customerName,
					customerPhone: params.customerPhone,
					deliveryAddress: params.deliveryAddress,
					notes: params.notes,
				},
			});

			await tx.orderItem.createMany({
				data: params.items.map((item) => ({
					orderId: order.id,
					dishId: item.dishId,
					dishName: item.dishName,
					dishPrice: item.dishPrice,
					quantity: item.quantity,
					subtotal: item.subtotal,
					notes: item.notes,
				})),
			});

			return tx.order.findUnique({
				where: { id: order.id },
				include: { orderItems: true },
			});
		});
	}

	async updateStatus(id: string, status: OrderStatus) {
		return prisma.order.update({
			where: { id },
			data: { status },
		});
	}

	async updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
		return prisma.order.update({
			where: { id },
			data: { paymentStatus },
		});
	}

	async delete(id: string): Promise<void> {
		await prisma.order.delete({ where: { id } });
	}
}
