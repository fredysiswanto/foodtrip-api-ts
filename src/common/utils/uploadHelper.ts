import crypto from "crypto";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
	destination: (_, __, cb) => {
		cb(null, "uploads");
	},

	filename: (_, file, cb) => {
		const extension = path.extname(file.originalname);

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

		if (!allowedMimeTypes.includes(file.mimetype)) {
			cb(new Error("Invalid file type"));

			return;
		}

		cb(null, true);
	},
});
