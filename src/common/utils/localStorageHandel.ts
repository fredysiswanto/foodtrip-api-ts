import fs from "fs/promises";
import path from "path";

export interface StorageProvider {
	deleteFile(path: string): Promise<void>;
}

export class LocalStorageService implements StorageProvider {
	async deleteFile(filePath: string): Promise<void> {
		try {
			const absolutePath = path.resolve(filePath);

			await fs.unlink(absolutePath);
		} catch {
			//
		}
	}
}
