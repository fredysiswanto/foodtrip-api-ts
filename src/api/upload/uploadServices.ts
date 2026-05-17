import { LocalStorageService } from "@/common/utils/localStorageHandel";
import type { UploadType } from "@/generated/prisma/client";
import { UploadRepository } from "./uploadRepository";

export class UploadService {
	private readonly uploadRepository = new UploadRepository();

	private readonly storageProvider = new LocalStorageService();

	async createUpload(file: Express.Multer.File, uploadedById: string, type: UploadType) {
		return this.uploadRepository.create({
			originalName: file.originalname,
			filename: file.filename,
			mimeType: file.mimetype,
			type,
			folder: "uploads",
			path: file.path,
			size: file.size,
			uploadedById,
		});
	}

	async getUploadById(id: string) {
		const upload = await this.uploadRepository.findById(id);

		if (!upload) {
			throw new Error("Upload not found");
		}

		return upload;
	}

	async getAllUploads() {
		return this.uploadRepository.findAll();
	}

	async deleteUpload(id: string, currentUserId?: string | null) {
		const upload = await this.uploadRepository.findById(id);

		if (!upload) {
			throw new Error("Upload not found");
		}

		if (upload.uploadedById !== currentUserId) {
			throw new Error("Forbidden");
		}

		await this.storageProvider.deleteFile(upload.path);

		return this.uploadRepository.delete(id);
	}
}
