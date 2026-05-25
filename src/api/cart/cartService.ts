import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import type { Cart, CreateCartInput, CreateCartItemInput, UpdateCartItemInput } from "./cart.dto";
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

	async create(userId: string | undefined, payload: CreateCartInput): Promise<ServiceResponse<Cart | null>> {
		if (!userId) {
			return ServiceResponse.failure("User ID is required to create a cart.", null, StatusCodes.BAD_REQUEST);
		}

		try {
			let cart = await this.cartRepository.findCart(userId, payload.restaurantId);
			const isNewCart = !cart;

			if (!cart) {
				cart = await this.cartRepository.createCart(userId, payload.restaurantId);
			}

			await this.addItemsToCart(cart.id, payload.restaurantId, payload.items);

			const updatedCart = await this.cartRepository.findCart(userId, payload.restaurantId);
			return ServiceResponse.success(
				isNewCart ? "Cart created successfully." : "Cart updated successfully.",
				updatedCart,
				isNewCart ? StatusCodes.CREATED : StatusCodes.OK,
			);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to create or update cart: ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async updateCartItem(userId: string | undefined, itemId: string, payload: UpdateCartItemInput) {
		if (!userId) {
			return ServiceResponse.failure("User ID is required to update a cart item.", null, StatusCodes.BAD_REQUEST);
		}

		try {
			const cartItem = await this.cartRepository.findCartItemById(itemId);
			if (!cartItem) {
				return ServiceResponse.failure("Cart item not found.", null, StatusCodes.NOT_FOUND);
			}

			if (cartItem.cart.userId !== userId) {
				return ServiceResponse.failure(
					"Forbidden. You may only update your own cart items.",
					null,
					StatusCodes.FORBIDDEN,
				);
			}

			if (payload.quantity !== undefined) {
				await this.cartRepository.updateCartItem(itemId, payload.quantity);
			}

			const cart = await this.cartRepository.findCart(userId, cartItem.cart.restaurantId);
			return ServiceResponse.success("Cart item updated successfully.", cart);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to update cart item: ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async deleteCartItem(userId: string | undefined, itemId: string) {
		if (!userId) {
			return ServiceResponse.failure("User ID is required to delete a cart item.", null, StatusCodes.BAD_REQUEST);
		}

		try {
			const cartItem = await this.cartRepository.findCartItemById(itemId);
			if (!cartItem) {
				return ServiceResponse.failure("Cart item not found.", null, StatusCodes.NOT_FOUND);
			}

			if (cartItem.cart.userId !== userId) {
				return ServiceResponse.failure(
					"Forbidden. You may only delete your own cart items.",
					null,
					StatusCodes.FORBIDDEN,
				);
			}

			await this.cartRepository.deleteCartItem(itemId);
			const cart = await this.cartRepository.findCart(userId, cartItem.cart.restaurantId);
			return ServiceResponse.success("Cart item deleted successfully.", cart);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to delete cart item: ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	private async addItemsToCart(cartId: string, restaurantId: string, items: CreateCartInput["items"]) {
		const itemCartData: CreateCartItemInput[] = [];

		for (const item of items) {
			const dish = await this.cartRepository.findDishById(item.dishId);
			if (!dish || dish.restaurantId !== restaurantId || !dish.isAvailable) {
				throw new Error(`Dish with ID ${item.dishId} is not available for this restaurant.`);
			}

			itemCartData.push({
				cartId,
				dishId: item.dishId,
				quantity: item.quantity,
				price: Number(dish.price),
				notes: item.notes,
			});
		}

		await this.cartRepository.createOrUpdateCartItems(itemCartData);
	}
}
