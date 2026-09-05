import Image from "next/image";
import Link from "next/link";
import { BlogPost } from "@/types";
import { formatDate } from "@/lib/format";

function PostMeta({ post }: { post: BlogPost }) {
  return (
    <p className="mt-3 text-xs font-medium text-muted">
      By {post.author} · {formatDate(post.publishedAt)}
    </p>
  );
}

function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid gap-8 overflow-hidden rounded-2xl border border-line bg-white shadow-md transition-all duration-300 hover:shadow-2xl hover:border-teal/50 md:grid-cols-2"
    >
      <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto">
        <Image
          src={post.coverImage}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      </div>
      <div className="flex flex-col justify-center p-8 text-left">
        <span className="w-fit rounded-full bg-teal/10 px-3.5 py-1 text-xs font-semibold text-teal-dark">
          ★ Featured Article
        </span>
        <h3 className="mt-4 text-2xl font-bold text-ink transition-colors group-hover:text-teal-dark">
          {post.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>
        <PostMeta post={post} />
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-teal/40"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl">
        <Image
          src={post.coverImage}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, 100vw"
        />
      </div>
      <div className="mt-5 flex flex-col items-center text-center">
        <h3 className="text-lg font-bold text-ink transition-colors group-hover:text-teal-dark">
          {post.title}
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-muted">{post.excerpt}</p>
        <PostMeta post={post} />
      </div>
    </Link>
  );
}

export function Blog({ posts }: { posts: BlogPost[] }) {
  const [featured, ...rest] = posts;

  return (
    <section id="blog" className="relative overflow-hidden bg-white bg-grid-pattern-light py-24 md:py-32">
      <div className="container-page relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal">Latest Insights</span>
          <h2 className="mt-2 text-3xl font-semibold md:text-5xl">From the blog</h2>
          <p className="mt-4 text-lg text-muted">
            Notes on workload, focus, and building healthier team habits.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="mt-14 text-center text-muted">New posts are on the way. Check back shortly.</p>
        ) : (
          <div className="mt-16 space-y-12 max-w-5xl mx-auto">
            {featured && <FeaturedPost post={featured} />}
            {rest.length > 0 && (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
