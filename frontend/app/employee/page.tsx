"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { EmployeeProgress } from "@/types";
import { HeroGradientOrbs } from "@/components/ui/AbstractShapes";
import Link from "next/link";

export default function EmployeeDashboardPage() {
  const { user, token, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const [progress, setProgress] = useState<EmployeeProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLogModal, setShowLogModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Form state
  const [projectName, setProjectName] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [hoursSpent, setHoursSpent] = useState("4.0");
  const [status, setStatus] = useState<"completed" | "in_progress" | "blocked">("completed");
  const [focusScore, setFocusScore] = useState("90");

  const fetchProgress = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiRequest<EmployeeProgress>("/api/employee/progress", { token });
      setProgress(data);
    } catch {
      setError("Failed to load employee progress metrics.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/admin/login");
      return;
    }
    fetchProgress();
  }, [isAuthenticated, router, fetchProgress]);

  function handleLogout() {
    logout();
    router.push("/admin/login");
  }

  function flash(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  async function handleAddWorkLog(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError("");

    try {
      await apiRequest("/api/employee/worklog", {
        method: "POST",
        body: {
          projectName,
          taskTitle,
          hoursSpent: Number(hoursSpent),
          status,
          focusScore: Number(focusScore),
        },
        token,
      });
      flash("Work activity recorded!");
      setShowLogModal(false);
      setProjectName("");
      setTaskTitle("");
      fetchProgress();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Failed to record work log.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!isAuthenticated || !user) return null;

  return (
    <div className="relative min-h-screen bg-surface bg-dot-pattern selection:bg-teal/20 selection:text-teal-dark pb-16">
      <HeroGradientOrbs />

      {/* Top Navbar */}
      <header className="relative z-20 border-b border-line bg-white/90 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal font-bold text-white shadow-md">
              FM
            </div>
            <div>
              <span className="font-display font-bold text-ink text-base">Flowmetrics</span>
              <span className="ml-2 rounded-full bg-teal/10 px-2.5 py-0.5 text-xs font-semibold text-teal-dark">
                Employee Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-dark text-xs font-bold text-white">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-ink">{user.name}</p>
                <p className="text-[11px] text-muted">{user.department || "Engineering"}</p>
              </div>
            </div>

            {user.role === "admin" && (
              <Link
                href="/admin"
                className="rounded-full border border-teal/30 bg-teal/10 px-3.5 py-1.5 text-xs font-semibold text-teal-dark hover:bg-teal hover:text-white transition-all"
              >
                Go to Admin →
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-ink hover:bg-surface transition-all"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 pt-10">
        {/* Header Title */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal">Personal Analytics</span>
            <h1 className="mt-1 font-display text-3xl font-extrabold text-ink md:text-4xl">
              Welcome back, {user.name.split(" ")[0]}! 👋
            </h1>
            <p className="mt-1 text-sm text-muted">
              Track your weekly work progress, capacity utilization, and logged tasks.
            </p>
          </div>

          <button
            onClick={() => setShowLogModal(true)}
            className="rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-teal-dark shadow-md shadow-teal/20"
          >
            + Log Work Activity
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}
        {successMsg && (
          <div role="status" className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 font-semibold">
            ✓ {successMsg}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="mt-10 flex items-center gap-3 text-sm text-muted">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal border-t-transparent" />
            Loading your work progress metrics…
          </div>
        )}

        {/* Progress Dashboard */}
        {progress && (
          <>
            {/* Stat Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
              <div className="rounded-2xl border border-line bg-white/95 p-6 shadow-sm backdrop-blur-md">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">Weekly Hours</span>
                <p className="mt-3 font-display text-3xl font-extrabold text-ink">
                  {progress.weeklyHours} <span className="text-sm font-semibold text-muted">/ 40 hrs</span>
                </p>
                <p className="mt-2 text-xs font-medium text-teal">Logged in past 7 days</p>
              </div>

              <div className="rounded-2xl border border-line bg-white/95 p-6 shadow-sm backdrop-blur-md">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">Capacity Utilization</span>
                <p className="mt-3 font-display text-3xl font-extrabold text-ink">
                  {progress.capacityUtilization}%
                </p>
                <div className="mt-3 h-2 w-full rounded-full bg-surface overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      progress.capacityUtilization > 100 ? "bg-amber-500" : "bg-teal"
                    }`}
                    style={{ width: `${Math.min(progress.capacityUtilization, 100)}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-white/95 p-6 shadow-sm backdrop-blur-md">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">Tasks Status</span>
                <p className="mt-3 font-display text-3xl font-extrabold text-ink">
                  {progress.completedCount}{" "}
                  <span className="text-xs font-semibold text-emerald-600">done</span>
                </p>
                <p className="mt-2 text-xs text-muted">
                  {progress.inProgressCount} in progress · {progress.blockedCount} blocked
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-white/95 p-6 shadow-sm backdrop-blur-md">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">Focus Score</span>
                <p className="mt-3 font-display text-3xl font-extrabold text-indigo-600">
                  {progress.avgFocusScore}%
                </p>
                <p className="mt-2 text-xs font-medium text-indigo-600">High uninterrupted focus</p>
              </div>
            </div>

            {/* Work Logs Table */}
            <div className="rounded-2xl border border-line bg-white/95 backdrop-blur-md shadow-xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-line bg-surface/80 px-6 py-4">
                <h2 className="font-bold text-ink text-base">Recent Activity & Work Logs</h2>
                <span className="text-xs text-muted font-medium">Showing latest entries</span>
              </div>

              {progress.logs.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted">
                  No work logs recorded yet. Click &quot;+ Log Work Activity&quot; above to add your first entry.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b border-line bg-surface/40 text-left text-xs uppercase tracking-wider font-bold text-muted">
                    <tr>
                      <th className="px-6 py-3.5">Project</th>
                      <th className="px-6 py-3.5">Task Description</th>
                      <th className="px-6 py-3.5">Hours</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Focus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {progress.logs.map((log) => (
                      <tr key={log._id} className="hover:bg-surface/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-ink">{log.projectName}</td>
                        <td className="px-6 py-4 font-medium text-ink/90">{log.taskTitle}</td>
                        <td className="px-6 py-4 font-bold text-ink">{log.hoursSpent} hrs</td>
                        <td className="px-6 py-4">
                          {log.status === "completed" && (
                            <span className="inline-flex rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-xs font-semibold text-emerald-700">
                              ✓ Completed
                            </span>
                          )}
                          {log.status === "in_progress" && (
                            <span className="inline-flex rounded-full bg-blue-50 border border-blue-200 px-3 py-0.5 text-xs font-semibold text-blue-700">
                              ⏱ In Progress
                            </span>
                          )}
                          {log.status === "blocked" && (
                            <span className="inline-flex rounded-full bg-red-50 border border-red-200 px-3 py-0.5 text-xs font-semibold text-red-700">
                              ⚠ Blocked
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold text-indigo-600">{log.focusScore || 88}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* Modal for adding a Work Log */}
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-md px-4 py-8">
            <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl border border-line">
              <div className="flex items-center justify-between border-b border-line pb-4 mb-6">
                <h2 className="text-xl font-bold text-ink">Log Work Activity</h2>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="text-muted hover:text-ink text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddWorkLog} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Project Name</label>
                  <input
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Mobile App Redesign"
                    className="w-full rounded-xl border border-line px-4 py-2.5 text-sm text-ink focus:border-teal focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Task Title / Activity</label>
                  <input
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Implement state management for cart"
                    className="w-full rounded-xl border border-line px-4 py-2.5 text-sm text-ink focus:border-teal focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">Hours Spent</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="24"
                      required
                      value={hoursSpent}
                      onChange={(e) => setHoursSpent(e.target.value)}
                      className="w-full rounded-xl border border-line px-4 py-2.5 text-sm text-ink focus:border-teal focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full rounded-xl border border-line px-4 py-2.5 text-sm text-ink focus:border-teal focus:outline-none"
                    >
                      <option value="completed">Completed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Focus Score (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={focusScore}
                    onChange={(e) => setFocusScore(e.target.value)}
                    className="w-full rounded-xl border border-line px-4 py-2.5 text-sm text-ink focus:border-teal focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-line mt-6">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink hover:bg-surface"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-teal px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark shadow-md"
                  >
                    {submitting ? "Saving…" : "Save Work Activity"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
