import "dotenv/config";
import { scryptSync } from "node:crypto";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const HASH_BYTE_SIZE = 64;
const PASSWORD_SALT = "some_random";

const createPasswordHash = (password: string) => scryptSync(password, PASSWORD_SALT, HASH_BYTE_SIZE).toString("hex");

const prisma = new PrismaClient({
	adapter: new PrismaMariaDb({
		host: process.env.DATABASE_HOST,
		user: process.env.DATABASE_USER,
		password: process.env.DATABASE_PASSWORD,
		database: process.env.DATABASE_NAME,
		connectionLimit: 5,
	}),
});

async function main() {
	const superAdminRole = await prisma.role.upsert({
		where: { name: "SUPER_ADMIN" },
		update: {},
		create: {
			name: "SUPER_ADMIN",
			description: "System super administrator",
		},
	});

	const customerRole = await prisma.role.upsert({
		where: { name: "CUSTOMER" },
		update: {},
		create: {
			name: "CUSTOMER",
			description: "Customer role for ordering",
		},
	});

	await prisma.user.upsert({
		where: { email: "admin@example.com" },
		update: {
			fullName: "Admin User",
			passwordHash: createPasswordHash("Password123!"),
			roleId: superAdminRole.id,
			isActive: true,
			updatedAt: new Date(),
		},
		create: {
			fullName: "Admin User",
			email: "admin@example.com",
			passwordHash: createPasswordHash("Password123!"),
			roleId: superAdminRole.id,
			isActive: true,
		},
	});

	await prisma.user.upsert({
		where: { email: "customer@example.com" },
		update: {
			fullName: "Customer User",
			passwordHash: createPasswordHash("Password123!"),
			roleId: customerRole.id,
			isActive: true,
			updatedAt: new Date(),
		},
		create: {
			fullName: "Customer User",
			email: "customer@example.com",
			passwordHash: createPasswordHash("Password123!"),
			roleId: customerRole.id,
			isActive: true,
		},
	});

	console.log("✅ Database seeded with initial users.");
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (error) => {
		console.error(error);
		await prisma.$disconnect();
		process.exit(1);
	});
