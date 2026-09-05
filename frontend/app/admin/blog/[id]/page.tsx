"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { BlogForm } from "@/components/admin/BlogForm";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { BlogPost } from "@/types";

export default function AdminEditPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { token } = useAuth();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !id) return;
    apiRequest<BlogPost>(`/api/admin/blog/${id}`, { token })
      .then(setPost)
      .catch((err: unknown) => {
        setError(err instanceof ApiRequestError ? err.message : "Failed to load post.");
      })
      .finally(() => setLoading(false));
  }, [token, id]);

  async function handleUpdate(body: Record<string, unknown>) {
    await apiRequest(`/api/admin/blog/${id}`, {
      method: "PUT",
      body,
      token: token!,
    });
    router.push("/admin/blog");
  }

  return (
    <AdminShell>
      <div className="max-w-3xl">
        <div className="mb-8">
          <a href="/admin/blog" className="text-sm text-muted hover:text-ink">
            ← Back to posts
          </a>
          <h1 className="mt-3 text-2xl font-semibold text-ink">Edit post</h1>
        </div>

        {error && (
          <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && <p className="text-sm text-muted">Loading…</p>}

        {!loading && post && (
          <div className="rounded-lg border border-line bg-white p-8">
            <BlogForm initial={post} onSubmit={handleUpdate} submitLabel="Save changes" />
          </div>
        )}
      </div>
    </AdminShell>
  );
}
