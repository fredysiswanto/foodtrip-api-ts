import { DishRepository } from "../dishRepository";

describe("dishService", () => {
	test("findAll should return all dishes", async () => {
		const data = new DishRepository();

		console.log(data);
	});
});
