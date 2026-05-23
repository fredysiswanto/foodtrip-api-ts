import {
	buildOrderBy,
	buildSearch,
	createPaginationResponse,
	getPagination,
	type PaginationMeta,
} from "@/common/utils/paginationHelper";
import { prisma } from "@/common/utils/prismaClient";
import type { Prisma, Upload } from "@/generated/prisma/client";
import type { GetUploadsQuery } from "./uploadServices";

export class UploadRepository {
	async create(data: Prisma.UploadUncheckedCreateInput): Promise<Pick<Upload, "id" | "filename">> {
		return await prisma.upload.create({
			select: {
				id: true,
				filename: true,
			},
			data,
		});
	}

	async findById(id: string): Promise<Upload | null> {
		return prisma.upload.findUnique({
			where: {
				id,
			},
		});
	}

	async findAll(
		queryParams: GetUploadsQuery,
	): Promise<{ data: Pick<Upload, "id" | "filename" | "type" | "createdAt" | "size">[]; meta: PaginationMeta }> {
		const { page, limit, skip } = getPagination(queryParams);
		const where = buildSearch(queryParams.search, ["filename"]);
		const orderBy = buildOrderBy(queryParams.sortBy, queryParams.sortOrder, ["createdAt"]);
		const [uploads, totalItems] = await Promise.all([
			prisma.upload.findMany({
				select: {
					id: true,
					filename: true,
					type: true,
					createdAt: true,
					size: true,
				},
				where,
				skip,
				take: limit,
				orderBy,
			}),
			prisma.upload.count({ where }),
		]);

		return createPaginationResponse(uploads, totalItems, page, limit);
	}

	async delete(id: string): Promise<Upload> {
		return await prisma.upload.delete({
			where: {
				id,
			},
		});
	}
}
