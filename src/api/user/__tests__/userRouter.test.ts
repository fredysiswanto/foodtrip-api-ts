import { StatusCodes } from "http-status-codes";
import request from "supertest";

import type { User } from "@/api/user/userModel";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import { app } from "@/server";

const loginAsAlice = async () => {
	const response = await request(app)
		.post("/auth/login")
		.send({ email: "alice@example.com", password: "Password123!" });

	return response.body.responseObject?.accessToken as string;
};

describe("User API Endpoints", () => {
	describe("GET /users", () => {
		it("should return a list of users", async () => {
			const token = await loginAsAlice();

			// Act
			const response = await request(app).get("/users").set("Authorization", `Bearer ${token}`);
			const responseBody: ServiceResponse<User[]> = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.OK);
			expect(responseBody.success).toBeTruthy();
			expect(responseBody.message).toContain("Users found");
			expect(responseBody.responseObject.length).toBeGreaterThan(0);
			expect(responseBody.responseObject[0]).toMatchObject({
				id: expect.any(Number),
				email: expect.any(String),
				name: expect.any(String),
				age: expect.any(Number),
			});
		});
	});

	describe("GET /users/:id", () => {
		it("should return a user for a valid ID", async () => {
			// Arrange
			const testId = 1;
			const token = await loginAsAlice();

			// Act
			const response = await request(app).get(`/users/${testId}`).set("Authorization", `Bearer ${token}`);
			const responseBody: ServiceResponse<User> = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.OK);
			expect(responseBody.success).toBeTruthy();
			expect(responseBody.message).toContain("User found");
			expect(responseBody.responseObject).toMatchObject({
				id: testId,
				email: "alice@example.com",
				name: "Alice",
				age: 42,
			});
		});

		it("should return a not found error for non-existent ID", async () => {
			// Arrange
			const testId = Number.MAX_SAFE_INTEGER;
			const token = await loginAsAlice();

			// Act
			const response = await request(app).get(`/users/${testId}`).set("Authorization", `Bearer ${token}`);
			const responseBody: ServiceResponse = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
			expect(responseBody.success).toBeFalsy();
			expect(responseBody.message).toContain("User not found");
			expect(responseBody.responseObject).toBeNull();
		});

		it("should return a bad request for invalid ID format", async () => {
			const token = await loginAsAlice();

			// Act
			const invalidInput = "abc";
			const response = await request(app).get(`/users/${invalidInput}`).set("Authorization", `Bearer ${token}`);
			const responseBody: ServiceResponse = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
			expect(responseBody.success).toBeFalsy();
			expect(responseBody.message).toContain("Invalid input");
			expect(responseBody.responseObject).toBeNull();
		});
	});
});
