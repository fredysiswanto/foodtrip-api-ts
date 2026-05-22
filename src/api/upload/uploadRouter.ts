import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { uploadController } from "@/api/upload/uploadController";
import { UploadSchema } from "@/api/upload/uploadModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { adminAuthMiddleware } from "@/common/middleware/adminAuthMiddleware";
import { commonValidations } from "@/common/utils/commonValidation";
import { validateRequest } from "@/common/utils/httpHandlers";
import { uploadMiddleware } from "@/common/utils/uploadHelper";

export const uploadRegistry = new OpenAPIRegistry();
export const uploadRouter: Router = express.Router();

uploadRegistry.register("Upload", UploadSchema);

// POST /uploads - Upload new file (Admin only)
uploadRegistry.registerPath({
	method: "post",
	path: "/api/uploads",
	tags: ["Upload"],
	request: {
		body: {
			description: "File upload with metadata",
			content: {
				"multipart/form-data": {
					schema: z.object({
						file: z.instanceof(File),
						type: z.string(),
					}),
				},
			},
		},
	},
	responses: createApiResponse(UploadSchema, "File uploaded successfully"),
});

uploadRouter.post("/", adminAuthMiddleware, uploadMiddleware.single("file"), uploadController.create);

// GET /uploads - Get all uploads
uploadRegistry.registerPath({
	method: "get",
	path: "/api/uploads",
	tags: ["Upload"],
	responses: createApiResponse(z.array(UploadSchema), "Uploads retrieved successfully"),
});

uploadRouter.get("/", uploadController.getUploads);

// GET /uploads/:id - Get upload by ID
uploadRegistry.registerPath({
	method: "get",
	path: "/api/uploads/{id}",
	tags: ["Upload"],
	request: { params: z.object({ id: commonValidations.id }) },
	responses: createApiResponse(UploadSchema, "Upload retrieved successfully"),
});

uploadRouter.get(
	"/:id",
	validateRequest(z.object({ params: z.object({ id: commonValidations.id }) })),
	uploadController.getUploadById,
);

// DELETE /uploads/:id - Delete upload (Admin only)
uploadRegistry.registerPath({
	method: "delete",
	path: "/api/uploads/{id}",
	tags: ["Upload"],
	request: { params: z.object({ id: commonValidations.id }) },
	responses: createApiResponse(z.null(), "Upload deleted successfully"),
});

uploadRouter.delete(
	"/:id",
	adminAuthMiddleware,
	validateRequest(z.object({ params: z.object({ id: commonValidations.id }) })),
	uploadController.deleteUpload,
);
