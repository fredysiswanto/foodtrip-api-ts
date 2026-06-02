import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/common/utils/prismaClient", () => ({
	prisma: {
		restaurantUser: {
			findFirst: vi.fn(),
			findMany: vi.fn(),
		},
		user: {
			findUnique: vi.fn(),
		},
	},
}));

import { UserRepository } from "@/api/user/userRepository";
import { prisma } from "@/common/utils/prismaClient";

const restaurantUserFindFirst = prisma.restaurantUser.findFirst as Mock;
const restaurantUserFindMany = prisma.restaurantUser.findMany as Mock;
const userFindUnique = prisma.user.findUnique as Mock;

describe("UserRepository restaurant access helpers", () => {
	let repository: UserRepository;

	beforeEach(() => {
		repository = new UserRepository();
		vi.clearAllMocks();
	});

	it("should detect owner membership", async () => {
		restaurantUserFindFirst.mockResolvedValue({ id: "ru-1" });

		const result = await repository.userIsOwner("user-1");

		expect(result).toBe(true);
		expect(restaurantUserFindFirst).toHaveBeenCalledWith({
			where: {
				userId: "user-1",
				restaurantRole: "OWNER",
			},
		});
	});

	it("should return owned restaurant ids", async () => {
		restaurantUserFindMany.mockResolvedValue([{ restaurantId: "rest-1" }, { restaurantId: "rest-2" }]);

		const result = await repository.userOwnedRestaurantIds("user-1");

		expect(result).toEqual(["rest-1", "rest-2"]);
		expect(restaurantUserFindMany).toHaveBeenCalledWith({
			where: {
				userId: "user-1",
				restaurantRole: "OWNER",
			},
			select: { restaurantId: true },
		});
	});

	it("should detect staff access for a restaurant", async () => {
		restaurantUserFindFirst.mockResolvedValue({ id: "ru-2" });

		const result = await repository.userIsStaffOfRestaurant("user-1", "rest-1");

		expect(result).toBe(true);
		expect(restaurantUserFindFirst).toHaveBeenCalledWith({
			where: {
				userId: "user-1",
				restaurantId: "rest-1",
				restaurantRole: { in: ["STAFF"] },
			},
		});
	});

	it("should allow access when user is super admin", async () => {
		userFindUnique.mockResolvedValue({ role: { name: "SUPER_ADMIN" } });

		const result = await repository.userCanAccessRestaurant("user-1", "rest-1");

		expect(result).toBe(true);
		expect(userFindUnique).toHaveBeenCalledWith({
			where: { id: "user-1" },
			include: { role: { select: { name: true } } },
		});
	});

	it("should allow access when user has a permitted restaurant role", async () => {
		userFindUnique.mockResolvedValue({ role: { name: "CUSTOMER" } });
		restaurantUserFindFirst.mockResolvedValue({ id: "ru-3" });

		const result = await repository.userCanAccessRestaurant("user-1", "rest-2");

		expect(result).toBe(true);
		expect(restaurantUserFindFirst).toHaveBeenCalledWith({
			where: {
				userId: "user-1",
				restaurantId: "rest-2",
				restaurantRole: { in: ["OWNER", "ADMIN", "STAFF"] },
			},
		});
	});
});
