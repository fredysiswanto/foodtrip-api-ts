import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { LocalStorageService } from "@/common/utils/localStorageHandel";
import type { Prisma, UploadType } from "@/generated/prisma/client";
import { UploadRepository } from "./uploadRepository";

type Upload = Prisma.UploadModel;
export interface GetUploadsQuery {
	page?: string;
	limit?: string;
	search?: string;
	sortBy?: "filename" | "createdAt";
	sortOrder?: "asc" | "desc";
}

export const serializeBigInt = <T>(data: T): T => {
	return JSON.parse(JSON.stringify(data, (_, value) => (typeof value === "bigint" ? value.toString() : value)));
};
export class UploadService {
	private readonly uploadRepository = new UploadRepository();

	private readonly storageProvider = new LocalStorageService();

	async findAll(query: GetUploadsQuery): Promise<ServiceResponse<Upload[] | null>> {
		try {
			const { data, meta } = await this.uploadRepository.findAll(query);
			const serializedData = serializeBigInt(data);
			if (serializedData.length === 0) {
				return ServiceResponse.failure("No uploads found.", []);
			}
			return ServiceResponse.paginatedSuccess("Upload files found.", serializedData, meta);
		} catch (error) {
			return ServiceResponse.failure(
				`Unable to retrieve uploads. ${error instanceof Error ? error.message : "Unknown error"}`,
				null,
				StatusCodes.NOT_FOUND,
			);
		}
	}

	async createUpload(file: Express.Multer.File, uploadedById: string, type: UploadType) {
		const data = await this.uploadRepository.create({
			originalName: file.originalname,
			filename: file.filename,
			mimeType: file.mimetype,
			type,
			folder: "uploads",
			path: file.path,
			size: file.size,
			uploadedById,
		});
		if (!data) {
			return ServiceResponse.failure("Failed to create upload.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
		return ServiceResponse.success("Upload created successfully.", serializeBigInt(data));
	}

	async getUploadById(id: string) {
		const data = await this.uploadRepository.findById(id);
		const serializedData = serializeBigInt(data);
		if (!serializedData) {
			return ServiceResponse.failure("Upload id not found.", []);
		}

		return ServiceResponse.success("Upload found.", serializedData);
	}

	async deleteUpload(id: string, currentUserId: string) {
		const dataFound = await this.uploadRepository.findById(id);

		if (!dataFound) {
			return ServiceResponse.failure("Upload not found.", null, StatusCodes.NOT_FOUND);
		}

		if (dataFound.uploadedById !== currentUserId) {
			return ServiceResponse.failure("Forbidden. You can only delete your own uploads.", null, StatusCodes.FORBIDDEN);
		}

		await this.storageProvider.deleteFile(dataFound.path);
		const deletedUpload = await this.uploadRepository.delete(id);
		const data = serializeBigInt(deletedUpload);
		if (!deletedUpload) {
			return ServiceResponse.failure("Failed to delete upload.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}

		return ServiceResponse.success("successfully deleted.", { id: data.id });
	}
}
