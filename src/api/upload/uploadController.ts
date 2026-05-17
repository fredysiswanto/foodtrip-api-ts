import type { Request, Response } from "express";
import { validateData } from "@/common/utils/commonValidation";
import type { UploadType } from "@/generated/prisma/client";
import type { JwtPayload } from "../auth/authService";
import { type Upload, UploadRequestBodySchema } from "./uploadModel";
import { UploadService } from "./uploadServices";

export const serializeBigInt = <T>(data: T): T => {
	return JSON.parse(JSON.stringify(data, (_, value) => (typeof value === "bigint" ? value.toString() : value)));
};
class UploadController {
	private readonly uploadService = new UploadService();

	create = async (req: Request, res: Response): Promise<Response> => {
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
			const upload = await this.uploadService.createUpload(req.file, createdById, req.body.type as UploadType);

			return res.status(201).json({
				success: true,
				data: serializeBigInt(upload),
			});
		} catch (error) {
			return res.status(500).json({
				success: false,
				message: error instanceof Error ? error.message : "Internal server error",
			});
		}
	};

	findAll = async (_: Request, res: Response): Promise<Response> => {
		try {
			const uploads = await this.uploadService.getAllUploads();

			return res.status(200).json({
				success: true,
				data: serializeBigInt(uploads),
			});
		} catch {
			return res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	};

	findById = async (req: Request, res: Response): Promise<Response> => {
		try {
			const upload = await this.uploadService.getUploadById(req.params.id);

			return res.status(200).json({
				success: true,
				data: serializeBigInt(upload),
			});
		} catch (error) {
			return res.status(404).json({
				success: false,
				message: error instanceof Error ? error.message : "Upload not found",
			});
		}
	};

	delete = async (req: Request, res: Response): Promise<Response> => {
		try {
			// if (!req.user) {
			// 	return res.status(401).json({
			// 		success: false,
			// 		message: "Unauthorized",
			// 	});
			// }

			await this.uploadService.deleteUpload(req.params.id);

			return res.status(200).json({
				success: true,
				message: "Upload deleted successfully",
			});
		} catch (error) {
			return res.status(400).json({
				success: false,
				message: error instanceof Error ? error.message : "Internal server error",
			});
		}
	};
}

export const uploadController = new UploadController();
