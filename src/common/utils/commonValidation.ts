import { z } from "zod";

export const commonValidations = {
	id: z.string().uuid(),
	// ... other common validations
};

export const validateData = <T extends z.ZodTypeAny>(schema: T, value: unknown): z.infer<T> => {
	const parseResult = schema.safeParse(value);

	if (!parseResult.success) {
		throw parseResult.error;
	}

	return parseResult.data;
};

export const safeValidateData = <T extends z.ZodTypeAny>(schema: T, value: unknown) => schema.safeParse(value);
