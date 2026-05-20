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
	async create(data: Prisma.UploadUncheckedCreateInput): Promise<Upload> {
		return prisma.upload.create({
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

	async findAll(queryParams: GetUploadsQuery): Promise<{ data: Upload[]; meta: PaginationMeta }> {
		const { page, limit, skip } = getPagination(queryParams);
		const where = buildSearch(queryParams.search, ["name"]);
		const orderBy = buildOrderBy(queryParams.sortBy, queryParams.sortOrder, ["name", "createdAt"]);
		const [uploads, totalItems] = await Promise.all([
			prisma.upload.findMany({
				where,
				skip,
				take: limit,
				orderBy,
			}),
			prisma.upload.count(),
		]);

		return createPaginationResponse(uploads, totalItems, page, limit);
	}

	async delete(id: string): Promise<Upload> {
		const data = await prisma.upload.delete({
			where: {
				id,
			},
		});
		console.log(data, "in repository");

		return data;
	}
}
