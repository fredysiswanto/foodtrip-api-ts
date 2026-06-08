import { DishRepository } from "../dishRepository";

describe("dishService", () => {
	test("findAll should return all dishes", async () => {
		const data = new DishRepository();

		const result = await data.findAll({ page: "1", limit: "10" });

		expect(result).toHaveProperty("data");
		expect(result).toHaveProperty("meta");
		expect(Array.isArray(result.data)).toBe(true);
		expect(result.meta).toHaveProperty("page");
		expect(result.meta).toHaveProperty("limit");
		expect(result.meta).toHaveProperty("totalItems");
		expect(result.meta).toHaveProperty("totalPages");
		expect(result.meta).toHaveProperty("previousPage");
		expect(result.meta).toHaveProperty("nextPage");
	});
});
