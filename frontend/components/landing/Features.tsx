import { features } from "@/lib/staticContent";
import { AbstractBlobShape } from "@/components/ui/AbstractShapes";

export function Features() {
  return (
    <section id="features" className="relative overflow-hidden bg-surface bg-dot-pattern py-24 md:py-32">
      <AbstractBlobShape className="absolute -top-10 -left-10 w-72 h-72 text-teal" />
      <AbstractBlobShape className="absolute bottom-0 right-0 w-80 h-80 text-blue" />

      <div className="container-page relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal">Built For Productivity</span>
          <h2 className="mt-2 text-3xl font-semibold md:text-5xl">Built around how work actually happens</h2>
          <p className="mt-4 text-lg text-muted">
            Not another timesheet. Flowmetrics reads signal from the tools your team already uses and turns it into decisions you can act on.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <div
              key={feature.title}
              className="group relative flex flex-col items-center text-center rounded-2xl border border-line bg-white/90 p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-teal/40"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal/10 text-teal transition-transform duration-300 group-hover:scale-110 group-hover:bg-teal group-hover:text-white">
                <span className="text-xl font-bold">0{idx + 1}</span>
              </div>

              <h3 className="text-xl font-semibold text-ink">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{feature.description}</p>

              {/* Bottom Decorative Line */}
              <div className="mt-6 h-1 w-12 rounded-full bg-teal/20 transition-all duration-300 group-hover:w-20 group-hover:bg-teal" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
