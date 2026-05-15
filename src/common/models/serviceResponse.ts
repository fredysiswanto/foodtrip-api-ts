import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import type { PaginationMeta } from "../utils/paginationHelper";

export class ServiceResponse<T = null> {
	readonly success: boolean;
	readonly message: string;
	readonly data: T;
	meta?: PaginationMeta;
	readonly statusCode: number;

	private constructor(success: boolean, message: string, responseObject: T, statusCode: number) {
		this.success = success;
		this.message = message;
		this.data = responseObject;
		this.meta = undefined;
		this.statusCode = statusCode;
	}

	static success<T>(message: string, responseObject: T, statusCode: number = StatusCodes.OK) {
		return new ServiceResponse(true, message, responseObject, statusCode);
	}

	static failure<T>(message: string, responseObject: T, statusCode: number = StatusCodes.BAD_REQUEST) {
		return new ServiceResponse(false, message, responseObject, statusCode);
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
		message: z.string(),
		data: dataSchema.optional(),
		statusCode: z.number(),
	});
