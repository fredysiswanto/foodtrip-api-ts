import { CompactEncrypt, compactDecrypt } from "jose";

// 1. Definisikan struktur data (Payload) yang ingin Anda simpan di dalam token
export interface JwtPayload {
	userId: string;
	email: string;
	role: string; // RoleName
	permissions: string[];
	restaurants?: {
		restaurantId: string;
		restaurantRole: string;
	}[];
}

// 2. Definisikan struktur token lengkap setelah ditambah klaim waktu (iat & exp)
export interface FullTokenPayload extends JwtPayload {
	iat: number;
	exp: number;
}

// PENTING: Kunci rahasia HARUS tepat 32 karakter untuk algoritma AES-256 (A256GCM)
const SECRET_KEY = Buffer.from(process.env.JWT_SECRET || "key-harus-32-karakter!");

export class JwtHelper {
	/**
	 * Membuat token terenkripsi (JWE) yang tidak bisa didekode tanpa kunci rahasia
	 * @param payload Data pengguna yang ingin dimasukkan ke dalam token
	 * @param expiresIn Masa berlaku token (contoh: '15m', '2h', '7d')
	 */
	async generateToken(payload: JwtPayload, expiresIn: string = "1h"): Promise<string> {
		try {
			const now = Math.floor(Date.now() / 1000);
			let durationInSeconds = 15 * 60; // Default 15 menit

			const match = expiresIn.match(/^(\d+)([mhrd])$/);
			if (match) {
				const value = parseInt(match[1], 10);
				const unit = match[2];
				if (unit === "m") durationInSeconds = value * 60;
				if (unit === "h") durationInSeconds = value * 3600;
				if (unit === "d") durationInSeconds = value * 86400;
			}

			// Gabungkan data asli dengan klaim standard JWT (iat dan exp)
			const fullPayload: FullTokenPayload = {
				...payload,
				iat: now,
				exp: now + durationInSeconds,
			};

			const encoder = new TextEncoder();
			const dataToEncrypt = encoder.encode(JSON.stringify(fullPayload));

			// Proses enkripsi total terhadap payload menggunakan AES-256-GCM
			const token = await new CompactEncrypt(dataToEncrypt)
				.setProtectedHeader({ alg: "dir", enc: "A256GCM" })
				.encrypt(SECRET_KEY);

			return token;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: unknown) {
			throw new Error(`Gagal membuat token: ${(error as Error).message}`);
		}
	}

	/**
	 * Mendekripsi dan memvalidasi token JWE
	 * @param token Token JWE dari klien
	 * @returns Mengembalikan data asli jika valid, atau null jika kedaluwarsa/salah
	 */
	async decodeToken(token: string | undefined): Promise<FullTokenPayload | null> {
		if (!token) return null;

		try {
			// Proses dekripsi token menggunakan kunci rahasia
			const { plaintext } = await compactDecrypt(token, SECRET_KEY);

			// Ubah kembali data biner menjadi objek JavaScript
			const decoder = new TextDecoder();
			const payload = JSON.parse(decoder.decode(plaintext)) as FullTokenPayload;

			// Validasi waktu kedaluwarsa (exp) secara manual
			const now = Math.floor(Date.now() / 1000);
			if (payload.exp && now > payload.exp) {
				console.warn("Token validasi gagal: Token sudah kedaluwarsa.");
				return null;
			}

			return payload;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: unknown) {
			// Pengamanan Best Practice: Log internal, jangan bocorkan detail ke klien
			console.error("Token validasi gagal:", (error as Error).message);
			return null;
		}
	}
}
