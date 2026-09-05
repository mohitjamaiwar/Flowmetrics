"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "⬡" },
  { href: "/admin/team", label: "Team Progress", icon: "👥" },
  { href: "/admin/pricing", label: "Pricing Plans", icon: "◈" },
  { href: "/admin/blog", label: "Blog Posts", icon: "✦" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/admin/login");
  }

  return (
    <aside className="relative z-20 flex h-screen w-64 flex-col border-r border-linedark bg-panel/95 backdrop-blur-xl text-white shadow-xl">
      {/* Brand Header */}
      <div className="border-b border-linedark/80 px-6 py-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal text-white font-bold text-sm shadow-md shadow-teal/30 group-hover:scale-105 transition-transform">
            FM
          </div>
          <div>
            <span className="font-display text-base font-bold text-white tracking-tight">
              Flowmetrics
            </span>
            <span className="block text-[10px] font-semibold tracking-wider text-teal-light uppercase">
              Admin Workspace
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Admin navigation">
        <div className="mb-2 px-3 text-[11px] font-bold tracking-wider text-white/40 uppercase">
          Management
        </div>
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-teal/20 text-teal-light border border-teal/40 shadow-sm"
                      : "text-white/65 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className={`text-base ${isActive ? "text-teal-light" : "text-white/40"}`} aria-hidden="true">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User profile + Logout */}
      <div className="border-t border-linedark/80 p-4">
        {user && (
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-panelmuted/80 p-3 border border-linedark">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-dark text-white font-semibold text-xs border border-teal/30">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white">{user.name}</p>
              <p className="truncate text-[11px] text-white/50">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-linedark bg-white/5 py-2.5 text-xs font-semibold text-white/70 transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
          id="admin-logout-btn"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
