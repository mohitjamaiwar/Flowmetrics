import { ButtonLink } from "@/components/ui/Button";
import { HeroGradientOrbs, GeometricGridRing } from "@/components/ui/AbstractShapes";

function DashboardIllustration() {
  const bars = [38, 62, 45, 74, 58, 81, 66];
  return (
    <div className="relative w-full max-w-lg rounded-2xl border border-linedark bg-panelmuted/90 p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-linedark pb-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs font-medium tracking-wide text-white/50">
          Flowmetrics Workspace Analytics
        </span>
      </div>

      <svg
        viewBox="0 0 420 260"
        className="mt-4 w-full"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Illustration of a team workload dashboard showing daily activity bars and a capacity trend line"
      >
        <line x1="28" y1="28" x2="28" y2="220" stroke="#243347" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="28" y1="220" x2="396" y2="220" stroke="#243347" strokeWidth="1" />

        {bars.map((h, i) => {
          const barWidth = 32;
          const gap = 20;
          const x = 48 + i * (barWidth + gap);
          const barHeight = (h / 100) * 160;
          const y = 220 - barHeight;
          const isPeak = h === Math.max(...bars);
          return (
            <g key={i} className="group transition-all duration-300">
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="4"
                fill={isPeak ? "url(#teal-grad)" : "#0E7C86"}
                opacity={isPeak ? 1 : 0.75}
                className="transition-all duration-300 hover:opacity-100"
              />
            </g>
          );
        })}

        <defs>
          <linearGradient id="teal-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3FA5AE" />
            <stop offset="100%" stopColor="#0E7C86" />
          </linearGradient>
        </defs>

        <path
          d="M48 160 C 90 120, 130 180, 172 110 S 256 90, 300 130 S 360 70, 396 66"
          fill="none"
          stroke="#2F6FED"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="396" cy="66" r="5" fill="#6B95F2" className="animate-pulse" />

        <text x="28" y="16" fill="#8BA0B8" fontSize="11" fontFamily="sans-serif" fontWeight="500">
          Team capacity trend — live status
        </text>
      </svg>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-panel bg-grid-pattern text-white py-24 md:py-32">
      <HeroGradientOrbs />
      <GeometricGridRing className="absolute -top-10 right-10 hidden md:block opacity-30" />

      <div className="container-page relative z-10 flex flex-col items-center text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-light/30 bg-teal/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-teal-light">
          <span className="h-2 w-2 rounded-full bg-teal-light animate-pulse" />
          FLOWMETRICS SAAS PLATFORM
        </span>

        <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
          See where your team&apos;s time and effort actually go.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-white/75 leading-relaxed">
          Flowmetrics turns everyday work activity into clear workload, capacity, and progress data — so you catch problems weeks before a deadline does.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <ButtonLink href="#pricing" variant="primary" className="shadow-lg shadow-teal/20">
            Start free trial
          </ButtonLink>
          <ButtonLink href="#features" variant="ghost">
            See how it works →
          </ButtonLink>
        </div>

        <div className="mt-16 flex w-full justify-center">
          <DashboardIllustration />
        </div>
      </div>
    </section>
  );
}
