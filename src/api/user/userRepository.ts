import type { User } from "@/api/user/userModel";
import { prisma } from "@/common/utils/prismaClient";
import type { Prisma, RestaurantRole } from "@/generated/prisma/client";

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
	async userIsAdmin(userId: string): Promise<boolean> {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: { role: { select: { name: true } } },
		});
		return user?.role.name === "SUPER_ADMIN";
	}

	async userHasRestaurantRole(userId: string, restaurantId: string, roles: RestaurantRole[]): Promise<boolean> {
		const restaurantUser = await prisma.restaurantUser.findFirst({
			where: {
				userId,
				restaurantId,
				restaurantRole: { in: roles },
			},
		});

		return !!restaurantUser;
	}

	async userIsOwner(userId: string): Promise<boolean> {
		const restaurantUser = await prisma.restaurantUser.findFirst({
			where: {
				userId,
				restaurantRole: "OWNER",
			},
		});

		return !!restaurantUser;
	}

	async userOwnedRestaurantIds(userId: string): Promise<string[]> {
		const ownedRestaurants = await prisma.restaurantUser.findMany({
			where: {
				userId,
				restaurantRole: "OWNER",
			},
			select: { restaurantId: true },
		});

		return ownedRestaurants.map((restaurantUser) => restaurantUser.restaurantId);
	}

	async userIsOwnerOfRestaurant(userId: string, restaurantId: string): Promise<boolean> {
		return this.userHasRestaurantRole(userId, restaurantId, ["OWNER"]);
	}

	async userIsStaffOfRestaurant(userId: string, restaurantId: string): Promise<boolean> {
		return this.userHasRestaurantRole(userId, restaurantId, ["STAFF"]);
	}

	async userCanAccessRestaurant(userId: string, restaurantId: string): Promise<boolean> {
		if (await this.userIsAdmin(userId)) {
			return true;
		}

		return this.userHasRestaurantRole(userId, restaurantId, ["OWNER", "ADMIN", "STAFF"]);
	}

	async emailExists(email: string): Promise<boolean> {
		const user = await prisma.user.findFirst({
			where: { email },
		});
		return !!user;
	}

	async phoneExists(phone: string): Promise<boolean> {
		const user = await prisma.user.findFirst({
			where: { phone },
		});
		return !!user;
	}

	async findByEmailOrPhone(email: string, phone?: string): Promise<User | null> {
		const user = await prisma.user.findFirst({
			where: {
				OR: [{ email }, ...(phone ? [{ phone }] : [])],
			},
			include: { role: { select: { name: true } } },
		});
		return user ? mapPrismaUserToUser(user) : null;
	}

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

	async createCustomer(data: {
		email: string;
		fullName: string;
		phone: string;
		passwordHash: string;
	}): Promise<User | null> {
		// Get or create CUSTOMER role
		const customerRole = await prisma.role.upsert({
			where: { name: "CUSTOMER" },
			update: {},
			create: { name: "CUSTOMER", description: "Customer role" },
		});

		const newUser = await prisma.user.create({
			data: {
				email: data.email,
				fullName: data.fullName,
				phone: data.phone,
				passwordHash: data.passwordHash,
				roleId: customerRole.id,
			},
			include: { role: { select: { name: true } } },
		});

		return mapPrismaUserToUser(newUser);
	}
}
