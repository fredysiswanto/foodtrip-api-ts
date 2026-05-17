import { prisma } from "@/common/utils/prismaClient";
import type { Prisma, Upload } from "@/generated/prisma/client";

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

	async findAll(): Promise<Upload[]> {
		return prisma.upload.findMany({
			orderBy: {
				createdAt: "desc",
			},
		});
	}

	async delete(id: string): Promise<Upload> {
		return prisma.upload.delete({
			where: {
				id,
			},
		});
	}
}
