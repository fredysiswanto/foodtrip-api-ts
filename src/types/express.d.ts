import type { RestaurantRole, RoleName } from "@/generated/prisma/client";

declare global {
	namespace Express {
		interface Request {
			user?: {
				userId: string;
				email: string;
				role: RoleName;
				permissions: string[];
				restaurants?: {
					restaurantId: string;
					restaurantRole: RestaurantRole;
				}[];
			};
			requestId?: string;
		}
	}
}
