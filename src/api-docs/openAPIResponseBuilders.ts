import type { ResponseConfig } from "@asteasolutions/zod-to-openapi";
import { StatusCodes } from "http-status-codes";
import type { z } from "zod";

import { ServiceResponseSchema } from "@/common/models/serviceResponse";

// use if you want a single response for an endpoint
export function createApiResponse(
	schema: z.ZodTypeAny,
	description: string,
	statusCode = StatusCodes.OK,
	paginated: boolean = false,
): { [key: string]: ResponseConfig } {
	if (paginated) {
		return {
			[statusCode]: {
				description,
				content: {
					"application/json": {
						schema: ServiceResponseSchema(schema),
					},
				},
			},
		};
	}
	return {
		[statusCode]: {
			description,
			content: {
				"application/json": {
					schema: ServiceResponseSchema(schema).omit({ meta: true, error: true }),
				},
			},
		},
	};
}

// Use if you want multiple responses for a single endpoint
export type ApiResponseConfig = {
	schema: z.ZodTypeAny;
	description: string;
	statusCode: StatusCodes;
};

export function createApiResponses(configs: ApiResponseConfig[]) {
	const responses: { [key: string]: ResponseConfig } = {};
	configs.forEach(({ schema, description, statusCode }) => {
		responses[statusCode] = {
			description,
			content: {
				"application/json": {
					schema: ServiceResponseSchema(schema),
				},
			},
		};
	});
	return responses;
}
