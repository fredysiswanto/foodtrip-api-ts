import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import multer from "multer";

const uploadDirectory = path.resolve(process.cwd(), "public", "uploads");

const ensureUploadDirectory = async (directory: string) => {
	await fs.mkdir(directory, { recursive: true });
};

const storage = multer.diskStorage({
	destination: async (_, __, cb) => {
		try {
			await ensureUploadDirectory(uploadDirectory);
			cb(null, uploadDirectory);
		} catch (error) {
			cb(error as Error, "");
		}
	},

	filename: (_, file, cb) => {
		const extension = path.extname(file.originalname).toLowerCase();
		const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;

		cb(null, filename);
	},
});

export const uploadMiddleware = multer({
	storage,

	limits: {
		fileSize: 5 * 1024 * 1024,
	},

	fileFilter: (_, file, cb) => {
		const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
		const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
		const fileExtension = path.extname(file.originalname).toLowerCase();

		if (!allowedMimeTypes.includes(file.mimetype) || !allowedExtensions.includes(fileExtension)) {
			cb(new Error("Invalid file type"));
			return;
		}

		cb(null, true);
	},
});

export { uploadDirectory };
