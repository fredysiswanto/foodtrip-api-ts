import { StatusCodes } from "http-status-codes";
import type { User } from "@/api/user/userModel";
import { UserRepository } from "@/api/user/userRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import { JwtHelper, type JwtPayload } from "@/common/utils/jwtHelper";
import { rolePermissions } from "@/common/utils/permissions";
import type { RegisterRequest } from "./authModel";
import { AuthRepository } from "./authRepository";

export type AuthTokenResponse = {
	accessToken: string;
	tokenType: "Bearer";
	expiresIn: string;
};

export class AuthService {
	private authRepository: AuthRepository;
	private userRepository: UserRepository;
	private jwtHelper: JwtHelper;
	constructor(
		authRepository: AuthRepository = new AuthRepository(),
		userRepository: UserRepository = new UserRepository(),
		jwtHelper: JwtHelper = new JwtHelper(),
	) {
		this.authRepository = authRepository;
		this.userRepository = userRepository;
		this.jwtHelper = jwtHelper;
	}

	private async createToken(user: User, restaurantId?: string): Promise<string> {
		const payload: JwtPayload = {
			userId: user.id,
			email: user.email,
			role: user.roleName,
			permissions: rolePermissions[user.roleName as keyof typeof rolePermissions] || [],
			restaurants: user.restaurants,
		};

		if (restaurantId) {
			payload.restaurants = [
				{
					restaurantId: restaurantId,
					restaurantRole: user.roleName,
				},
			];
		}

		const token = await this.jwtHelper.generateToken(payload, env.JWT_EXPIRES_IN);
		return token;
	}

	async verifyToken(token: string): Promise<ServiceResponse<JwtPayload | null>> {
		const verificationResult = await this.jwtHelper.decodeToken(token);
		if (!verificationResult) {
			return ServiceResponse.failure<JwtPayload | null>("Invalid or expired token.", null, StatusCodes.UNAUTHORIZED);
		}
		return ServiceResponse.success("Token valid.", verificationResult, StatusCodes.OK);
	}

	async login(email: string, password: string): Promise<ServiceResponse<AuthTokenResponse | null>> {
		const authRecord = await this.authRepository.findByEmail(email);
		const passwordValid = authRecord ? this.authRepository.verifyPassword(authRecord, password) : false;

		if (!authRecord || !passwordValid) {
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

		const accessToken = await this.createToken(user);

		return ServiceResponse.success("Login successful.", {
			accessToken,
			tokenType: "Bearer",
			expiresIn: env.JWT_EXPIRES_IN,
		});
	}

	async loginRestaurant(
		email: string,
		password: string,
		restaurantId?: string,
	): Promise<ServiceResponse<AuthTokenResponse | null>> {
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

		const hasRestaurantAccess = restaurantId
			? await this.userRepository.userHasRestaurantRole(user.id, restaurantId, ["OWNER", "ADMIN", "STAFF"])
			: (await this.userRepository.userRestaurantIds(user.id, ["OWNER", "ADMIN", "STAFF"])).length > 0;

		if (!hasRestaurantAccess) {
			return ServiceResponse.failure<AuthTokenResponse | null>(
				"Restaurant access denied.",
				null,
				StatusCodes.FORBIDDEN,
			);
		}

		const accessToken = await this.createToken(user, restaurantId);

		return ServiceResponse.success("Restaurant login successful.", {
			accessToken,
			tokenType: "Bearer",
			expiresIn: env.JWT_EXPIRES_IN,
		});
	}

	async register(payload: RegisterRequest): Promise<ServiceResponse<User | null>> {
		// Check if email already exists
		const existingEmail = await this.userRepository.emailExists(payload.email);
		if (existingEmail) {
			return ServiceResponse.failure<User | null>("User with this email already exists.", null, StatusCodes.CONFLICT);
		}

		// Check if phone already exists
		const existingPhone = await this.userRepository.phoneExists(payload.phone);
		if (existingPhone) {
			return ServiceResponse.failure<User | null>(
				"User with this phone number already exists.",
				null,
				StatusCodes.CONFLICT,
			);
		}

		const user = await this.userRepository.createCustomer({
			email: payload.email,
			passwordHash: await this.authRepository.createPasswordHash(payload.password),
			fullName: payload.fullName,
			phone: payload.phone,
		});

		if (!user) {
			return ServiceResponse.failure<User | null>("Failed to create user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}

		return ServiceResponse.success<User | null>("User registered successfully.", user, StatusCodes.CREATED);
	}
}

export const authService = new AuthService();
