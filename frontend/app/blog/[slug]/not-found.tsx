import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function BlogNotFound() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-[60vh] flex-col items-center justify-center bg-surface px-4 text-center">
        <p className="text-5xl font-semibold text-ink">404</p>
        <h1 className="mt-4 text-xl font-medium text-ink">Post not found</h1>
        <p className="mt-3 text-sm text-muted">
          This post may have been removed, or it isn&apos;t publicly available yet.
        </p>
        <Link
          href="/#blog"
          className="mt-8 inline-flex items-center rounded-full bg-teal px-6 py-3 text-sm font-medium text-white hover:bg-teal-dark"
        >
          ← Back to blog
        </Link>
      </main>
      <Footer />
    </>
  );
}
