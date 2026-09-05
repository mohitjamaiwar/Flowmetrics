import { Router } from "express";
import { login } from "../controllers/authController";
import { loginRateLimiter } from "../middleware/rateLimiters";
import { validate } from "../middleware/validate";
import { loginSchema } from "../validators/authValidators";

const router = Router();

router.post("/login", loginRateLimiter, validate(loginSchema), login);

export default router;
