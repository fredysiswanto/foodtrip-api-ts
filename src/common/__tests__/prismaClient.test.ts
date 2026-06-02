import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "@/common/utils/prismaClient";

const TEST_EMAIL = "prisma-client-test@example.com";
const TEST_FULL_NAME = "Prisma Client Test";
// if value is development, we should run test if false we should skip test
const isDevelopment: boolean = process.env.NODE_ENV === "development";

const ensureTestRole = async () => {
	return prisma.role.upsert({
		where: { name: "CUSTOMER" },
		update: {},
		create: {
			name: "CUSTOMER",
			description: "Test customer role",
		},
	});
};

describe.skipIf(isDevelopment)("Prisma Client Integration", () => {
	beforeAll(async () => {
		await prisma.$connect();

		const role = await ensureTestRole();
		await prisma.user.upsert({
			where: { email: TEST_EMAIL },
			update: {
				fullName: TEST_FULL_NAME,
				passwordHash: "test-hash",
				roleId: role.id,
				isActive: true,
				updatedAt: new Date(),
			},
			create: {
				fullName: TEST_FULL_NAME,
				email: TEST_EMAIL,
				passwordHash: "test-hash",
				roleId: role.id,
				isActive: true,
			},
		});
	});

	afterAll(async () => {
		await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
		await prisma.$disconnect();
	});

	it("should reuse the same global Prisma client instance in development", () => {
		const globalPrisma = (globalThis as unknown as { prisma?: typeof prisma }).prisma;
		expect(globalPrisma).toBe(prisma);
	});

	it("should return user records from the database", async () => {
		const users = await prisma.user.findMany({ take: 5 });

		expect(users.length).toBeGreaterThan(0);
		expect(users[0]).toMatchObject({
			id: expect.any(String),
			email: expect.any(String),
			fullName: expect.any(String),
			isActive: expect.any(Boolean),
		});
	});

	it("should find the test user by email", async () => {
		const user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });

		expect(user).not.toBeNull();
		expect(user?.email).toBe(TEST_EMAIL);
		expect(user?.fullName).toBe(TEST_FULL_NAME);
	});
});
