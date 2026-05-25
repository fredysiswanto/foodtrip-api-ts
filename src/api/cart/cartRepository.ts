import { prisma } from "@/utils/prismaClient";
import { UserRepository } from "../user/userRepository";
import type { Cart } from "./cart.dto";

class CartRepository {
	private userRepository = new UserRepository();

	async findAll(userId: string | undefined): Promise<Cart[] | null> {
		const isAdmin = userId ? await this.userRepository.userIsAdmin(userId) : false;
		if (userId && isAdmin) {
			return prisma.cart.findMany({
				// where: { userId },
				include: {
					user: {
						select: { fullName: true, email: true },
					},
					restaurant: {
						select: { name: true },
					},
					cartItems: {
						select: {
							id: true,
							dishId: true,
							quantity: true,
							price: true,
							notes: true,
							createdAt: true,
							updatedAt: true,
						},
					},
				},
			});
		}
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
					select: {
						id: true,
						dishId: true,
						quantity: true,
						price: true,
						notes: true,
						createdAt: true,
						updatedAt: true,
					},
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
			include: {
				cartItems: {
					include: {
						dish: true,
					},
				},
			},
		});
	}

	async findDishById(dishId: string) {
		return prisma.dish.findUnique({
			where: { id: dishId },
			select: {
				id: true,
				restaurantId: true,
				price: true,
				isAvailable: true,
			},
		});
	}

	async createOrUpdateCartItems(
		cartItemData: { cartId: string; dishId: string; quantity: number; price: number; notes?: string | null }[],
	) {
		return prisma.$transaction(async (tx) => {
			const results = [] as Array<
				Awaited<ReturnType<typeof tx.cartItem.create>> | Awaited<ReturnType<typeof tx.cartItem.update>>
			>;
			for (const item of cartItemData) {
				const existingItem = await tx.cartItem.findFirst({
					where: {
						cartId: item.cartId,
						dishId: item.dishId,
						notes: item.notes ?? null,
					},
				});

				if (existingItem) {
					results.push(
						await tx.cartItem.update({
							where: { id: existingItem.id },
							data: { quantity: { increment: item.quantity } },
						}),
					);
				} else {
					results.push(
						await tx.cartItem.create({
							data: {
								cartId: item.cartId,
								dishId: item.dishId,
								quantity: item.quantity,
								price: item.price,
								notes: item.notes,
							},
						}),
					);
				}
			}

			return results;
		});
	}

	async findCartItemById(id: string) {
		return prisma.cartItem.findUnique({
			where: { id },
			include: {
				cart: {
					select: {
						userId: true,
						restaurantId: true,
					},
				},
			},
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
