import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { authRegistry } from "@/api/auth/authRouter";
import { cartRegistry } from "@/api/cart/cartRouter";
import { categoryRegistry, clientCategoryRegistry } from "@/api/category/categorySwagger";
import { clientDishRegistry, dishRegistry } from "@/api/dish/dishSwagger";
import { healthCheckRegistry } from "@/api/healthCheck/healthCheckRouter";
import { orderRegistry } from "@/api/order/orderRouter";
import { clientRestaurantRegistry, restaurantRegistry } from "@/api/restaurant/restaurantSwagger";
import { uploadRegistry } from "@/api/upload/uploadRouter";
import { userRegistry } from "@/api/user/userRouter";

export type OpenAPIDocument = ReturnType<OpenApiGeneratorV3["generateDocument"]>;

export function generateOpenAPIDocument(): OpenAPIDocument {
	const registry = new OpenAPIRegistry([
		healthCheckRegistry,
		authRegistry,
		// Client APIs
		clientRestaurantRegistry,
		clientDishRegistry,
		clientCategoryRegistry,
		// Admin APIs
		userRegistry,
		categoryRegistry,
		cartRegistry,
		orderRegistry,
		dishRegistry,
		restaurantRegistry,
		uploadRegistry,
	]);

	registry.registerComponent("securitySchemes", "bearerAuth", {
		type: "http",
		scheme: "bearer",
		bearerFormat: "JWT",
	});

	const generator = new OpenApiGeneratorV3(registry.definitions);

	return generator.generateDocument({
		openapi: "3.0.0",
		info: {
			version: "1.0.0",
			title: "FoodTrip API",
			description: "Complete API documentation for FoodTrip restaurant management system",
		},

		externalDocs: {
			description: "View the raw OpenAPI Specification in JSON format",
			url: "/swagger.json",
		},

		security: [
			{
				bearerAuth: [],
			},
		],
	});
}
