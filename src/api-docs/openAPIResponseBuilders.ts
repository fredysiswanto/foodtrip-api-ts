import type { ResponseConfig } from "@asteasolutions/zod-to-openapi";
import { StatusCodes } from "http-status-codes";
import type { z } from "zod";

import { ServiceResponseSchema, ServicesResponseErrorSchema } from "@/common/models/serviceResponse";

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
	paginated?: boolean;
	error?: boolean;
};

export function createApiResponses(configs: ApiResponseConfig[]) {
	const responses: { [key: string]: ResponseConfig } = {};
	configs.forEach(({ schema, description, statusCode, paginated = false, error = false }) => {
		if (error) {
			responses[statusCode] = {
				description,
				content: {
					"application/json": {
						schema: ServicesResponseErrorSchema,
					},
				},
			};
			return;
		} else if (paginated) {
			responses[statusCode] = {
				description,
				content: {
					"application/json": {
						schema: ServiceResponseSchema(schema),
					},
				},
			};
		} else {
			responses[statusCode] = {
				description,
				content: {
					"application/json": {
						schema: ServiceResponseSchema(schema).omit({ meta: true, error: true }),
					},
				},
			};
		}
	});
	return responses;
}
