import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#blog", label: "Blog" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-linedark bg-panel/95 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between" aria-label="Primary">
        <Link href="/" className="font-display text-lg font-semibold text-white">
          Flowmetrics
        </Link>
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="text-sm text-white/70 transition-colors hover:text-white">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <ButtonLink href="/admin/login" variant="ghost" className="hidden sm:inline-flex">
            Admin
          </ButtonLink>
          <ButtonLink href="#pricing" variant="primary">
            Get started
          </ButtonLink>
        </div>
      </nav>
    </header>
  );
}
