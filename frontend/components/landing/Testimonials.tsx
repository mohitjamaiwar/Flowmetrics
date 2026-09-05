import { testimonials } from "@/lib/staticContent";
import { AbstractQuoteMark } from "@/components/ui/AbstractShapes";

export function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-surface bg-dot-pattern py-24 md:py-32">
      <div className="container-page relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal">Customer Voices</span>
          <h2 className="mt-2 text-3xl font-semibold md:text-5xl">Teams that switched, and stayed</h2>
          <p className="mt-4 text-lg text-muted">
            See how forward-thinking engineering & product teams rely on Flowmetrics daily.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="relative flex flex-col items-center text-center rounded-2xl border border-line bg-white/90 p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <AbstractQuoteMark className="mb-4 h-10 w-10 text-teal/30" />
              <blockquote className="flex-1 text-base leading-relaxed text-ink/90 font-medium">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 pt-4 border-t border-line w-full text-sm text-center">
                <div className="font-semibold text-ink">{t.name}</div>
                <div className="text-xs text-muted mt-0.5">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
