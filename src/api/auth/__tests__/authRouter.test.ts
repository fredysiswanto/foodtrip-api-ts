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
		await prisma.user.deleteMany({ where: { email: "new-user@example.com" } });
		await prisma.user.deleteMany({ where: { email: "duplicate@example.com" } });
		await prisma.$disconnect();
	});

	describe("POST /auth/login", () => {
		it("should return a JWT token for valid credentials", async () => {
			const response = await request(app).post("/api/auth/login").send({ email: TEST_EMAIL, password: TEST_PASSWORD });

			expect(response.statusCode).toEqual(StatusCodes.OK);
			expect(response.body.success).toBeTruthy();
			expect(response.body.data).toHaveProperty("accessToken");
			expect(response.body.data).toHaveProperty("tokenType", "Bearer");
			expect(response.body.data).toHaveProperty("expiresIn");
		});

		it("should reject invalid credentials", async () => {
			const response = await request(app)
				.post("/api/auth/login")
				.send({ email: TEST_EMAIL, password: "wrong-password" });

			expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
			expect(response.body.success).toBeFalsy();
			expect(response.body.message).toContain("Invalid email or password");
		});
	});

	describe("POST /auth/register", () => {
		it("should register a new user successfully", async () => {
			const response = await request(app).post("/api/auth/register").send({
				email: "new-user@example.com",
				password: "Password123!",
				fullName: "New User",
				phone: "1234567890",
			});

			expect(response.statusCode).toEqual(StatusCodes.CREATED);
			expect(response.body.success).toBeTruthy();
			expect(response.body.data).toHaveProperty("email", "new-user@example.com");
			expect(response.body.data).toHaveProperty("fullName", "New User");
			expect(response.body.data).toHaveProperty("phone", "1234567890");
			expect(response.body.data).not.toHaveProperty("passwordHash");
		});

		it("should reject registration with invalid email", async () => {
			const response = await request(app).post("/api/auth/register").send({
				email: "invalid-email",
				password: "Password123!",
				fullName: "Test User",
				phone: "1234567890",
			});

			expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
			expect(response.body.success).toBeFalsy();
			expect(response.body.message).toContain("Invalid input");
		});

		it("should reject registration with short password", async () => {
			const response = await request(app).post("/api/auth/register").send({
				email: "user@example.com",
				password: "short",
				fullName: "Test User",
				phone: "1234567890",
			});

			expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
			expect(response.body.success).toBeFalsy();
		});

		it("should reject registration with duplicate email", async () => {
			// Create initial user
			await request(app).post("/api/auth/register").send({
				email: "duplicate@example.com",
				password: "Password123!",
				fullName: "First User",
				phone: "1111111111",
			});

			// Try to create another with same email
			const response = await request(app).post("/api/auth/register").send({
				email: "duplicate@example.com",
				password: "Password123!",
				fullName: "Second User",
				phone: "2222222222",
			});

			expect(response.statusCode).toEqual(StatusCodes.CONFLICT);
			expect(response.body.success).toBeFalsy();
			expect(response.body.message).toContain("email already exists");
		});

		it("should reject registration with duplicate phone", async () => {
			const phone = "9876543210";

			// Create initial user
			await request(app).post("/api/auth/register").send({
				email: "user1@example.com",
				password: "Password123!",
				fullName: "User One",
				phone,
			});

			// Try to create another with same phone
			const response = await request(app).post("/api/auth/register").send({
				email: "user2@example.com",
				password: "Password123!",
				fullName: "User Two",
				phone,
			});

			expect(response.statusCode).toEqual(StatusCodes.CONFLICT);
			expect(response.body.success).toBeFalsy();
			expect(response.body.message).toContain("phone number already exists");
		});

		it("should reject registration with missing required fields", async () => {
			const response = await request(app).post("/api/auth/register").send({
				email: "user@example.com",
				password: "Password123!",
				// missing fullName and phone
			});

			expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
			expect(response.body.success).toBeFalsy();
		});
	});

	describe("GET /auth/me", () => {
		it("should return authenticated user data when a valid token is provided", async () => {
			const loginResponse = await request(app)
				.post("/api/auth/login")
				.send({ email: TEST_EMAIL, password: TEST_PASSWORD });

			const token = loginResponse.body.data?.accessToken as string;

			const response = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);

			expect(response.statusCode).toEqual(StatusCodes.OK);
			expect(response.body.success).toBeTruthy();
			expect(response.body.data).toMatchObject({
				email: TEST_EMAIL,
				fullName: TEST_FULL_NAME,
			});
		});

		it("should reject requests without a valid token", async () => {
			const response = await request(app).get("/api/auth/me");

			expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
			expect(response.body.success).toBeFalsy();
			expect(response.body.message).toContain("Authorization header missing or malformed");
		});
	});
});
