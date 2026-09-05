import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { Blog } from "@/components/landing/Blog";
import { Footer } from "@/components/landing/Footer";
import { apiRequest } from "@/lib/api";
import { PricingPlan, BlogPost } from "@/types";

// Server Component — fetches data at request time via SSR.
// Using cache: 'no-store' keeps pricing/blog always fresh.
// A real production app might use { next: { revalidate: 60 } } (ISR).
async function getPricingPlans(): Promise<PricingPlan[]> {
  try {
    return await apiRequest<PricingPlan[]>("/api/pricing", { cache: "no-store" });
  } catch {
    return [];
  }
}

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    return await apiRequest<BlogPost[]>("/api/blog", { cache: "no-store" });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [plans, posts] = await Promise.all([getPricingPlans(), getBlogPosts()]);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Pricing plans={plans} />
        <Testimonials />
        <Blog posts={posts} />
      </main>
      <Footer />
    </>
  );
}
