import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AuthRepository } from "@/api/auth/authRepository";
import { UserRepository } from "@/api/user/userRepository";
import { prisma } from "@/common/utils/prismaClient";

const authRepository = new AuthRepository();
const userRepository = new UserRepository();

describe("Prisma repository integration", () => {
	beforeAll(async () => {
		await prisma.$connect();
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	it("should find a seeded user by email via AuthRepository", async () => {
		const authRecord = await authRepository.findByEmail("alice@example.com");

		expect(authRecord).not.toBeNull();
		expect(authRecord?.email).toBe("alice@example.com");
		expect(authRecord?.id).toBeGreaterThan(0);
		expect(authRepository.verifyPassword(authRecord as typeof authRecord, "Password123!")).toBe(true);
	});

	it("should return null for a missing email via AuthRepository", async () => {
		const authRecord = await authRepository.findByEmail("missing@example.com");

		expect(authRecord).toBeNull();
	});

	it("should load seeded users via UserRepository", async () => {
		const users = await userRepository.findAllAsync();

		expect(users.length).toBeGreaterThan(0);
		expect(users.some((user) => user.email === "alice@example.com")).toBe(true);
		expect(users.some((user) => user.email === "robert@example.com")).toBe(true);
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
