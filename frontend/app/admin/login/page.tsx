"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { AuthUser } from "@/types";
import { HeroGradientOrbs, GeometricGridRing } from "@/components/ui/AbstractShapes";

interface LoginResponse {
  token: string;
  user: AuthUser;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      login(data.token, data.user);

      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/employee");
      }
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-panel bg-grid-pattern px-4 overflow-hidden text-white py-12">
      <HeroGradientOrbs />
      <GeometricGridRing className="absolute -top-10 left-10 opacity-20 hidden md:block" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-light/30 bg-teal/10 px-3.5 py-1 text-xs font-semibold text-teal-light tracking-wide mb-3">
            FLOWMETRICS WORKSPACE PORTAL
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Sign In</h1>
          <p className="mt-2 text-sm text-white/70">Access Admin Console or Employee Progress Workspace</p>
        </div>

        {/* Center Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-linedark bg-panelmuted/90 p-8 shadow-2xl backdrop-blur-xl"
          noValidate
        >
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/90">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-linedark bg-panel/80 px-4 py-3 text-sm text-white placeholder-white/40 transition-colors focus:border-teal-light focus:outline-none"
                placeholder="admin@flowmetrics.dev"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white/90">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-linedark bg-panel/80 px-4 py-3 text-sm text-white placeholder-white/40 transition-colors focus:border-teal-light focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-full bg-teal py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-teal-dark shadow-lg shadow-teal/20 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/50">
          Flowmetrics Authentication Portal · Role-based access control.
        </p>
      </div>
    </div>
  );
}
