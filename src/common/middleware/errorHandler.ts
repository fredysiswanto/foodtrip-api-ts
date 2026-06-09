import type { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";

import { ServiceResponse } from "@/common/models/serviceResponse";

const notFoundHandler: RequestHandler = (_req: Request, res: Response) => {
	const serviceResponse = ServiceResponse.failure("API not found.", null, StatusCodes.NOT_FOUND);
	res.status(serviceResponse.statusCode).json(serviceResponse);
};

const captureErrorForLogging: ErrorRequestHandler = (err, _req: Request, res: Response, next: NextFunction) => {
	res.locals.err = err;
	next(err);
};

const genericErrorHandler: ErrorRequestHandler = (err, _req: Request, res: Response, _next: NextFunction) => {
	if (err instanceof ZodError) {
		const serviceResponse = ServiceResponse.failure(
			"Validation failed.",
			{ issues: err.issues },
			StatusCodes.BAD_REQUEST,
		);
		return res.status(serviceResponse.statusCode).json(serviceResponse);
	}

	const statusCode = err?.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR;
	const message = err?.message ?? "Internal server error.";
	const serviceResponse = ServiceResponse.failure(message, null, statusCode);
	res.status(serviceResponse.statusCode).json(serviceResponse);
};

export default (): [RequestHandler, ErrorRequestHandler, ErrorRequestHandler] => [
	notFoundHandler,
	captureErrorForLogging,
	genericErrorHandler,
];
