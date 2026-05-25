import { scryptSync, timingSafeEqual } from "node:crypto";
import { prisma } from "@/common/utils/prismaClient";

export interface AuthRecord {
	id: string;
	email: string;
	passwordHash: string;
}

const HASH_BYTE_SIZE = 64;
const PASSWORD_SALT = process.env.PASSWORD_SALT || "random_salt_value";

const createPasswordHash = (password: string) => scryptSync(password, PASSWORD_SALT, HASH_BYTE_SIZE).toString("hex");

export class AuthRepository {
	async createPasswordHash(password: string): Promise<string> {
		return createPasswordHash(password);
	}

	async findByEmail(email: string): Promise<AuthRecord | null> {
		const user = await prisma.user.findUnique({
			where: { email },
			select: {
				id: true,
				email: true,
				passwordHash: true,
			},
		});

		return user ? { id: user.id, email: user.email, passwordHash: user.passwordHash } : null;
	}

	verifyPassword(record: AuthRecord, password: string): boolean {
		const attemptedHash = createPasswordHash(password);
		const bufferA = Buffer.from(attemptedHash, "hex");
		const bufferB = Buffer.from(record.passwordHash, "hex");

		if (bufferA.length !== bufferB.length) {
			return false;
		}

		return timingSafeEqual(bufferA, bufferB);
	}
}
