import type { Request, RequestHandler, Response } from "express";
import { validateData } from "@/common/utils/commonValidation";
import type { UploadType } from "@/generated/prisma/client";
import type { JwtPayload } from "../auth/authService";
import { type Upload, UploadRequestBodySchema } from "./uploadModel";
import { type GetUploadsQuery, UploadService } from "./uploadServices";

class UploadController {
	private readonly uploadService = new UploadService();

	public getUploads: RequestHandler = async (req: Request, res: Response) => {
		const query = req.query as GetUploadsQuery;
		const serviceResponse = await this.uploadService.findAll(query);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public create = async (req: Request, res: Response) => {
		const data = req.body as Upload;
		const isValid = validateData(UploadRequestBodySchema, data);

		if (!isValid) {
			return res.status(400).json({
				success: false,
				message: "Oh No!. Invalid input data!.",
				data: null,
			});
		}
		try {
			const createdById = (req as Request & { user?: JwtPayload }).user?.userId;
			if (!req.file) {
				return res.status(400).json({
					success: false,
					message: "File is required",
				});
			}

			if (!createdById) {
				return res.status(401).json({
					success: false,
					message: "Unauthorized",
				});
			}
			const serviceResponse = await this.uploadService.createUpload(req.file, createdById, req.body.type as UploadType);
			res.status(serviceResponse.statusCode).send(serviceResponse);
		} catch (error) {
			return res.status(500).json({
				success: false,
				message: error instanceof Error ? error.message : "Internal server error",
			});
		}
	};

	public getUploadById: RequestHandler = async (req: Request, res: Response) => {
		const { id } = req.params;
		const serviceResponse = await this.uploadService.getUploadById(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public deleteUpload = async (req: Request, res: Response) => {
		const { id } = req.params;
		const createdById = (req as Request & { user?: JwtPayload }).user?.userId;
		if (!createdById) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
		}
		const serviceResponse = await this.uploadService.deleteUpload(id, createdById);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const uploadController = new UploadController();
