import rateLimit from "express-rate-limit";

/**
 * Login is the most brute-forceable endpoint in the app, so it gets the
 * tightest limit: 10 attempts per 15 minutes per IP.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again in a few minutes.",
  },
});

/**
 * Admin write endpoints (create/update/delete) get a looser but still
 * meaningful limit: 60 requests per 15 minutes per IP. Generous enough
 * that normal admin usage/testing never gets in its own way.
 */
export const writeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please slow down and try again shortly.",
  },
});
