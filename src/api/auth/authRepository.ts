import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export interface AuthRecord {
	id: number;
	email: string;
	passwordHash: string;
	salt: string;
}

const HASH_BYTE_SIZE = 64;

const createPasswordHash = (password: string, salt: string) =>
	scryptSync(password, salt, HASH_BYTE_SIZE).toString("hex");

const createUserRecord = (id: number, email: string, password: string): AuthRecord => {
	const salt = randomBytes(16).toString("hex");
	const passwordHash = createPasswordHash(password, salt);

	return {
		id,
		email,
		passwordHash,
		salt,
	};
};

export class AuthRepository {
	private users: AuthRecord[];

	constructor() {
		this.users = [
			createUserRecord(1, "alice@example.com", "Password123!"),
			createUserRecord(2, "robert@example.com", "Password123!"),
		];
	}

	findByEmail(email: string): AuthRecord | null {
		return this.users.find((record) => record.email.toLowerCase() === email.toLowerCase()) ?? null;
	}

	verifyPassword(record: AuthRecord, password: string): boolean {
		const attemptedHash = createPasswordHash(password, record.salt);
		const bufferA = Buffer.from(attemptedHash, "hex");
		const bufferB = Buffer.from(record.passwordHash, "hex");

		if (bufferA.length !== bufferB.length) {
			return false;
		}

		return timingSafeEqual(bufferA, bufferB);
	}
}
