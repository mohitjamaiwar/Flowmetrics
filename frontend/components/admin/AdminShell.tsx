"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { HeroGradientOrbs } from "@/components/ui/AbstractShapes";

interface Props {
  children: React.ReactNode;
}

/**
 * Wraps every protected admin page.
 * - Redirects to /admin/login if no valid token is present.
 * - Renders the sidebar + main content layout with structured background.
 */
export function AdminShell({ children }: Props) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="relative flex h-screen overflow-hidden bg-surface bg-dot-pattern selection:bg-teal/20 selection:text-teal-dark">
      {/* Background Orbs */}
      <HeroGradientOrbs />

      <AdminSidebar />
      <div className="relative z-10 flex flex-1 flex-col overflow-y-auto">
        <main className="flex-1 p-8 md:p-12">{children}</main>
      </div>
    </div>
  );
}
