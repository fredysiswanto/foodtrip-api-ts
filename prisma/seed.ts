import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaMariaDb({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME,
	connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });
const HASH_BYTE_SIZE = 64;

const createPasswordHash = (password: string, salt: string) =>
	scryptSync(password, salt, HASH_BYTE_SIZE).toString("hex");

const users = [
	{ name: "Alice", email: "alice@example.com", age: 42, password: "Password123!" },
	{ name: "Robert", email: "robert@example.com", age: 21, password: "Password123!" },
];

async function main() {
	for (const user of users) {
		const salt = randomBytes(16).toString("hex");
		const passwordHash = createPasswordHash(user.password, salt);

		await prisma.user.upsert({
			where: { email: user.email },
			create: {
				name: user.name,
				email: user.email,
				age: user.age,
				passwordHash,
				salt,
			},
			update: {
				name: user.name,
				age: user.age,
				passwordHash,
				salt,
			},
		});
	}
}

main()
	.then(() => {
		console.log("✅ Prisma seed completed.");
	})
	.catch((error) => {
		console.error("❌ Prisma seed failed:", error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
