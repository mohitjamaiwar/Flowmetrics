import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { apiRequest } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { BlogPost } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string): Promise<BlogPost | null> {
  if (!slug) return null;
  try {
    return await apiRequest<BlogPost>(`/api/blog/slug/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
  } catch {
    return null;
  }
}

// Dynamic metadata for SEO — title and description match the post.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found — Flowmetrics" };
  return {
    title: `${post.title} — Flowmetrics Blog`,
    description: post.excerpt,
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    // Draft posts produce the same 404 as non-existent ones.
    // The backend already enforces published:true; this is the Next.js response.
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface">
        {/* Back link */}
        <div className="container-page pt-8">
          <Link
            href="/#blog"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors"
          >
            ← Back to blog
          </Link>
        </div>

        {/* Article */}
        <article className="container-page max-w-3xl py-12">
          {/* Meta */}
          <header className="mb-10">
            {post.featured && (
              <span className="mb-4 inline-block rounded-full bg-teal/10 px-3 py-1 text-xs font-medium text-teal-dark">
                Featured
              </span>
            )}
            <h1 className="text-3xl font-semibold leading-snug md:text-4xl">{post.title}</h1>
            <p className="mt-4 text-lg text-muted">{post.excerpt}</p>
            <div className="mt-6 flex items-center gap-3 text-sm text-muted">
              <span className="font-medium text-ink">{post.author}</span>
              <span>·</span>
              <time dateTime={post.publishedAt ?? undefined}>{formatDate(post.publishedAt)}</time>
            </div>
          </header>

          {/* Cover image */}
          {post.coverImage && (
            <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-lg">
              <Image
                src={post.coverImage}
                alt={`Cover image for ${post.title}`}
                fill
                className="object-cover"
                priority
                sizes="(min-width: 768px) 768px, 100vw"
              />
            </div>
          )}

          {/* Sanitized Markdown content */}
          <MarkdownRenderer content={post.content} />
        </article>
      </main>
      <Footer />
    </>
  );
}
