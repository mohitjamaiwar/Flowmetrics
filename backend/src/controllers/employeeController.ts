import { Request, Response } from "express";
import { WorkLog } from "../models/WorkLog";
import { User } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

// GET /api/employee/progress — Logged-in employee's progress metrics
export const getEmployeeProgress = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Authentication required", 401);

  const logs = await WorkLog.find({ user: userId }).sort({ date: -1 });

  // Calculate 7-day hours logged
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentLogs = logs.filter((l) => new Date(l.date) >= sevenDaysAgo);
  const weeklyHours = recentLogs.reduce((sum, l) => sum + l.hoursSpent, 0);

  const completedCount = logs.filter((l) => l.status === "completed").length;
  const inProgressCount = logs.filter((l) => l.status === "in_progress").length;
  const blockedCount = logs.filter((l) => l.status === "blocked").length;

  const avgFocusScore = logs.length > 0
    ? Math.round(logs.reduce((sum, l) => sum + (l.focusScore || 85), 0) / logs.length)
    : 85;

  const capacityUtilization = Math.min(Math.round((weeklyHours / 40) * 100), 125);

  res.status(200).json({
    success: true,
    data: {
      weeklyHours,
      capacityUtilization,
      completedCount,
      inProgressCount,
      blockedCount,
      avgFocusScore,
      logs: logs.slice(0, 10),
    },
  });
});

// POST /api/employee/worklog — Add work entry
export const createWorkLog = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Authentication required", 401);

  const { projectName, taskTitle, hoursSpent, status, focusScore } = req.body;

  if (!projectName || !taskTitle || !hoursSpent) {
    throw new AppError("Project name, task title, and hours spent are required", 400);
  }

  const log = await WorkLog.create({
    user: userId,
    projectName: String(projectName).trim(),
    taskTitle: String(taskTitle).trim(),
    hoursSpent: Number(hoursSpent),
    status: status || "in_progress",
    focusScore: focusScore ? Number(focusScore) : 88,
    date: new Date(),
  });

  res.status(201).json({ success: true, message: "Work log recorded", data: log });
});

// ADMIN: GET /api/admin/team — Team-wide analytics
export const getTeamAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const employees = await User.find({ role: "employee" }).select("-passwordHash");
  const allLogs = await WorkLog.find().populate("user", "name email department avatar").sort({ date: -1 });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentLogs = allLogs.filter((l) => new Date(l.date) >= sevenDaysAgo);
  const totalTeamHours = recentLogs.reduce((sum, l) => sum + l.hoursSpent, 0);

  const avgTeamFocus = recentLogs.length > 0
    ? Math.round(recentLogs.reduce((sum, l) => sum + (l.focusScore || 85), 0) / recentLogs.length)
    : 86;

  // Build per-employee analytics map
  const teamMemberStats = employees.map((emp) => {
    const empLogs = allLogs.filter((l) => String((l.user as any)._id || l.user) === String(emp._id));
    const empRecent = empLogs.filter((l) => new Date(l.date) >= sevenDaysAgo);
    const hoursThisWeek = empRecent.reduce((sum, l) => sum + l.hoursSpent, 0);
    const capacityPct = Math.min(Math.round((hoursThisWeek / 40) * 100), 130);
    const blockedTasks = empLogs.filter((l) => l.status === "blocked");

    return {
      _id: emp._id,
      name: emp.name,
      email: emp.email,
      department: emp.department || "Engineering",
      avatar: emp.avatar,
      hoursThisWeek,
      capacityPct,
      isOverCapacity: hoursThisWeek > 40,
      hasBlockedTasks: blockedTasks.length > 0,
      recentLogs: empLogs.slice(0, 5),
    };
  });

  const overCapacityCount = teamMemberStats.filter((m) => m.isOverCapacity).length;

  res.status(200).json({
    success: true,
    data: {
      totalTeamHours,
      avgTeamFocus,
      overCapacityCount,
      teamMembers: teamMemberStats,
    },
  });
});
