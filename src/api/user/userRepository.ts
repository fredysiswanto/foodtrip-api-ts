import type { User } from "@/api/user/userModel";
import { prisma } from "@/common/utils/prismaClient";
import type { Prisma } from "@/generated/prisma/client";

type PrismaUser = Prisma.UserModel;

const mapPrismaUserToUser = (user: PrismaUser & { role: { name: string } }): User => ({
	id: user.id,
	roleId: user.roleId,
	roleName: user.role.name,
	fullName: user.fullName,
	email: user.email,
	phone: user.phone,
	isActive: user.isActive,
	lastLoginAt: user.lastLoginAt ?? null,
	createdAt: user.createdAt,
	updatedAt: user.updatedAt,
	deletedAt: user.deletedAt ?? null,
});

export class UserRepository {
	async findAllAsync(): Promise<User[]> {
		const users = await prisma.user.findMany({
			orderBy: { createdAt: "asc" },
			include: { role: { select: { name: true } } },
		});

		return users.map(mapPrismaUserToUser);
	}

	async findByIdAsync(id: string): Promise<User | null> {
		const user = await prisma.user.findUnique({
			where: { id },
			include: { role: { select: { name: true } } },
		});

		return user ? mapPrismaUserToUser(user) : null;
	}
}
