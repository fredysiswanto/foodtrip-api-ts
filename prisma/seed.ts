import "dotenv/config";
import { scryptSync } from "node:crypto";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";

const HASH_BYTE_SIZE = 64;
const PASSWORD_SALT = process.env.PASSWORD_SALT || "default_salt_value";
const DEFAULT_PASSWORD = "Password123!";

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

	const adminRole = await prisma.role.upsert({
		where: { name: "ADMIN" },
		update: {},
		create: {
			name: "ADMIN",
			description: "Administrator role with management permissions",
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

	const driverRole = await prisma.role.upsert({
		where: { name: "DRIVER" },
		update: {},
		create: {
			name: "DRIVER",
			description: "Driver role for deliveries",
		},
	});

	const adminUser = await prisma.user.upsert({
		where: { email: "admin@example.com" },
		update: {
			fullName: "Admin User",
			passwordHash: createPasswordHash(DEFAULT_PASSWORD),
			roleId: superAdminRole.id,
			phone: "+621000000000",
			isActive: true,
			updatedAt: new Date(),
		},
		create: {
			fullName: "Admin User",
			email: "admin@example.com",
			passwordHash: createPasswordHash(DEFAULT_PASSWORD),
			roleId: superAdminRole.id,
			phone: "+621000000000",
			isActive: true,
		},
	});

	const customerUser = await prisma.user.upsert({
		where: { email: "customer@example.com" },
		update: {
			fullName: "Customer User",
			passwordHash: createPasswordHash(DEFAULT_PASSWORD),
			roleId: customerRole.id,
			phone: "+621111111111",
			isActive: true,
			updatedAt: new Date(),
		},
		create: {
			fullName: "Customer User",
			email: "customer@example.com",
			passwordHash: createPasswordHash(DEFAULT_PASSWORD),
			roleId: customerRole.id,
			phone: "+621111111111",
			isActive: true,
		},
	});

	const driverUser = await prisma.user.upsert({
		where: { email: "driver@example.com" },
		update: {
			fullName: "Delivery Driver",
			passwordHash: createPasswordHash(DEFAULT_PASSWORD),
			roleId: driverRole.id,
			phone: "+621222222222",
			isActive: true,
			updatedAt: new Date(),
		},
		create: {
			fullName: "Delivery Driver",
			email: "driver@example.com",
			passwordHash: createPasswordHash(DEFAULT_PASSWORD),
			roleId: driverRole.id,
			phone: "+621222222222",
			isActive: true,
		},
	});

	const ownerUser = await prisma.user.upsert({
		where: { email: "owner@example.com" },
		update: {
			fullName: "Restaurant Owner",
			passwordHash: createPasswordHash(DEFAULT_PASSWORD),
			roleId: customerRole.id,
			phone: "+621333333333",
			isActive: true,
			updatedAt: new Date(),
		},
		create: {
			fullName: "Restaurant Owner",
			email: "owner@example.com",
			passwordHash: createPasswordHash(DEFAULT_PASSWORD),
			roleId: customerRole.id,
			phone: "+621333333333",
			isActive: true,
		},
	});

	const staffUser = await prisma.user.upsert({
		where: { email: "staff@example.com" },
		update: {
			fullName: "Restaurant Staff",
			passwordHash: createPasswordHash(DEFAULT_PASSWORD),
			roleId: customerRole.id,
			phone: "+621444444444",
			isActive: true,
			updatedAt: new Date(),
		},
		create: {
			fullName: "Restaurant Staff",
			email: "staff@example.com",
			passwordHash: createPasswordHash(DEFAULT_PASSWORD),
			roleId: customerRole.id,
			phone: "+621444444444",
			isActive: true,
		},
	});

	const jimboRestaurant = await prisma.restaurant.upsert({
		where: { slug: "nasi-uduk-betawi" },
		update: {
			name: "Warung Nasi Uduk Betawi",
			address: "Jl. Kebon Kacang No. 12",
			city: "Jakarta",
			province: "DKI Jakarta",
			postalCode: "10220",
			email: "info@nasiudukbetawi.id",
			phone: "+62212345678",
			status: "ACTIVE",
			isOpen: true,
		},
		create: {
			name: "Warung Nasi Uduk Betawi",
			slug: "nasi-uduk-betawi",
			address: "Jl. Kebon Kacang No. 12",
			city: "Jakarta",
			province: "DKI Jakarta",
			postalCode: "10220",
			email: "info@nasiudukbetawi.id",
			phone: "+62212345678",
			status: "ACTIVE",
			isOpen: true,
		},
	});

	const burgerRestaurant = await prisma.restaurant.upsert({
		where: { slug: "sate-madura-pak-jono" },
		update: {
			name: "Sate Madura Pak Jono",
			address: "Jl. Raya Rungkut No. 45",
			city: "Surabaya",
			province: "East Java",
			postalCode: "60293",
			email: "halo@satemadura.id",
			phone: "+623123456789",
			status: "ACTIVE",
			isOpen: true,
		},
		create: {
			name: "Sate Madura Pak Jono",
			slug: "sate-madura-pak-jono",
			address: "Jl. Raya Rungkut No. 45",
			city: "Surabaya",
			province: "East Java",
			postalCode: "60293",
			email: "halo@satemadura.id",
			phone: "+623123456789",
			status: "ACTIVE",
			isOpen: true,
		},
	});

	await prisma.restaurantUser.createMany({
		data: [
			{
				restaurantId: jimboRestaurant.id,
				userId: ownerUser.id,
				restaurantRole: "OWNER",
			},
			{
				restaurantId: jimboRestaurant.id,
				userId: staffUser.id,
				restaurantRole: "STAFF",
			},
			{
				restaurantId: burgerRestaurant.id,
				userId: ownerUser.id,
				restaurantRole: "OWNER",
			},
		],
		skipDuplicates: true,
	});

	const nasiCategory = await prisma.category.upsert({
		where: { slug: "nasi" },
		update: { name: "Nasi" },
		create: { name: "Nasi", slug: "nasi", description: "Menu nasi khas Indonesia" },
	});

	const sateCategory = await prisma.category.upsert({
		where: { slug: "sate" },
		update: { name: "Sate" },
		create: { name: "Sate", slug: "sate", description: "Pilihan sate dan lauk pendamping" },
	});

	const drinksCategory = await prisma.category.upsert({
		where: { slug: "minuman" },
		update: { name: "Minuman" },
		create: { name: "Minuman", slug: "minuman", description: "Minuman segar dan tradisional" },
	});

	const nasiUduk = await prisma.dish.upsert({
		where: { restaurantId_slug: { restaurantId: jimboRestaurant.id, slug: "nasi-uduk-komplit" } },
		update: {
			description: "Nasi uduk komplit dengan ayam goreng, telur, dan sambal kacang.",
			price: 42000,
			stock: 30,
			isAvailable: true,
		},
		create: {
			restaurantId: jimboRestaurant.id,
			categoryId: nasiCategory.id,
			name: "Nasi Uduk Komplit",
			slug: "nasi-uduk-komplit",
			description: "Nasi uduk komplit dengan ayam goreng, telur, dan sambal kacang.",
			price: 42000,
			stock: 30,
			isAvailable: true,
		},
	});

	const ayamGorengKremes = await prisma.dish.upsert({
		where: { restaurantId_slug: { restaurantId: jimboRestaurant.id, slug: "ayam-goreng-kremes" } },
		update: {
			description: "Ayam goreng kremes khas Betawi, renyah dan gurih.",
			price: 38000,
			stock: 20,
			isAvailable: true,
		},
		create: {
			restaurantId: jimboRestaurant.id,
			categoryId: nasiCategory.id,
			name: "Ayam Goreng Kremes",
			slug: "ayam-goreng-kremes",
			description: "Ayam goreng kremes khas Betawi, renyah dan gurih.",
			price: 38000,
			stock: 20,
			isAvailable: true,
		},
	});

	const sateAyam = await prisma.dish.upsert({
		where: { restaurantId_slug: { restaurantId: burgerRestaurant.id, slug: "sate-ayam-madura" } },
		update: {
			description: "Sate ayam Madura dengan bumbu kecap dan sambal kacang.",
			price: 45000,
			stock: 40,
			isAvailable: true,
		},
		create: {
			restaurantId: burgerRestaurant.id,
			categoryId: sateCategory.id,
			name: "Sate Ayam Madura",
			slug: "sate-ayam-madura",
			description: "Sate ayam Madura dengan bumbu kecap dan sambal kacang.",
			price: 45000,
			stock: 40,
			isAvailable: true,
		},
	});

	const lontongSayur = await prisma.dish.upsert({
		where: { restaurantId_slug: { restaurantId: burgerRestaurant.id, slug: "lontong-sayur" } },
		update: {
			description: "Lontong sayur hangat dengan kuah santan dan telur pindang.",
			price: 35000,
			stock: 25,
			isAvailable: true,
		},
		create: {
			restaurantId: burgerRestaurant.id,
			categoryId: sateCategory.id,
			name: "Lontong Sayur",
			slug: "lontong-sayur",
			description: "Lontong sayur hangat dengan kuah santan dan telur pindang.",
			price: 35000,
			stock: 25,
			isAvailable: true,
		},
	});

	const esTehManis = await prisma.dish.upsert({
		where: { restaurantId_slug: { restaurantId: burgerRestaurant.id, slug: "es-teh-manis" } },
		update: {
			description: "Es teh manis segar dengan aroma jeruk nipis.",
			price: 12000,
			stock: 60,
			isAvailable: true,
		},
		create: {
			restaurantId: burgerRestaurant.id,
			categoryId: drinksCategory.id,
			name: "Es Teh Manis",
			slug: "es-teh-manis",
			description: "Es teh manis segar dengan aroma jeruk nipis.",
			price: 12000,
			stock: 60,
			isAvailable: true,
		},
	});

	const orderOne = await prisma.order.upsert({
		where: { orderNo: "ORD-0001" },
		update: {
			status: "DELIVERING",
			paymentStatus: "PAID",
			paymentMethod: "CASH",
			total: 102000,
			confirmedAt: new Date(),
			updatedAt: new Date(),
		},
		create: {
			orderNo: "ORD-0001",
			userId: customerUser.id,
			restaurantId: burgerRestaurant.id,
			subtotal: 93000,
			deliveryFee: 9000,
			tax: 0,
			total: 102000,
			status: "DELIVERING",
			paymentStatus: "PAID",
			paymentMethod: "CASH",
			customerName: "Customer User",
			customerPhone: "+621111111111",
			deliveryAddress: "Jl. Melati No. 18, Surabaya",
			notes: "Antar ke rumah samping toko.",
			orderItems: {
				create: [
					{
						dishId: sateAyam.id,
						dishName: sateAyam.name,
						dishPrice: sateAyam.price,
						quantity: 1,
						subtotal: sateAyam.price,
					},
					{
						dishId: esTehManis.id,
						dishName: esTehManis.name,
						dishPrice: esTehManis.price,
						quantity: 1,
						subtotal: esTehManis.price,
					},
				],
			},
			delivery: {
				create: {
					driverId: driverUser.id,
					status: "IN_TRANSIT",
					startedAt: new Date(),
				},
			},
		},
	});

	const orderTwo = await prisma.order.upsert({
		where: { orderNo: "ORD-0002" },
		update: {
			status: "CONFIRMED",
			paymentStatus: "PAID",
			paymentMethod: "EWALLET",
			total: 95000,
			confirmedAt: new Date(),
			updatedAt: new Date(),
		},
		create: {
			orderNo: "ORD-0002",
			userId: customerUser.id,
			restaurantId: jimboRestaurant.id,
			subtotal: 95000,
			deliveryFee: 12000,
			tax: 0,
			total: 107000,
			status: "CONFIRMED",
			paymentStatus: "PAID",
			paymentMethod: "EWALLET",
			customerName: "Customer User",
			customerPhone: "+621111111111",
			deliveryAddress: "Jl. Kebun Jeruk No. 4, Jakarta",
			notes: "Jangan lupa bawa sambal terpisah.",
			orderItems: {
				create: [
					{
						dishId: nasiUduk.id,
						dishName: nasiUduk.name,
						dishPrice: nasiUduk.price,
						quantity: 1,
						subtotal: nasiUduk.price,
					},
					{
						dishId: ayamGorengKremes.id,
						dishName: ayamGorengKremes.name,
						dishPrice: ayamGorengKremes.price,
						quantity: 1,
						subtotal: ayamGorengKremes.price,
					},
				],
			},
		},
	});

	const cart = await prisma.cart.upsert({
		where: { userId_restaurantId: { userId: customerUser.id, restaurantId: burgerRestaurant.id } },
		update: {
			updatedAt: new Date(),
		},
		create: {
			userId: customerUser.id,
			restaurantId: burgerRestaurant.id,
		},
	});

	await prisma.cartItem.createMany({
		data: [
			{
				cartId: cart.id,
				dishId: sateAyam.id,
				quantity: 2,
				price: sateAyam.price,
				notes: "Bumbu kacang extra",
			},
			{
				cartId: cart.id,
				dishId: esTehManis.id,
				quantity: 1,
				price: esTehManis.price,
				notes: "Kurang manis",
			},
		],
		skipDuplicates: true,
	});

	const logoUpload = await prisma.upload.upsert({
		where: { filename: "nasi-uduk-betawi-logo.png" },
		update: {
			path: "/uploads/nasi-uduk-betawi-logo.png",
			folder: "restaurant",
			mimeType: "image/png",
			size: 18000n,
		},
		create: {
			originalName: "nasi-uduk-betawi-logo.png",
			filename: "nasi-uduk-betawi-logo.png",
			mimeType: "image/png",
			type: "restaurant_logo",
			folder: "restaurant",
			path: "/uploads/nasi-uduk-betawi-logo.png",
			size: 18000n,
			uploadedById: adminUser.id,
		},
	});

	const bannerUpload = await prisma.upload.upsert({
		where: { filename: "sate-madura-banner.png" },
		update: {
			path: "/uploads/sate-madura-banner.png",
			folder: "restaurant",
			mimeType: "image/png",
			size: 25000n,
		},
		create: {
			originalName: "sate-madura-banner.png",
			filename: "sate-madura-banner.png",
			mimeType: "image/png",
			type: "restaurant_banner",
			folder: "restaurant",
			path: "/uploads/sate-madura-banner.png",
			size: 25000n,
			uploadedById: adminUser.id,
		},
	});

	const dishUploadA = await prisma.upload.upsert({
		where: { filename: "nasi-uduk.png" },
		update: {
			path: "/uploads/nasi-uduk.png",
			folder: "dish",
			mimeType: "image/png",
			size: 22000n,
		},
		create: {
			originalName: "nasi-uduk.png",
			filename: "nasi-uduk.png",
			mimeType: "image/png",
			type: "dish_image",
			folder: "dish",
			path: "/uploads/nasi-uduk.png",
			size: 22000n,
			uploadedById: ownerUser.id,
		},
	});

	const dishUploadB = await prisma.upload.upsert({
		where: { filename: "sate-ayam.png" },
		update: {
			path: "/uploads/sate-ayam.png",
			folder: "dish",
			mimeType: "image/png",
			size: 23000n,
		},
		create: {
			originalName: "sate-ayam.png",
			filename: "sate-ayam.png",
			mimeType: "image/png",
			type: "dish_image",
			folder: "dish",
			path: "/uploads/sate-ayam.png",
			size: 23000n,
			uploadedById: ownerUser.id,
		},
	});

	await prisma.user.update({
		where: { id: adminUser.id },
		data: { avatarId: logoUpload.id },
	});

	await prisma.user.update({
		where: { id: customerUser.id },
		data: { avatarId: bannerUpload.id },
	});

	await prisma.restaurant.update({
		where: { id: jimboRestaurant.id },
		data: {
			logoId: logoUpload.id,
			bannerId: bannerUpload.id,
		},
	});

	await prisma.dish.update({
		where: { id: nasiUduk.id },
		data: { imageId: dishUploadA.id },
	});

	await prisma.dish.update({
		where: { id: sateAyam.id },
		data: { imageId: dishUploadB.id },
	});

	await prisma.restaurantImage.createMany({
		data: [
			{ restaurantId: jimboRestaurant.id, uploadId: logoUpload.id },
			{ restaurantId: burgerRestaurant.id, uploadId: bannerUpload.id },
		],
		skipDuplicates: true,
	});

	await prisma.dishImage.createMany({
		data: [
			{ dishId: nasiUduk.id, uploadId: dishUploadA.id },
			{ dishId: sateAyam.id, uploadId: dishUploadB.id },
		],
		skipDuplicates: true,
	});

	await prisma.refreshToken.upsert({
		where: { token: "refresh-token-customer" },
		update: {
			expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
		},
		create: {
			userId: customerUser.id,
			token: "refresh-token-customer",
			expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
		},
	});



	console.log("✅ Database seeded with simulation data.");
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
