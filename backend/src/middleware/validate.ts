import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

/**
 * Validates req.body against the given Zod schema.
 * On success, replaces req.body with the parsed (and defaulted/coerced) data.
 * On failure, returns a 400 with a field -> message map, matching the
 * response shape required by the challenge spec.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path.join(".") || "body";
        if (!errors[field]) errors[field] = issue.message;
      }
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    req.body = result.data;
    next();
  };
}
