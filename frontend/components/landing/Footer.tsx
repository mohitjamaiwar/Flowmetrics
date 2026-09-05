import { ButtonLink } from "@/components/ui/Button";

export function Footer() {
  return (
    <footer className="bg-panel text-white">
      <div className="container-page flex flex-col items-start gap-6 border-b border-linedark py-16 md:flex-row md:items-center md:justify-between">
        <h2 className="max-w-md text-2xl font-semibold md:text-3xl">
          Ready to see where your team&apos;s time actually goes?
        </h2>
        <ButtonLink href="#pricing" variant="primary">
          Start free
        </ButtonLink>
      </div>

      <div className="container-page flex flex-col gap-6 py-10 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
        <span className="font-display text-white">Flowmetrics</span>
        <nav aria-label="Footer" className="flex gap-6">
          <a href="#features" className="hover:text-white">
            Features
          </a>
          <a href="#pricing" className="hover:text-white">
            Pricing
          </a>
          <a href="#blog" className="hover:text-white">
            Blog
          </a>
        </nav>
        <span>© {new Date().getFullYear()} Flowmetrics. All rights reserved.</span>
      </div>
    </footer>
  );
}
