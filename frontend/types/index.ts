export interface PricingPlan {
  _id: string;
  name: string;
  price: number;
  billingCycle: "monthly" | "yearly";
  features: string[];
  highlighted: boolean;
  displayOrder: number;
  published: boolean;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  featured: boolean;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkLog {
  _id: string;
  projectName: string;
  taskTitle: string;
  hoursSpent: number;
  status: "completed" | "in_progress" | "blocked";
  date: string;
  focusScore: number;
}

export interface EmployeeProgress {
  weeklyHours: number;
  capacityUtilization: number;
  completedCount: number;
  inProgressCount: number;
  blockedCount: number;
  avgFocusScore: number;
  logs: WorkLog[];
}

export interface TeamMemberStats {
  _id: string;
  name: string;
  email: string;
  department: string;
  avatar?: string;
  hoursThisWeek: number;
  capacityPct: number;
  isOverCapacity: boolean;
  hasBlockedTasks: boolean;
  recentLogs: WorkLog[];
}

export interface TeamAnalytics {
  totalTeamHours: number;
  avgTeamFocus: number;
  overCapacityCount: number;
  teamMembers: TeamMemberStats[];
}

export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
  department?: string;
  avatar?: string;
}
