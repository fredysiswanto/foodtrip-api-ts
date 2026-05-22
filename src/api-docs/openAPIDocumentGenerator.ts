import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { authRegistry } from "@/api/auth/authRouter";
import { categoryRegistry } from "@/api/category/categoryRouter";
import { dishRegistry } from "@/api/dish/dishRouter";
import { healthCheckRegistry } from "@/api/healthCheck/healthCheckRouter";
import { restaurantRegistry } from "@/api/restaurant/restaurantRouter";
import { uploadRegistry } from "@/api/upload/uploadRouter";
import { userRegistry } from "@/api/user/userRouter";

export type OpenAPIDocument = ReturnType<OpenApiGeneratorV3["generateDocument"]>;

export function generateOpenAPIDocument(): OpenAPIDocument {
	const registry = new OpenAPIRegistry([
		healthCheckRegistry,
		authRegistry,
		userRegistry,
		categoryRegistry,
		dishRegistry,
		restaurantRegistry,
		uploadRegistry,
	]);
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
	});
}
