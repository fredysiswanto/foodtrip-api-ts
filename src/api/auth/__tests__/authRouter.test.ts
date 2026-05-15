import { scryptSync } from "node:crypto";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { prisma } from "@/common/utils/prismaClient";
import { app } from "@/server";

const TEST_EMAIL = "auth-router-test@example.com";
const TEST_PASSWORD = "Password123!";
const TEST_FULL_NAME = "Auth Router Test";

const createPasswordHash = (password: string) => scryptSync(password, "some_random", 64).toString("hex");

describe("Auth API Endpoints", () => {
	beforeAll(async () => {
		await prisma.$connect();

		const role = await prisma.role.upsert({
			where: { name: "CUSTOMER" },
			update: {},
			create: { name: "CUSTOMER", description: "Customer role" },
		});

		await prisma.user.upsert({
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
	});

	afterAll(async () => {
		await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
		await prisma.$disconnect();
	});

	describe("POST /auth/login", () => {
		it("should return a JWT token for valid credentials", async () => {
			const response = await request(app).post("/auth/login").send({ email: TEST_EMAIL, password: TEST_PASSWORD });

			expect(response.statusCode).toEqual(StatusCodes.OK);
			expect(response.body.success).toBeTruthy();
			expect(response.body.data).toHaveProperty("accessToken");
			expect(response.body.data).toHaveProperty("tokenType", "Bearer");
			expect(response.body.data).toHaveProperty("expiresIn");
		});

		it("should reject invalid credentials", async () => {
			const response = await request(app).post("/auth/login").send({ email: TEST_EMAIL, password: "wrong-password" });

			expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
			expect(response.body.success).toBeFalsy();
			expect(response.body.message).toContain("Invalid email or password");
		});
	});

	describe("GET /auth/me", () => {
		it("should return authenticated user data when a valid token is provided", async () => {
			const loginResponse = await request(app).post("/auth/login").send({ email: TEST_EMAIL, password: TEST_PASSWORD });

			const token = loginResponse.body.data?.accessToken as string;

			const response = await request(app).get("/auth/me").set("Authorization", `Bearer ${token}`);

			expect(response.statusCode).toEqual(StatusCodes.OK);
			expect(response.body.success).toBeTruthy();
			expect(response.body.data).toMatchObject({
				email: TEST_EMAIL,
				fullName: TEST_FULL_NAME,
			});
		});

		it("should reject requests without a valid token", async () => {
			const response = await request(app).get("/auth/me");

			expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
			expect(response.body.success).toBeFalsy();
			expect(response.body.message).toContain("Authorization header missing or malformed");
		});
	});
});
