// src/shared/pagination/pagination.ts

import type { Prisma } from "@/generated/prisma/client";

/**
 * Parse pagination query params safely
 */

export interface PaginationQuery {
	page?: number | string;
	limit?: number | string;
	search?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc" | string;
}

export interface PaginationMeta {
	page: number;
	limit: number;
	totalItems: number;
	totalPages: number;
	previousPage: number | null;
	nextPage: number | null;
}

export interface PaginationResult<T> {
	data: T[];
	meta: PaginationMeta;
}
export const PAGINATION = {
	DEFAULT_PAGE: 1,
	DEFAULT_LIMIT: 10,
	MAX_LIMIT: 100,
} as const;
/**
 * Get pagination parameters from query
 */
export function getPagination(query: PaginationQuery) {
	const page = Math.max(Number(query.page) || PAGINATION.DEFAULT_PAGE, 1);

	const limit = Math.min(Math.max(Number(query.limit) || PAGINATION.DEFAULT_LIMIT, 1), PAGINATION.MAX_LIMIT);

	const skip = (page - 1) * limit;

	return {
		page,
		limit,
		skip,
	};
}

/**
 * Generate pagination metadata
 */
export function generatePaginationMeta(totalItems: number, page: number, limit: number): PaginationMeta {
	const totalPages = Math.ceil(totalItems / limit);

	return {
		page,
		limit,
		totalItems,
		totalPages,
		previousPage: page > 1 ? page - 1 : null,
		nextPage: page < totalPages ? page + 1 : null,
	};
}

/**
 * Standard pagination response
 */
export function createPaginationResponse<T>(
	data: T[],
	totalItems: number,
	page: number,
	limit: number,
): PaginationResult<T> {
	return {
		data,
		meta: generatePaginationMeta(totalItems, page, limit),
	};
}

/**
 * Build Prisma orderBy safely
 * @param sortBy
 * @param sortOrder
 * @param allowedFields
 *
 * example usage:
 * const orderBy = buildOrderBy(queryParams.sortBy, queryParams.sortOrder, ["name", "createdAt"]);
 */
export function buildOrderBy<T extends string>(
	sortBy: T | undefined,
	sortOrder: string | undefined,
	allowedFields: readonly T[],
): Record<string, Prisma.SortOrder> {
	if (!sortBy || !allowedFields.includes(sortBy)) {
		return {
			createdAt: "desc",
		};
	}

	return {
		[sortBy]: sortOrder === "asc" ? "asc" : "desc",
	};
}

/**
 * Build Prisma search filter
 */
export function buildSearch<T extends string>(
	search: string | undefined,
	fields: readonly T[],
	options?: {
		caseInsensitive?: boolean;
	},
) {
	if (!search || fields.length === 0) {
		return {};
	}

	return {
		OR: fields.map((field) => {
			// PostgreSQL only
			if (options?.caseInsensitive) {
				return {
					[field]: {
						contains: search,
						mode: "insensitive" as const,
					},
				};
			}

			// SQLite / MySQL safe
			return {
				[field]: {
					contains: search,
				},
			};
		}),
	};
}
