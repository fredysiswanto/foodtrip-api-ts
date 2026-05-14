import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { prisma } from "@/common/utils/prismaClient";

export interface AuthRecord {
	id: number;
	email: string;
	passwordHash: string;
	salt: string;
}

const HASH_BYTE_SIZE = 64;

const createPasswordHash = (password: string, salt: string) =>
	scryptSync(password, salt, HASH_BYTE_SIZE).toString("hex");

export class AuthRepository {
	async findByEmail(email: string): Promise<AuthRecord | null> {
		const user = await prisma.user.findUnique({
			where: { email },
			select: {
				id: true,
				email: true,
				passwordHash: true,
				salt: true,
			},
		});

		return user ? { id: user.id, email: user.email, passwordHash: user.passwordHash, salt: user.salt } : null;
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
