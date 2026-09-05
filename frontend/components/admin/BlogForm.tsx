"use client";

/**
 * BlogForm — shared form for creating and editing blog posts.
 *
 * Uses @uiw/react-md-editor for the Markdown editor (admin-only use).
 * The Markdown is stored raw in MongoDB. Sanitization happens at read/render
 * time in MarkdownRenderer.tsx, not here — following the principle that all
 * persisted content is treated as untrusted at display time.
 *
 * The editor is loaded lazily (dynamic import) because it requires browser APIs
 * and is heavy (~120kb). It must NOT be rendered server-side.
 */

import dynamic from "next/dynamic";
import { FormEvent, useState } from "react";
import { ApiRequestError } from "@/lib/api";
import { BlogPost } from "@/types";

// Dynamic import prevents SSR of the Markdown editor (it requires browser APIs).
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface BlogFormProps {
  initial?: BlogPost;
  onSubmit: (body: Record<string, unknown>) => Promise<void>;
  submitLabel: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function input(hasError: boolean) {
  return `w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-ink placeholder-muted/50 transition-colors focus:outline-none focus:border-teal ${
    hasError ? "border-red-400" : "border-line"
  }`;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}

export function BlogForm({ initial, onSubmit, submitLabel }: BlogFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [author, setAuthor] = useState(initial?.author ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [published, setPublished] = useState(initial?.published ?? false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!initial) {
      setSlug(slugify(val));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim(),
        content,
        coverImage: coverImage.trim(),
        author: author.trim(),
        featured,
        published,
      });
    } catch (err) {
      if (err instanceof ApiRequestError && err.fieldErrors) {
        setErrors(err.fieldErrors);
      } else if (err instanceof ApiRequestError) {
        setErrors({ _global: err.message });
      } else {
        setErrors({ _global: "An unexpected error occurred." });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6 rounded-2xl border border-line bg-white/95 p-8 shadow-xl backdrop-blur-md"
    >
      {errors._global && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors._global}
        </div>
      )}

      <Field label="Article Title" error={errors.title}>
        <input
          id="post-title"
          className={input(!!errors.title)}
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          placeholder="How to Identify Team Workload Bottlenecks"
        />
      </Field>

      <Field label="Slug (URL Identifier)" error={errors.slug}>
        <input
          id="post-slug"
          className={input(!!errors.slug)}
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
          required
          placeholder="how-to-identify-team-workload-bottlenecks"
        />
        <p className="mt-1 text-xs text-muted">
          Auto-generated from title. Lowercase letters, numbers, and hyphens only.
        </p>
      </Field>

      <Field label="Excerpt (Displayed on listing and SEO)" error={errors.excerpt}>
        <textarea
          id="post-excerpt"
          rows={3}
          className={input(!!errors.excerpt)}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          required
          placeholder="A short summary shown on the blog listing page…"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Author Name" error={errors.author}>
          <input
            id="post-author"
            className={input(!!errors.author)}
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Priya Nair"
          />
        </Field>
        <Field label="Cover Image URL (HTTPS)" error={errors.coverImage}>
          <input
            id="post-cover"
            type="url"
            className={input(!!errors.coverImage)}
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://images.unsplash.com/photo-…"
          />
        </Field>
      </div>

      {/* Markdown editor */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-ink">
          Content (Markdown)
        </label>
        {errors.content && (
          <p className="mb-1 text-xs text-red-600 font-medium">{errors.content}</p>
        )}
        <div data-color-mode="light" className="overflow-hidden rounded-xl border border-line shadow-sm">
          <MDEditor
            id="post-content"
            value={content}
            onChange={(val) => setContent(val ?? "")}
            height={400}
            preview="live"
          />
        </div>
        <p className="mt-1.5 text-xs text-muted">
          Supports GitHub-Flavored Markdown with live preview.
        </p>
      </div>

      {/* Toggles Panel */}
      <div className="flex flex-wrap gap-6 rounded-xl bg-surface p-4 border border-line">
        <label className="flex items-center gap-2 text-sm font-semibold text-ink cursor-pointer">
          <input
            id="post-featured"
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4 rounded accent-teal"
          />
          Featured Post (Show prominently on blog home)
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink cursor-pointer">
          <input
            id="post-published"
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4 rounded accent-teal"
          />
          Published (Visible on public website)
        </label>
      </div>

      <div className="flex justify-end pt-2 border-t border-line">
        <button
          id="post-save-btn"
          type="submit"
          disabled={submitting}
          className="rounded-full bg-teal px-8 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-teal-dark shadow-md shadow-teal/20 disabled:opacity-60"
        >
          {submitting ? "Saving Article…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
