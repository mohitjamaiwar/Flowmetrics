"use client";

import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { BlogForm } from "@/components/admin/BlogForm";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function AdminNewPostPage() {
  const router = useRouter();
  const { token } = useAuth();

  async function handleCreate(body: Record<string, unknown>) {
    await apiRequest("/api/admin/blog", {
      method: "POST",
      body,
      token: token!,
    });
    router.push("/admin/blog");
  }

  return (
    <AdminShell>
      <div className="max-w-3xl">
        <div className="mb-8">
          <a
            href="/admin/blog"
            className="text-sm text-muted hover:text-ink"
          >
            ← Back to posts
          </a>
          <h1 className="mt-3 text-2xl font-semibold text-ink">New post</h1>
        </div>

        <div className="rounded-lg border border-line bg-white p-8">
          <BlogForm onSubmit={handleCreate} submitLabel="Create post" />
        </div>
      </div>
    </AdminShell>
  );
}
