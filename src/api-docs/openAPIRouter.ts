import express, { type Request, type Response, type Router } from "express";
import swaggerUi from "swagger-ui-express";

import { generateOpenAPIDocument } from "@/api-docs/openAPIDocumentGenerator";

export const openAPIRouter: Router = express.Router();
const openAPIDocument = generateOpenAPIDocument();

openAPIRouter.get("/swagger.json", (_req: Request, res: Response) => {
	res.setHeader("Content-Type", "application/json");
	res.send(openAPIDocument);
});

openAPIRouter.use(
	"/docs",
	swaggerUi.serve,
	swaggerUi.setup(openAPIDocument, {
		customCss: `.live-responses-table .response-col_description pre.microlight:nth-child(2) .headerline:nth-child(n+6) {display: none;}`,
	}),
);
