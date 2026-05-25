import { StatusCodes } from "http-status-codes/build/cjs/status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import type { Cart } from "./cart.dto";
import { cartRepository } from "./cartRepository";

export class CartService {
	private cartRepository = cartRepository;
	async findAll(userId: string | undefined): Promise<ServiceResponse<Cart[] | null>> {
		try {
			const data = await this.cartRepository.findAll(userId);
			return ServiceResponse.success("Carts found.", data);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to retrieve carts: ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async create(
		userId: string | undefined,
		payload: { restaurantId: string; items: any[] },
	): Promise<ServiceResponse<Cart | null>> {
		if (!userId) {
			return ServiceResponse.failure("User ID is required to create a cart.", null, StatusCodes.BAD_REQUEST);
		}

		const existingCart = await this.cartRepository.findCart(userId, payload.restaurantId);
		if (existingCart) {
			await this.addItemToCart(existingCart.id, payload.items);
			return ServiceResponse.success("Cart updated successfully.", existingCart);
		}

		try {
			const data = await this.cartRepository.createCart(userId, payload.restaurantId);
			await this.addItemToCart(data.id, payload.items);
			return ServiceResponse.success("Cart created successfully.", data, StatusCodes.CREATED);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to create cart: ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// payload body create cart
	// {
	// "restaurantId": "{{resto_id}}",
	// "dishId": "{{dish_id}}",
	// "items": [
	//     {
	//         "quantity": 1,
	//         "price": 2000,
	//         "note":"woke"
	//     }
	// ]
	// }

	// add cart item, update cart item, remove cart item, clear cart, etc. can be implemented here
	private async addItemToCart(cardId: string, items: any[]) {
		// { cartId: string; dishId: string; quantity: number; price: number; notes?: string }

		const itemCartData: { cartId: string; dishId: string; quantity: number; price: number; notes?: string }[] = [];

		items.forEach((item) => {
			itemCartData.push({
				cartId: cardId, // You should replace this with the actual cart ID after fetching/creating the cart
				dishId: item.dishId,
				quantity: item.quantity,
				price: item.price,
				notes: item.notes,
			});
		});

		console.log(itemCartData);
		await cartRepository.createCartItem(itemCartData);
	}

	// async addToCart(params: { userId: string; restaurantId: string; dishId: string; quantity: number; notes?: string }) {
	// 	const { userId, restaurantId, dishId, quantity, notes } = params;

	// 	return prisma.$transaction(async (tx) => {
	// 		/**
	// 		 * Validate Dish
	// 		 */
	// 		const dish = await tx.dish.findFirst({
	// 			where: {
	// 				id: dishId,
	// 				restaurantId,
	// 				isAvailable: true,
	// 			},
	// 		});

	// 		if (!dish) {
	// 			throw new Error("Dish not found");
	// 		}

	// 		/**
	// 		 * Find/Create Cart
	// 		 */
	// 		let cart = await this.cartRepository.findCart(userId, restaurantId);

	// 		if (!cart) {
	// 			cart = await this.cartRepository.createCart(userId, restaurantId);
	// 		}

	// 		/**
	// 		 * Existing Item
	// 		 */
	// 		const existingItem = await this.cartRepository.findCartItem(cart.id, dishId, notes);

	// 		if (existingItem) {
	// 			await this.cartRepository.updateCartItem(existingItem.id, existingItem.quantity + quantity);
	// 		} else {
	// 			await this.cartRepository.createCartItem({
	// 				cartId: cart.id,
	// 				dishId,
	// 				quantity,
	// 				price: Number(dish.price),
	// 				notes,
	// 			});
	// 		}

	// 		return this.cartRepository.findCart(userId, restaurantId);
	// 	});
	// }
}
