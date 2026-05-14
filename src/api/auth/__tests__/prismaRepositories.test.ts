import { scryptSync } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AuthRepository } from "@/api/auth/authRepository";
import { UserRepository } from "@/api/user/userRepository";
import { prisma } from "@/common/utils/prismaClient";

const authRepository = new AuthRepository();
const userRepository = new UserRepository();
const PASSWORD_SALT = "some_random";
const TEST_PASSWORD = "Password123!";
const TEST_USERS = [
	{ email: "alice-test@example.com", fullName: "Alice Test" },
	{ email: "robert-test@example.com", fullName: "Robert Test" },
];

const createPasswordHash = (password: string) => scryptSync(password, PASSWORD_SALT, 64).toString("hex");

describe("Prisma repository integration", () => {
	beforeAll(async () => {
		await prisma.$connect();

		const role = await prisma.role.upsert({
			where: { name: "CUSTOMER" },
			update: {},
			create: { name: "CUSTOMER", description: "Test customer role" },
		});

		for (const user of TEST_USERS) {
			await prisma.user.upsert({
				where: { email: user.email },
				update: {
					fullName: user.fullName,
					passwordHash: createPasswordHash(TEST_PASSWORD),
					roleId: role.id,
					isActive: true,
					updatedAt: new Date(),
				},
				create: {
					email: user.email,
					fullName: user.fullName,
					passwordHash: createPasswordHash(TEST_PASSWORD),
					roleId: role.id,
					isActive: true,
				},
			});
		}
	});

	afterAll(async () => {
		await prisma.user.deleteMany({
			where: { email: { in: TEST_USERS.map((user) => user.email) } },
		});
		await prisma.$disconnect();
	});

	it("should find a seeded user by email via AuthRepository", async () => {
		const authRecord = await authRepository.findByEmail(TEST_USERS[0].email);

		expect(authRecord).not.toBeNull();
		if (!authRecord) {
			return;
		}

		expect(authRecord.email).toBe(TEST_USERS[0].email);
		expect(authRecord.id).toEqual(expect.any(String));
		expect(authRepository.verifyPassword(authRecord, TEST_PASSWORD)).toBe(true);
	});

	it("should return null for a missing email via AuthRepository", async () => {
		const authRecord = await authRepository.findByEmail("missing@example.com");

		expect(authRecord).toBeNull();
	});

	it("should load seeded users via UserRepository", async () => {
		const users = await userRepository.findAllAsync();

		expect(users.length).toBeGreaterThan(0);
		expect(users.some((user) => user.email === TEST_USERS[0].email)).toBe(true);
		expect(users.some((user) => user.email === TEST_USERS[1].email)).toBe(true);
	});

	it("should find seeded user by ID via UserRepository", async () => {
		const users = await userRepository.findAllAsync();
		const firstUser = users[0];
		const user = await userRepository.findByIdAsync(firstUser.id);

		expect(user).not.toBeNull();
		expect(user?.id).toBe(firstUser.id);
		expect(user?.email).toBe(firstUser.email);
	});
});
