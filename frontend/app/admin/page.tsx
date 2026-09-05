"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface Stats {
  totalPlans: number;
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  featuredPosts: number;
}

function StatCard({
  label,
  value,
  sub,
  icon,
  badgeColor,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: string;
  badgeColor: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-line bg-white/95 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-teal/40">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted">{label}</span>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${badgeColor} text-white font-bold shadow-md transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </div>
      </div>
      <p className="mt-4 font-display text-4xl font-extrabold text-ink">{value}</p>
      {sub && <p className="mt-2 text-xs font-semibold text-muted">{sub}</p>}
      <div className="mt-4 h-1 w-full rounded-full bg-surface overflow-hidden">
        <div className="h-full bg-teal/40 transition-all duration-500 group-hover:w-full group-hover:bg-teal" style={{ width: '40%' }} />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    apiRequest<Stats>("/api/admin/stats", { token })
      .then(setStats)
      .catch((err: unknown) => {
        setError(err instanceof ApiRequestError ? err.message : "Failed to load stats");
      });
  }, [token]);

  return (
    <AdminShell>
      <div className="max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-teal">Overview</span>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-ink md:text-4xl">Dashboard</h1>
          <p className="mt-2 text-sm text-muted">Analytics and content status across Flowmetrics.</p>
        </div>

        {error && (
          <div role="alert" className="mt-6 rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!stats && !error && (
          <div className="mt-10 flex items-center gap-3 text-sm text-muted">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal border-t-transparent" />
            Loading dashboard statistics…
          </div>
        )}

        {stats && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Pricing Plans"
              value={stats.totalPlans}
              sub="Live plans on landing page"
              icon="◈"
              badgeColor="bg-teal"
            />
            <StatCard
              label="Blog Posts"
              value={stats.totalPosts}
              sub={`${stats.publishedPosts} published · ${stats.draftPosts} draft`}
              icon="✦"
              badgeColor="bg-blue"
            />
            <StatCard
              label="Featured Articles"
              value={stats.featuredPosts}
              sub="Highlighted on blog home"
              icon="★"
              badgeColor="bg-indigo-600"
            />
          </div>
        )}

        {/* Quick actions grid */}
        <div className="mt-12">
          <h2 className="text-lg font-bold text-ink mb-4">Quick Management Actions</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/admin/team"
              className="group flex flex-col justify-between rounded-2xl border border-line bg-white/95 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-teal/40"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10 text-teal font-bold text-lg mb-4">
                  👥
                </div>
                <h3 className="font-bold text-ink text-base group-hover:text-teal">Team Progress Analytics</h3>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  Monitor employee work logs, capacity utilization, and workload bottlenecks.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-teal">
                View Team Progress →
              </span>
            </Link>

            <Link
              href="/admin/pricing"
              className="group flex flex-col justify-between rounded-2xl border border-line bg-white/95 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-teal/40"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue/10 text-blue font-bold text-lg mb-4">
                  ◈
                </div>
                <h3 className="font-bold text-ink text-base group-hover:text-blue">Manage Pricing Plans</h3>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  Add, edit, highlight or modify monthly & annual subscription tiers.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-blue">
                Go to Pricing →
              </span>
            </Link>

            <Link
              href="/admin/blog"
              className="group flex flex-col justify-between rounded-2xl border border-line bg-white/95 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-teal/40"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 font-bold text-lg mb-4">
                  ✦
                </div>
                <h3 className="font-bold text-ink text-base group-hover:text-indigo-600">Manage Blog Posts</h3>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  Create new articles, publish draft posts, or toggle featured badges.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">
                Go to Blog →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
