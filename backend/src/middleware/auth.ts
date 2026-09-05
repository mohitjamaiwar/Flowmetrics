import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { JwtPayload, verifyToken } from "../utils/jwt";

// Extend Express's Request type so `req.user` is known and typed everywhere.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Step 1 of the auth chain: confirms the caller sent a valid, unexpired JWT.
 * This ONLY proves "who" the caller claims to be — it does NOT decide
 * what they're allowed to do. That is requireAdmin's job.
 */
export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("Authentication required", 401);
  }

  const token = header.split(" ")[1];

  try {
    req.user = verifyToken(token);
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }

  next();
});

/**
 * Step 2 of the auth chain: explicitly checks the role attached by
 * authenticate(). A valid token alone is NEVER sufficient — this is
 * the required check the challenge spec calls out.
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  if (req.user.role !== "admin") {
    throw new AppError("Admin access required", 403);
  }
  next();
}
