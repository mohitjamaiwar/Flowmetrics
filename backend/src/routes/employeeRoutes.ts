import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getEmployeeProgress,
  createWorkLog,
} from "../controllers/employeeController";

const router = Router();

// All employee routes require authentication
router.use(authenticate);

router.get("/progress", getEmployeeProgress);
router.post("/worklog", createWorkLog);

export default router;
