import { Router } from "express";
import { getAdminStats } from "../controllers/adminController";
import { getTeamAnalytics } from "../controllers/employeeController";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

router.use(authenticate, requireAdmin);
router.get("/stats", getAdminStats);
router.get("/team", getTeamAnalytics);

export default router;
