export function Sparkline({ className = "", stroke = "#0E7C86" }: { className?: string; stroke?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2 30 C 30 30, 30 10, 58 10 S 86 32, 114 32 S 142 6, 170 6 S 198 26, 226 18 L 238 14"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
