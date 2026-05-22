import { UploadRepository } from "../uploadRepository";

describe("UploadRepository", () => {
	const uploadRepository = new UploadRepository();
	test("should first", async () => {
		expect(uploadRepository).toBeInstanceOf(UploadRepository);
		expect(uploadRepository.create).toBeDefined();
		expect(uploadRepository.findById).toBeDefined();
		expect(uploadRepository.findAll).toBeDefined();
		expect(uploadRepository.delete).toBeDefined();
	});

	//testing create method
	test("should create a new upload", async () => {});
});
