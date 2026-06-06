import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";
import { authRouter } from "@/api/auth/authRouter";
import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import { adminRouter } from "@/api/routes/adminRouter";
import { clientRouter } from "@/api/routes/clientRouter";
import { openAPIRouter } from "@/api-docs/openAPIRouter";
import errorHandler from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";
import { restoRouter } from "./api/routes/restoRouter";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use("/health", healthCheckRouter);
app.use("/api/auth", authRouter);
app.use("/api/resto", restoRouter);
app.use("/api", clientRouter);
app.use("/api/admin", adminRouter);

app.use("/api/uploads/images", express.static("public/uploads"));

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(...errorHandler());

export { app, logger };
