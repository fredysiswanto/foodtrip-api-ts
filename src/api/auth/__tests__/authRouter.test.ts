import { StatusCodes } from "http-status-codes";
import request from "supertest";

import { app } from "@/server";

describe("Auth API Endpoints", () => {
	describe("POST /auth/login", () => {
		it("should return a JWT token for valid credentials", async () => {
			const response = await request(app)
				.post("/auth/login")
				.send({ email: "alice@example.com", password: "Password123!" });

			expect(response.statusCode).toEqual(StatusCodes.OK);
			expect(response.body.success).toBeTruthy();
			expect(response.body.responseObject).toHaveProperty("accessToken");
			expect(response.body.responseObject).toHaveProperty("tokenType", "Bearer");
			expect(response.body.responseObject).toHaveProperty("expiresIn");
		});

		it("should reject invalid credentials", async () => {
			const response = await request(app)
				.post("/auth/login")
				.send({ email: "alice@example.com", password: "wrong-password" });

			expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
			expect(response.body.success).toBeFalsy();
			expect(response.body.message).toContain("Invalid email or password");
		});
	});

	describe("GET /auth/me", () => {
		it("should return authenticated user data when a valid token is provided", async () => {
			const loginResponse = await request(app)
				.post("/auth/login")
				.send({ email: "alice@example.com", password: "Password123!" });

			const token = loginResponse.body.responseObject?.accessToken as string;

			const response = await request(app).get("/auth/me").set("Authorization", `Bearer ${token}`);

			expect(response.statusCode).toEqual(StatusCodes.OK);
			expect(response.body.success).toBeTruthy();
			expect(response.body.responseObject).toMatchObject({
				email: "alice@example.com",
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
