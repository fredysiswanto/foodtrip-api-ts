import { z } from "zod";

export const commonValidations = {
	id: z.string().uuid(),
	// ... other common validations
};

/**
 * @param schema
 * @param value
 * @returns The parsed data if valid, otherwise throws a ZodError
 */
export const validateData = <T extends z.ZodTypeAny>(schema: T, value: unknown): z.infer<T> => {
	const parseResult = schema.safeParse(value);

	if (!parseResult.success) {
		throw parseResult.error;
	}

	return parseResult.data;
};
