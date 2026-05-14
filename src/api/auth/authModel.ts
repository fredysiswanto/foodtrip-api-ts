import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const LoginRequestSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

export const AuthTokenSchema = z.object({
  accessToken: z.string().openapi({ description: "JWT access token" }),
  tokenType: z.literal("Bearer"),
  expiresIn: z.string().openapi({ description: "Token expiration interval" }),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>["body"];
export type AuthTokenResponse = z.infer<typeof AuthTokenSchema>;
