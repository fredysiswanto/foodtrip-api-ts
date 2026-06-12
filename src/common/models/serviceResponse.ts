import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import type { PaginationMeta } from "../utils/paginationHelper";

export type ServiceResponseType<T = null> = {
	success: boolean;
	statusCode: number;
	message: string;
	data: T;
	meta?: PaginationMeta;
	error?: string;
};

// type response errors
export type ServiceResponseErrorType = {
	success: false;
	statusCode: number;
	message: string;
	data: null;
};

export class ServiceResponse<T = null> {
	readonly success: boolean;
	readonly message: string;
	readonly data: T;
	meta?: PaginationMeta;
	readonly statusCode: number;
	readonly error?: string;

	private constructor(success: boolean, message: string, responseObject: T, statusCode: number, error?: string) {
		this.success = success;
		this.message = message;
		this.data = responseObject;
		this.meta = undefined;
		this.error = error;
		this.statusCode = statusCode;
	}

	static success<T>(message: string, responseObject: T, statusCode: number = StatusCodes.OK) {
		return new ServiceResponse(true, message, responseObject, statusCode);
	}

	static failure<T>(message: string, responseObject: T, statusCode: number = StatusCodes.BAD_REQUEST, error?: string) {
		return new ServiceResponse(false, message, responseObject, statusCode, error);
	}

	static paginatedSuccess<T>(
		message: string,
		responseObject: T,
		meta: PaginationMeta,
		statusCode: number = StatusCodes.OK,
	) {
		const serviceResponse = new ServiceResponse(true, message, responseObject, statusCode);
		serviceResponse.meta = meta;
		return serviceResponse;
	}
	// static fromError<T = null>(
	// 	error: unknown,
	// 	defaultMessage = "Internal server error.",
	// 	defaultStatusCode = StatusCodes.INTERNAL_SERVER_ERROR,
	// ) {
	// 	if (error instanceof Error) {
	// 		const statusCode = (error as { statusCode?: number }).statusCode ?? defaultStatusCode;
	// 		return ServiceResponse.failure<T>(error.message || defaultMessage, null as unknown as T, statusCode);
	// 	}

	// 	return ServiceResponse.failure<T>(defaultMessage, null as unknown as T, defaultStatusCode);
	// }
}

export const ServiceResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
	z.object({
		success: z.boolean(),
		statusCode: z.number(),
		message: z.string(),
		data: dataSchema.optional(),
		meta: z
			.object({
				page: z.number(),
				limit: z.number(),
				totalItems: z.number(),
				totalPages: z.number(),
				previousPage: z.number().nullable(),
				nextPage: z.number().nullable(),
			})
			.optional(),
		error: z.string().optional(),
	});

export const ServicesResponseErrorSchema = z.object({
	success: z.literal(false),
	statusCode: z.number(),
	message: z.string(),
	data: z.null(),
});
