import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { UserRepository } from "@/api/user/userRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import { AuthRepository } from "./authRepository";

export type AuthTokenResponse = {
	accessToken: string;
	tokenType: "Bearer";
	expiresIn: string;
};

export type JwtPayload = {
	userId: number;
	email: string;
	iat?: number;
	exp?: number;
};

export class AuthService {
	private authRepository: AuthRepository;
	private userRepository: UserRepository;

	constructor(
		authRepository: AuthRepository = new AuthRepository(),
		userRepository: UserRepository = new UserRepository(),
	) {
		this.authRepository = authRepository;
		this.userRepository = userRepository;
	}

	async login(email: string, password: string): Promise<ServiceResponse<AuthTokenResponse | null>> {
		const authRecord = await this.authRepository.findByEmail(email);

		if (!authRecord || !this.authRepository.verifyPassword(authRecord, password)) {
			return ServiceResponse.failure<AuthTokenResponse | null>(
				"Invalid email or password.",
				null,
				StatusCodes.UNAUTHORIZED,
			);
		}

		const user = await this.userRepository.findByIdAsync(authRecord.id);

		if (!user) {
			return ServiceResponse.failure<AuthTokenResponse | null>(
				"Authenticated user not found.",
				null,
				StatusCodes.UNAUTHORIZED,
			);
		}

		const accessToken = jwt.sign({ userId: user.id, email: user.email }, env.JWT_SECRET, {
			expiresIn: env.JWT_EXPIRES_IN,
		});

		return ServiceResponse.success("Login successful.", {
			accessToken,
			tokenType: "Bearer",
			expiresIn: env.JWT_EXPIRES_IN,
		});
	}

	verifyToken(token: string): ServiceResponse<JwtPayload | null> {
		try {
			const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
			return ServiceResponse.success("Token valid.", payload, StatusCodes.OK);
		} catch {
			return ServiceResponse.failure<JwtPayload | null>("Invalid or expired token.", null, StatusCodes.UNAUTHORIZED);
		}
	}
}

export const authService = new AuthService();
