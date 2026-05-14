import "dotenv/config";
import { scryptSync } from "node:crypto";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const HASH_BYTE_SIZE = 64;
const PASSWORD_SALT = "some_random";
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
		where: { slug: "tasty-thai" },
		update: {
			name: "Tasty Thai",
			address: "Jl. Makanan 123",
			city: "Jakarta",
			province: "DKI Jakarta",
			postalCode: "10220",
			email: "contact@tastythai.id",
			phone: "+621234567890",
			status: "ACTIVE",
			isOpen: true,
		},
		create: {
			name: "Tasty Thai",
			slug: "tasty-thai",
			address: "Jl. Makanan 123",
			city: "Jakarta",
			province: "DKI Jakarta",
			postalCode: "10220",
			email: "contact@tastythai.id",
			phone: "+621234567890",
			status: "ACTIVE",
			isOpen: true,
		},
	});

	const burgerRestaurant = await prisma.restaurant.upsert({
		where: { slug: "urban-burger" },
		update: {
			name: "Urban Burger",
			address: "Jl. Santapan 45",
			city: "Bandung",
			province: "West Java",
			postalCode: "40123",
			email: "hello@urbanburger.id",
			phone: "+622345678901",
			status: "ACTIVE",
			isOpen: true,
		},
		create: {
			name: "Urban Burger",
			slug: "urban-burger",
			address: "Jl. Santapan 45",
			city: "Bandung",
			province: "West Java",
			postalCode: "40123",
			email: "hello@urbanburger.id",
			phone: "+622345678901",
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

	const thaiCategory = await prisma.category.upsert({
		where: { slug: "thai" },
		update: { name: "Thai" },
		create: { name: "Thai", slug: "thai", description: "Authentic Thai dishes" },
	});

	const burgerCategory = await prisma.category.upsert({
		where: { slug: "burger" },
		update: { name: "Burgers" },
		create: { name: "Burgers", slug: "burger", description: "Juicy burgers and sides" },
	});

	const drinksCategory = await prisma.category.upsert({
		where: { slug: "drinks" },
		update: { name: "Drinks" },
		create: { name: "Drinks", slug: "drinks", description: "Refreshing beverages" },
	});

	const padThai = await prisma.dish.upsert({
		where: { restaurantId_slug: { restaurantId: jimboRestaurant.id, slug: "pad-thai" } },
		update: {
			description: "Classic stir-fried rice noodles with tamarind sauce.",
			price: 55000,
			stock: 25,
			isAvailable: true,
		},
		create: {
			restaurantId: jimboRestaurant.id,
			categoryId: thaiCategory.id,
			name: "Pad Thai",
			slug: "pad-thai",
			description: "Classic stir-fried rice noodles with tamarind sauce.",
			price: 55000,
			stock: 25,
			isAvailable: true,
		},
	});

	const greenCurry = await prisma.dish.upsert({
		where: { restaurantId_slug: { restaurantId: jimboRestaurant.id, slug: "green-curry" } },
		update: {
			description: "Green curry with coconut milk and fresh basil.",
			price: 65000,
			stock: 18,
			isAvailable: true,
		},
		create: {
			restaurantId: jimboRestaurant.id,
			categoryId: thaiCategory.id,
			name: "Green Curry",
			slug: "green-curry",
			description: "Green curry with coconut milk and fresh basil.",
			price: 65000,
			stock: 18,
			isAvailable: true,
		},
	});

	const classicBurger = await prisma.dish.upsert({
		where: { restaurantId_slug: { restaurantId: burgerRestaurant.id, slug: "classic-burger" } },
		update: {
			description: "Signature beef burger with lettuce and tomato.",
			price: 70000,
			stock: 30,
			isAvailable: true,
		},
		create: {
			restaurantId: burgerRestaurant.id,
			categoryId: burgerCategory.id,
			name: "Classic Burger",
			slug: "classic-burger",
			description: "Signature beef burger with lettuce and tomato.",
			price: 70000,
			stock: 30,
			isAvailable: true,
		},
	});

	const fries = await prisma.dish.upsert({
		where: { restaurantId_slug: { restaurantId: burgerRestaurant.id, slug: "crispy-fries" } },
		update: {
			description: "Golden fries with house seasoning.",
			price: 25000,
			stock: 40,
			isAvailable: true,
		},
		create: {
			restaurantId: burgerRestaurant.id,
			categoryId: burgerCategory.id,
			name: "Crispy Fries",
			slug: "crispy-fries",
			description: "Golden fries with house seasoning.",
			price: 25000,
			stock: 40,
			isAvailable: true,
		},
	});

	const icedTea = await prisma.dish.upsert({
		where: { restaurantId_slug: { restaurantId: burgerRestaurant.id, slug: "iced-tea" } },
		update: {
			description: "Chilled lemon iced tea.",
			price: 20000,
			stock: 50,
			isAvailable: true,
		},
		create: {
			restaurantId: burgerRestaurant.id,
			categoryId: drinksCategory.id,
			name: "Iced Tea",
			slug: "iced-tea",
			description: "Chilled lemon iced tea.",
			price: 20000,
			stock: 50,
			isAvailable: true,
		},
	});

	const orderOne = await prisma.order.upsert({
		where: { orderNo: "ORD-0001" },
		update: {
			status: "DELIVERING",
			paymentStatus: "PAID",
			paymentMethod: "CASH",
			total: 142000,
			confirmedAt: new Date(),
			updatedAt: new Date(),
		},
		create: {
			orderNo: "ORD-0001",
			userId: customerUser.id,
			restaurantId: burgerRestaurant.id,
			subtotal: 120000,
			deliveryFee: 15000,
			tax: 7000,
			total: 142000,
			status: "DELIVERING",
			paymentStatus: "PAID",
			paymentMethod: "CASH",
			customerName: "Customer User",
			customerPhone: "+621111111111",
			deliveryAddress: "Jl. Contoh No. 10, Bandung",
			notes: "Please deliver to the side entrance.",
			orderItems: {
				create: [
					{
						dishId: classicBurger.id,
						dishName: classicBurger.name,
						dishPrice: classicBurger.price,
						quantity: 1,
						subtotal: classicBurger.price,
					},
					{
						dishId: fries.id,
						dishName: fries.name,
						dishPrice: fries.price,
						quantity: 1,
						subtotal: fries.price,
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
			total: 140000,
			confirmedAt: new Date(),
			updatedAt: new Date(),
		},
		create: {
			orderNo: "ORD-0002",
			userId: customerUser.id,
			restaurantId: jimboRestaurant.id,
			subtotal: 120000,
			deliveryFee: 15000,
			tax: 5000,
			total: 140000,
			status: "CONFIRMED",
			paymentStatus: "PAID",
			paymentMethod: "EWALLET",
			customerName: "Customer User",
			customerPhone: "+621111111111",
			deliveryAddress: "Jl. Contoh No. 10, Bandung",
			notes: "Keep the drink separate.",
			orderItems: {
				create: [
					{
						dishId: padThai.id,
						dishName: padThai.name,
						dishPrice: padThai.price,
						quantity: 1,
						subtotal: padThai.price,
					},
					{
						dishId: icedTea.id,
						dishName: icedTea.name,
						dishPrice: icedTea.price,
						quantity: 1,
						subtotal: icedTea.price,
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
				dishId: fries.id,
				quantity: 2,
				price: fries.price,
				notes: "Extra crispy",
			},
			{
				cartId: cart.id,
				dishId: icedTea.id,
				quantity: 1,
				price: icedTea.price,
				notes: "No ice",
			},
		],
		skipDuplicates: true,
	});

	const logoUpload = await prisma.upload.upsert({
		where: { filename: "tasty-thai-logo.png" },
		update: {
			path: "/uploads/tasty-thai-logo.png",
			folder: "restaurant",
			mimeType: "image/png",
			size: 18000n,
		},
		create: {
			originalName: "tasty-thai-logo.png",
			filename: "tasty-thai-logo.png",
			mimeType: "image/png",
			type: "restaurant_logo",
			folder: "restaurant",
			path: "/uploads/tasty-thai-logo.png",
			size: 18000n,
			uploadedById: adminUser.id,
		},
	});

	const bannerUpload = await prisma.upload.upsert({
		where: { filename: "urban-burger-banner.png" },
		update: {
			path: "/uploads/urban-burger-banner.png",
			folder: "restaurant",
			mimeType: "image/png",
			size: 25000n,
		},
		create: {
			originalName: "urban-burger-banner.png",
			filename: "urban-burger-banner.png",
			mimeType: "image/png",
			type: "restaurant_banner",
			folder: "restaurant",
			path: "/uploads/urban-burger-banner.png",
			size: 25000n,
			uploadedById: adminUser.id,
		},
	});

	const dishUploadA = await prisma.upload.upsert({
		where: { filename: "pad-thai.png" },
		update: {
			path: "/uploads/pad-thai.png",
			folder: "dish",
			mimeType: "image/png",
			size: 22000n,
		},
		create: {
			originalName: "pad-thai.png",
			filename: "pad-thai.png",
			mimeType: "image/png",
			type: "dish_image",
			folder: "dish",
			path: "/uploads/pad-thai.png",
			size: 22000n,
			uploadedById: ownerUser.id,
		},
	});

	const dishUploadB = await prisma.upload.upsert({
		where: { filename: "classic-burger.png" },
		update: {
			path: "/uploads/classic-burger.png",
			folder: "dish",
			mimeType: "image/png",
			size: 23000n,
		},
		create: {
			originalName: "classic-burger.png",
			filename: "classic-burger.png",
			mimeType: "image/png",
			type: "dish_image",
			folder: "dish",
			path: "/uploads/classic-burger.png",
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
		where: { id: padThai.id },
		data: { imageId: dishUploadA.id },
	});

	await prisma.dish.update({
		where: { id: classicBurger.id },
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
			{ dishId: padThai.id, uploadId: dishUploadA.id },
			{ dishId: classicBurger.id, uploadId: dishUploadB.id },
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

	await prisma.auditLog.createMany({
		data: [
			{
				userId: adminUser.id,
				action: "CREATE",
				module: "SEED",
				entityType: "User",
				entityId: customerUser.id,
				oldData: null,
				newData: { email: customerUser.email, fullName: customerUser.fullName },
				ipAddress: "127.0.0.1",
				userAgent: "Seeder/1.0",
			},
			{
				userId: ownerUser.id,
				action: "ASSIGN",
				module: "RESTAURANT",
				entityType: "RestaurantUser",
				entityId: jimboRestaurant.id,
				oldData: null,
				newData: { restaurantRole: "OWNER" },
				ipAddress: "127.0.0.1",
				userAgent: "Seeder/1.0",
			},
		],
		skipDuplicates: true,
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
