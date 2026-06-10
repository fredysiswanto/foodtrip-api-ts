import type { RoleName } from "@/generated/prisma/client";

// Permission string
export const PERMISSIONS = {
	MANAGE_USERS: "manage_users",
	MANAGE_RESTAURANTS: "manage_restaurants",
	VIEW_ORDERS: "view_orders",
	MANAGE_ORDERS: "manage_orders",
	MANAGE_MENU: "manage_menu",
	VIEW_DELIVERIES: "view_deliveries",
	MANAGE_DELIVERIES: "manage_deliveries",
	VIEW_AUDIT_LOGS: "view_audit_logs",
	MANAGE_SYSTEM: "manage_system",
} as const;

// Mapping global role ke permission array
export const rolePermissions: Record<RoleName, string[]> = {
	SUPER_ADMIN: Object.values(PERMISSIONS), // semua permission
	ADMIN: [
		PERMISSIONS.MANAGE_USERS,
		PERMISSIONS.MANAGE_RESTAURANTS,
		PERMISSIONS.VIEW_ORDERS,
		PERMISSIONS.MANAGE_ORDERS,
		PERMISSIONS.MANAGE_MENU,
		PERMISSIONS.VIEW_DELIVERIES,
		PERMISSIONS.MANAGE_DELIVERIES,
		PERMISSIONS.VIEW_AUDIT_LOGS,
	],
	CUSTOMER: [
		// customer hanya punya permission view_orders (milik sendiri) dan manage_orders?
		// sebenarnya lebih tepat sebagai permission 'view_own_orders' tapi kita sederhanakan
	],
	DRIVER: [PERMISSIONS.VIEW_DELIVERIES, PERMISSIONS.MANAGE_DELIVERIES],
};
