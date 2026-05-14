import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "@/common/utils/prismaClient";

describe("Prisma Client Integration", () => {
	beforeAll(async () => {
		await prisma.$connect();
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	it("should reuse the same global Prisma client instance in development", () => {
		const globalPrisma = (globalThis as unknown as { prisma?: typeof prisma }).prisma;
		expect(globalPrisma).toBe(prisma);
	});

	it("should return seeded user records from the database", async () => {
		const users = await prisma.user.findMany({ take: 5 });

		expect(users.length).toBeGreaterThan(0);
		expect(users[0]).toMatchObject({
			id: expect.any(Number),
			email: expect.any(String),
			name: expect.any(String),
			age: expect.any(Number),
		});
	});

	it("should find the seeded Alice user by email", async () => {
		const alice = await prisma.user.findUnique({ where: { email: "alice@example.com" } });

		expect(alice).not.toBeNull();
		expect(alice?.email).toBe("alice@example.com");
		expect(alice?.name).toBe("Alice");
	});
});
