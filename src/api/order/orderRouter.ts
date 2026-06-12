import express, { type Router } from "express";
import { z } from "zod";
import { adminAuthMiddleware } from "@/common/middleware/adminAuthMiddleware";
import { orderAccessMiddleware } from "@/common/middleware/restaurantAccessMiddleware";
import { commonValidations } from "@/common/utils/commonValidation";
import { validateRequest } from "@/common/utils/httpHandlers";
import { CreateOrderSchema, UpdateOrderPaymentStatusSchema, UpdateOrderStatusSchema } from "./order.dto";
import { orderController } from "./orderController";

export const orderRouter: Router = express.Router();

orderRouter.get("/", adminAuthMiddleware, orderController.getOrdersAdmin);
orderRouter.get(
	"/:id",
	orderAccessMiddleware(["OWNER", "ADMIN", "STAFF"]),
	validateRequest(z.object({ params: z.object({ id: commonValidations.id }) })),
	orderController.getOrderByIdAdmin,
);
orderRouter.post(
	"/",
	adminAuthMiddleware,
	validateRequest(z.object({ body: CreateOrderSchema })),
	orderController.createOrder,
);
orderRouter.patch(
	"/:id/status",
	orderAccessMiddleware(["OWNER", "ADMIN", "STAFF"]),
	validateRequest(z.object({ params: z.object({ id: commonValidations.id }), body: UpdateOrderStatusSchema })),
	orderController.updateOrderStatus,
);
orderRouter.patch(
	"/:id/payment-status",
	orderAccessMiddleware(["OWNER", "ADMIN", "STAFF"]),
	validateRequest(z.object({ params: z.object({ id: commonValidations.id }), body: UpdateOrderPaymentStatusSchema })),
	orderController.updateOrderPaymentStatus,
);
