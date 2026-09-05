import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

/**
 * Single place where every thrown/forwarded error becomes an HTTP response.
 * Controllers/middleware should just `throw new AppError(msg, status)`
 * (or let unexpected errors bubble via asyncHandler) and let this decide
 * the response shape. Keeps API error responses consistent everywhere.
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // Known, intentional errors (bad input, auth failures, not found, etc.)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Mongoose duplicate key (e.g. duplicate email or slug) -> 409 Conflict
  if (typeof err === "object" && err !== null && "code" in err && (err as { code?: number }).code === 11000) {
    const keyValue = (err as { keyValue?: Record<string, unknown> }).keyValue ?? {};
    const field = Object.keys(keyValue)[0] ?? "field";
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists`,
    });
  }

  // Mongoose CastError (e.g. malformed ObjectId in :id) -> 400
  if (typeof err === "object" && err !== null && "name" in err && (err as { name?: string }).name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid identifier",
    });
  }

  // Anything unexpected: log server-side, never leak internals to the client.
  console.error("[unexpected error]", err);
  return res.status(500).json({
    success: false,
    message: env.nodeEnv === "development" ? String(err) : "Internal server error",
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
