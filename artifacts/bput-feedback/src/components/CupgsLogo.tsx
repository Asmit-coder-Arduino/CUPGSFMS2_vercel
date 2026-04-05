interface CupgsLogoProps {
  size?: number;
  className?: string;
}

export function CupgsLogo({ size = 40, className = "" }: CupgsLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGrad1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <linearGradient id="logoGrad2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <filter id="logoGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width="100" height="100" rx="22" fill="url(#logoGrad2)" />
      <rect x="2" y="2" width="96" height="96" rx="20" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />

      <polygon
        points="50,14 82,30 82,31 50,47 18,31 18,30"
        fill="url(#logoGrad1)"
        filter="url(#logoGlow)"
      />
      <polygon points="50,47 82,31 82,55 50,71" fill="rgba(255,255,255,0.25)" />
      <polygon points="50,47 18,31 18,55 50,71" fill="rgba(255,255,255,0.18)" />
      <polygon points="50,71 82,55 82,56 50,72 18,56 18,55" fill="rgba(255,255,255,0.12)" />

      <text
        x="50"
        y="92"
        textAnchor="middle"
        fill="white"
        fontSize="13"
        fontWeight="700"
        fontFamily="'Inter','Segoe UI',sans-serif"
        letterSpacing="2"
        opacity="0.95"
      >
        CUPGS
      </text>
    </svg>
  );
}
