import type { User as PrismaUser } from "@prisma/client";
import type { User } from "@/api/user/userModel";
import { prisma } from "@/common/utils/prismaClient";

const mapPrismaUserToUser = (user: PrismaUser): User => ({
	id: user.id,
	name: user.name,
	email: user.email,
	age: user.age,
	createdAt: user.createdAt,
	updatedAt: user.updatedAt,
});

export class UserRepository {
	async findAllAsync(): Promise<User[]> {
		const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
		return users.map(mapPrismaUserToUser);
	}

	async findByIdAsync(id: number): Promise<User | null> {
		const user = await prisma.user.findUnique({ where: { id } });
		return user ? mapPrismaUserToUser(user) : null;
	}
}
