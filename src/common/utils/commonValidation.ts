import { z } from "zod";

export const commonValidations = {
	id: z.string().uuid(),
	// ... other common validations
};
