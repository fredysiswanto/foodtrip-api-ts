import { prisma } from "@/utils/prismaClient";
import type { Cart } from "./cart.dto";

class CartRepository {
	async findAll(userId: string | undefined): Promise<Cart[] | null> {
		return prisma.cart.findMany({
			where: { userId },
			include: {
				user: {
					select: { fullName: true, email: true },
				},
				restaurant: {
					select: { name: true },
				},
				cartItems: {
					select: { id: true, quantity: true, price: true },
				},
			},
		});
	}
	async findCart(userId: string, restaurantId: string) {
		return prisma.cart.findUnique({
			where: {
				userId_restaurantId: {
					userId,
					restaurantId,
				},
			},
			include: {
				cartItems: {
					include: {
						dish: true,
					},
				},
			},
		});
	}

	async createCart(userId: string, restaurantId: string) {
		return prisma.cart.create({
			data: {
				userId,
				restaurantId,
			},
			select: {
				id: true,
				userId: true,
				restaurantId: true,
				createdAt: true,
			},
		});
	}

	async findCartItem(cartId: string, dishId: string, notes?: string) {
		return prisma.cartItem.findFirst({
			where: {
				cartId,
				dishId,
				notes: notes || null,
			},
		});
	}

	async createCartItem(data: { cartId: string; dishId: string; quantity: number; price: number; notes?: string }[]) {
		return prisma.cartItem.createMany({
			data,
		});
	}

	async updateCartItem(id: string, quantity: number) {
		return prisma.cartItem.update({
			where: { id },
			data: {
				quantity,
			},
		});
	}

	async deleteCartItem(id: string) {
		return prisma.cartItem.delete({
			where: { id },
		});
	}
}

export const cartRepository = new CartRepository();
