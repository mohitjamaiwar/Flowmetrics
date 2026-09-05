import React from "react";

export function HeroGradientOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Primary Teal Ambient Orb */}
      <div 
        className="absolute -top-24 -left-20 h-96 w-96 rounded-full bg-teal/20 blur-3xl opacity-60" 
      />
      {/* Secondary Blue Ambient Orb */}
      <div 
        className="absolute top-1/2 -right-20 h-96 w-96 rounded-full bg-blue/20 blur-3xl opacity-60" 
      />
      {/* Center Subtle Accent Orb */}
      <div 
        className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-teal-light/10 blur-3xl opacity-40" 
      />
    </div>
  );
}

export function GeometricGridRing({ className = "w-64 h-64" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`pointer-events-none text-teal-light/20 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
      <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="1.5" />
      <polygon points="100,10 120,40 80,40" fill="currentColor" opacity="0.5" />
      <polygon points="190,100 160,120 160,80" fill="currentColor" opacity="0.5" />
      <polygon points="100,190 80,160 120,160" fill="currentColor" opacity="0.5" />
      <polygon points="10,100 40,80 40,120" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

export function AbstractBlobShape({ className = "w-40 h-40" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`pointer-events-none opacity-20 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="blob-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3FA5AE" />
          <stop offset="100%" stopColor="#2F6FED" />
        </linearGradient>
      </defs>
      <path
        fill="url(#blob-grad)"
        d="M44.7,-76.4C58,-69.2,69,-57.8,76.8,-44.2C84.7,-30.5,89.5,-15.3,88.7,-0.5C87.9,14.4,81.5,28.8,73.1,41.9C64.6,55,54,66.8,40.9,73.8C27.8,80.8,13.9,83,-0.6,84C-15,85,-30,84.9,-43.6,78.8C-57.1,72.7,-69.2,60.6,-77,-46.3C-84.8,-32,-88.3,-16,-87,-0.8C-85.7,14.5,-79.6,29,-70.6,40.9C-61.6,52.8,-49.7,62.1,-36.7,68.9C-23.7,75.7,-9.6,80,4.2,73.5C18,67,31.4,83.6,44.7,-76.4Z"
        transform="translate(100 100)"
      />
    </svg>
  );
}

export function AbstractQuoteMark({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="currentColor"
      className={`text-teal/20 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12 8C7.58172 8 4 11.5817 4 16V28C4 30.2091 5.79086 32 8 32H16C18.2091 32 20 30.2091 20 28V20C20 17.7909 18.2091 16 16 16H12C12 13.7909 13.7909 12 16 12V8H12ZM28 8C23.5817 8 20 11.5817 20 16V28C20 30.2091 21.7909 32 24 32H32C34.2091 32 36 30.2091 36 28V20C36 17.7909 34.2091 16 32 16H28C28 13.7909 29.7909 12 32 12V8H28Z" />
    </svg>
  );
}
