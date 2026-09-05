"use client";

import { AuthProvider } from "@/lib/auth";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
