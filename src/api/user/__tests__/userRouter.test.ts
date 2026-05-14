import { scryptSync } from "node:crypto";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

import type { User } from "@/api/user/userModel";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import { prisma } from "@/common/utils/prismaClient";
import { app } from "@/server";

const TEST_EMAIL = "user-router-test@example.com";
const TEST_PASSWORD = "Password123!";
const TEST_FULL_NAME = "User Router Test";

const createPasswordHash = (password: string) => scryptSync(password, "some_random", 64).toString("hex");

const loginAsTestUser = async () => {
	const response = await request(app).post("/auth/login").send({ email: TEST_EMAIL, password: TEST_PASSWORD });

	return response.body.responseObject?.accessToken as string;
};

describe("User API Endpoints", () => {
	let testUserId: string;

	beforeAll(async () => {
		await prisma.$connect();

		const role = await prisma.role.upsert({
			where: { name: "CUSTOMER" },
			update: {},
			create: { name: "CUSTOMER", description: "Customer role" },
		});

		const user = await prisma.user.upsert({
			where: { email: TEST_EMAIL },
			update: {
				fullName: TEST_FULL_NAME,
				passwordHash: createPasswordHash(TEST_PASSWORD),
				roleId: role.id,
				isActive: true,
				updatedAt: new Date(),
			},
			create: {
				fullName: TEST_FULL_NAME,
				email: TEST_EMAIL,
				passwordHash: createPasswordHash(TEST_PASSWORD),
				roleId: role.id,
				isActive: true,
			},
		});

		testUserId = user.id;
	});

	afterAll(async () => {
		await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
		await prisma.$disconnect();
	});

	describe("GET /users", () => {
		it("should return a list of users", async () => {
			const token = await loginAsTestUser();

			const response = await request(app).get("/users").set("Authorization", `Bearer ${token}`);
			const responseBody: ServiceResponse<User[]> = response.body;

			expect(response.statusCode).toEqual(StatusCodes.OK);
			expect(responseBody.success).toBeTruthy();
			expect(responseBody.message).toContain("Users found");
			expect(responseBody.responseObject.length).toBeGreaterThan(0);
			expect(responseBody.responseObject[0]).toMatchObject({
				id: expect.any(String),
				email: expect.any(String),
				fullName: expect.any(String),
				isActive: expect.any(Boolean),
				roleName: expect.any(String),
			});
		});
	});

	describe("GET /users/:id", () => {
		it("should return a user for a valid ID", async () => {
			const token = await loginAsTestUser();

			const response = await request(app).get(`/users/${testUserId}`).set("Authorization", `Bearer ${token}`);
			const responseBody: ServiceResponse<User> = response.body;

			expect(response.statusCode).toEqual(StatusCodes.OK);
			expect(responseBody.success).toBeTruthy();
			expect(responseBody.message).toContain("User found");
			expect(responseBody.responseObject).toMatchObject({
				id: testUserId,
				email: TEST_EMAIL,
				fullName: TEST_FULL_NAME,
			});
		});

		it("should return a not found error for non-existent ID", async () => {
			const token = await loginAsTestUser();
			const testId = "00000000-0000-0000-0000-000000000000";

			const response = await request(app).get(`/users/${testId}`).set("Authorization", `Bearer ${token}`);
			const responseBody: ServiceResponse = response.body;

			expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
			expect(responseBody.success).toBeFalsy();
			expect(responseBody.message).toContain("User not found");
			expect(responseBody.responseObject).toBeNull();
		});

		it("should return a bad request for invalid ID format", async () => {
			const token = await loginAsTestUser();
			const invalidInput = "abc";

			const response = await request(app).get(`/users/${invalidInput}`).set("Authorization", `Bearer ${token}`);
			const responseBody: ServiceResponse = response.body;

			expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
			expect(responseBody.success).toBeFalsy();
			expect(responseBody.message).toContain("Invalid input");
			expect(responseBody.responseObject).toBeNull();
		});
	});
});
