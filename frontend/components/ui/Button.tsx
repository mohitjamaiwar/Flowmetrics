import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface BaseProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-teal text-white hover:bg-teal-dark",
  secondary: "bg-transparent text-ink border border-line hover:border-ink",
  ghost: "bg-transparent text-white border border-white/30 hover:border-white",
};

const base = "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-colors";

export function ButtonLink({
  href,
  variant = "primary",
  children,
  className = "",
}: BaseProps & { href: string }) {
  return (
    <Link href={href} className={`${base} ${variantClasses[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  children,
  className = "",
  ...rest
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${base} ${variantClasses[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
