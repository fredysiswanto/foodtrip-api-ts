import type { Request, RequestHandler, Response } from "express";
import { validateData } from "@/common/utils/commonValidation";
import type { UploadType } from "@/generated/prisma/client";
import type { JwtPayload } from "../auth/authService";
import { UploadRequestBodySchema } from "./uploadModel";
import { type GetUploadsQuery, UploadService } from "./uploadServices";

class UploadController {
	private readonly uploadService = new UploadService();

	public getUploads: RequestHandler = async (req: Request, res: Response) => {
		const query = req.query as GetUploadsQuery;
		const serviceResponse = await this.uploadService.findAll(query);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public create = async (req: Request, res: Response) => {
		if (!req.file) {
			return res.status(400).json({
				success: false,
				message: "File is required",
			});
		}

		const createdById = (req as Request & { user?: JwtPayload }).user?.userId;
		if (!createdById) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
		}

		try {
			validateData(UploadRequestBodySchema.pick({ type: true }), {
				type: req.body.type,
			});

			const serviceResponse = await this.uploadService.createUpload(req.file, createdById, req.body.type as UploadType);

			return res.status(serviceResponse.statusCode).send(serviceResponse);
		} catch (error) {
			if (error instanceof Error) {
				return res.status(400).json({
					success: false,
					message: JSON.parse(error.message)[0].message || "Invalid request data",
				});
			}

			return res.status(500).json({
				success: false,
				message: "Internal server error",
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
