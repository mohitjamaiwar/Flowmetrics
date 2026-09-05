import { PricingPlan } from "@/types";
import { ButtonLink } from "@/components/ui/Button";
import { AbstractBlobShape } from "@/components/ui/AbstractShapes";

function PlanCard({ plan }: { plan: PricingPlan }) {
  const isHighlighted = plan.highlighted;

  return (
    <div
      className={`relative flex flex-col items-center text-center rounded-2xl p-8 transition-all duration-300 ${
        isHighlighted
          ? "bg-panel text-white shadow-2xl ring-2 ring-teal-light/50 scale-105 z-10"
          : "border border-line bg-white/95 text-ink shadow-sm hover:shadow-lg"
      }`}
    >
      {isHighlighted && (
        <AbstractBlobShape className="absolute top-0 right-0 w-36 h-36 opacity-30" />
      )}

      {isHighlighted && (
        <span className="mb-4 inline-block rounded-full bg-teal-light/20 px-4 py-1 text-xs font-semibold text-teal-light tracking-wide">
          ★ MOST POPULAR CHOICE
        </span>
      )}

      <h3 className="font-display text-2xl font-bold">{plan.name}</h3>

      <div className="mt-6 flex items-baseline justify-center gap-1">
        <span className="text-4xl font-extrabold tracking-tight">${plan.price}</span>
        <span className={`text-sm font-medium ${isHighlighted ? "text-white/60" : "text-muted"}`}>
          / {plan.billingCycle === "monthly" ? "month" : "year"}
        </span>
      </div>

      <div className="my-6 h-px w-full bg-current opacity-10" />

      <ul className="flex-1 space-y-3.5 text-sm text-left w-full max-w-xs">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-3">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                isHighlighted ? "bg-teal-light/20 text-teal-light" : "bg-teal/10 text-teal"
              }`}
            >
              ✓
            </span>
            <span className={isHighlighted ? "text-white/90" : "text-ink/90"}>{feature}</span>
          </li>
        ))}
      </ul>

      <ButtonLink
        href="/admin/login"
        variant={isHighlighted ? "primary" : "secondary"}
        className="mt-8 w-full shadow-md"
      >
        Choose {plan.name}
      </ButtonLink>
    </div>
  );
}

export function Pricing({ plans }: { plans: PricingPlan[] }) {
  return (
    <section id="pricing" className="relative overflow-hidden bg-white bg-grid-pattern-light py-24 md:py-32">
      <div className="container-page relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal">Flexible Plans</span>
          <h2 className="mt-2 text-3xl font-semibold md:text-5xl">Straightforward pricing</h2>
          <p className="mt-4 text-lg text-muted">
            Start free. Upgrade when your team outgrows the basics.
          </p>
        </div>

        {plans.length === 0 ? (
          <p className="mt-14 text-center text-muted">Pricing plans are being updated. Check back shortly.</p>
        ) : (
          <div className="mt-16 grid items-center gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <PlanCard key={plan._id} plan={plan} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
