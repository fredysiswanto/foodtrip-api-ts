import type { ErrorRequestHandler, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";

const unexpectedRequest: RequestHandler = (_req, res) => {
  const serviceResponse = ServiceResponse.failure(
    "Api not found.",
    null,
    StatusCodes.NOT_FOUND,
  );
  res.status(serviceResponse.statusCode).json(serviceResponse);
};

const addErrorToRequestLog: ErrorRequestHandler = (err, _req, res, next) => {
  res.locals.err = err;
  next(err);
};

export default (): [RequestHandler, ErrorRequestHandler] => [
  unexpectedRequest,
  addErrorToRequestLog,
];
