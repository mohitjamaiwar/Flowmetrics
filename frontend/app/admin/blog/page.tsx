"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { BlogPost } from "@/types";

function Badge({ label, variant }: { label: string; variant: "green" | "yellow" | "teal" | "gray" }) {
  const cls = {
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    yellow: "bg-amber-50 text-amber-700 border border-amber-200/60",
    teal: "bg-teal/10 text-teal-dark border border-teal/20",
    gray: "bg-slate-100 text-slate-600 border border-slate-200/60",
  }[variant];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

export default function AdminBlogListPage() {
  const { token } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiRequest<BlogPost[]>("/api/admin/blog", { token });
      setPosts(data);
    } catch {
      setGlobalError("Failed to load blog posts.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  function flash(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  async function handleDelete(id: string) {
    try {
      await apiRequest(`/api/admin/blog/${id}`, { method: "DELETE", token: token! });
      flash("Post deleted.");
      setDeleteId(null);
      fetchPosts();
    } catch (err) {
      setGlobalError(err instanceof ApiRequestError ? err.message : "Delete failed.");
    }
  }

  return (
    <AdminShell>
      <div className="max-w-5xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal">Content Management</span>
            <h1 className="mt-1 font-display text-3xl font-extrabold text-ink md:text-4xl">Blog Posts</h1>
            <p className="mt-1 text-sm text-muted">
              Publish and manage blog articles. Drafts remain hidden from the public site.
            </p>
          </div>
          <Link
            href="/admin/blog/new"
            id="create-post-btn"
            className="rounded-full bg-teal px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-teal-dark shadow-md shadow-teal/20"
          >
            + New post
          </Link>
        </div>

        {/* Messages */}
        {globalError && (
          <div role="alert" className="mt-4 rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700">
            {globalError}
          </div>
        )}
        {successMsg && (
          <div role="status" className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4 text-sm text-emerald-700 font-semibold">
            ✓ {successMsg}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="mt-10 flex items-center gap-3 text-sm text-muted">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal border-t-transparent" />
            Loading blog posts…
          </div>
        ) : posts.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-line bg-white/95 p-8 text-center backdrop-blur-md shadow-sm">
            <p className="text-sm font-medium text-muted">No blog posts created yet.</p>
            <Link
              href="/admin/blog/new"
              className="mt-4 inline-block rounded-full bg-teal px-5 py-2 text-xs font-semibold text-white hover:bg-teal-dark"
            >
              + Create First Article
            </Link>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white/95 backdrop-blur-md shadow-xl">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-surface/80 text-left text-xs uppercase tracking-wider font-bold text-muted">
                <tr>
                  {["Title", "Author", "Date", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {posts.map((post) => (
                  <tr key={post._id} className="transition-colors hover:bg-surface/60">
                    <td className="max-w-xs px-6 py-4">
                      <p className="font-bold text-ink truncate">{post.title}</p>
                      <div className="mt-1 flex gap-1.5">
                        {post.featured && <Badge label="★ Featured" variant="teal" />}
                        {!post.published && <Badge label="Draft" variant="yellow" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-muted">{post.author}</td>
                    <td className="px-6 py-4 font-medium text-muted whitespace-nowrap">
                      {post.publishedAt ? formatDate(post.publishedAt) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        label={post.published ? "Published" : "Draft"}
                        variant={post.published ? "green" : "gray"}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/blog/${post._id}`}
                          className="rounded-full bg-teal/10 px-3.5 py-1 text-xs font-semibold text-teal-dark hover:bg-teal hover:text-white transition-all"
                          id={`edit-post-${post._id}`}
                        >
                          Edit
                        </Link>
                        {post.published && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-slate-100 px-3.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-all"
                          >
                            View
                          </a>
                        )}
                        <button
                          onClick={() => setDeleteId(post._id)}
                          className="rounded-full bg-red-50 px-3.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-600 hover:text-white transition-all"
                          id={`delete-post-${post._id}`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete confirmation */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-md px-4">
            <div className="w-full max-w-md text-center rounded-2xl bg-white p-8 shadow-2xl border border-line">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                ⚠️
              </div>
              <h2 className="text-xl font-bold text-ink">Delete this blog post?</h2>
              <p className="mt-2 text-sm text-muted">
                This is permanent. The post will be removed from the database.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 shadow-md"
                  id="confirm-delete-post-btn"
                >
                  Delete Post
                </button>
                <button
                  onClick={() => setDeleteId(null)}
                  className="rounded-full border border-line px-6 py-2.5 text-sm font-medium text-ink hover:bg-surface"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
