"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { TeamAnalytics } from "@/types";

export default function AdminTeamPage() {
  const { token } = useAuth();
  const [data, setData] = useState<TeamAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    apiRequest<TeamAnalytics>("/api/admin/team", { token })
      .then(setData)
      .catch((err: unknown) => {
        setError(err instanceof ApiRequestError ? err.message : "Failed to load team analytics.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <AdminShell>
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-teal">Team Workload & Progress</span>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-ink md:text-4xl">
            Employee Progress & Analytics
          </h1>
          <p className="mt-1 text-sm text-muted">
            Monitor real-time employee work logs, capacity utilization, focus scores, and bottleneck warnings.
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-10 flex items-center gap-3 text-sm text-muted">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal border-t-transparent" />
            Loading team progress & workload analytics…
          </div>
        )}

        {data && (
          <>
            {/* Team Overview Cards */}
            <div className="grid gap-6 sm:grid-cols-3 mb-10">
              <div className="rounded-2xl border border-line bg-white/95 p-6 shadow-sm backdrop-blur-md">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">Total Team Hours (7d)</span>
                <p className="mt-3 font-display text-3xl font-extrabold text-ink">{data.totalTeamHours} hrs</p>
                <p className="mt-2 text-xs font-medium text-teal">Across {data.teamMembers.length} active employees</p>
              </div>

              <div className="rounded-2xl border border-line bg-white/95 p-6 shadow-sm backdrop-blur-md">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">Over-Capacity Alerts</span>
                <p className="mt-3 font-display text-3xl font-extrabold text-amber-600">
                  {data.overCapacityCount} <span className="text-sm font-semibold text-muted">members</span>
                </p>
                <p className="mt-2 text-xs text-muted">Working &gt; 40 hours per week</p>
              </div>

              <div className="rounded-2xl border border-line bg-white/95 p-6 shadow-sm backdrop-blur-md">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">Average Team Focus</span>
                <p className="mt-3 font-display text-3xl font-extrabold text-indigo-600">
                  {data.avgTeamFocus}%
                </p>
                <p className="mt-2 text-xs font-medium text-indigo-600">High focus efficiency score</p>
              </div>
            </div>

            {/* Individual Employee Progress Cards */}
            <h2 className="text-xl font-bold text-ink mb-4">Employee Roster & Real-Time Status</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
              {data.teamMembers.map((member) => (
                <div
                  key={member._id}
                  className="rounded-2xl border border-line bg-white/95 p-6 shadow-md backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:border-teal/40 flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-dark text-white font-bold text-base shadow-sm">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-ink text-base">{member.name}</h3>
                          <p className="text-xs text-muted">{member.department}</p>
                        </div>
                      </div>

                      {member.isOverCapacity ? (
                        <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                          Over Capacity
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                          Healthy
                        </span>
                      )}
                    </div>

                    {/* Progress Stats */}
                    <div className="space-y-3 border-y border-line py-4 my-4">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-muted">Weekly Logged Hours:</span>
                        <span className="text-ink font-bold">{member.hoursThisWeek} hrs / 40h</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2 w-full rounded-full bg-surface overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            member.capacityPct > 100 ? "bg-amber-500" : "bg-teal"
                          }`}
                          style={{ width: `${Math.min(member.capacityPct, 100)}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-muted">Capacity Score:</span>
                        <span className="text-teal font-extrabold">{member.capacityPct}%</span>
                      </div>
                    </div>

                    {/* Recent Work Activity */}
                    <div className="mt-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Recent Tasks</p>
                      {member.recentLogs.length === 0 ? (
                        <p className="text-xs text-muted italic">No logs recorded yet.</p>
                      ) : (
                        <ul className="space-y-2 text-xs">
                          {member.recentLogs.slice(0, 3).map((log) => (
                            <li key={log._id} className="flex items-center justify-between gap-2 rounded-lg bg-surface p-2">
                              <div className="truncate">
                                <span className="font-bold text-ink">{log.projectName}</span>:{" "}
                                <span className="text-muted">{log.taskTitle}</span>
                              </div>
                              <span className="shrink-0 font-bold text-teal">{log.hoursSpent}h</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
