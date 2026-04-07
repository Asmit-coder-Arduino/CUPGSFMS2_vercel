interface CupgsLogoProps {
  size?: number;
  className?: string;
}

export function CupgsLogo({ size = 40, className = "" }: CupgsLogoProps) {
  const uid = "cl";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <radialGradient id={`${uid}-bg`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="60%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#451a03" />
        </radialGradient>
        <linearGradient id={`${uid}-ring`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id={`${uid}-cap`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fefce8" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
        <linearGradient id={`${uid}-book`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fcd34d" />
        </linearGradient>
        <linearGradient id={`${uid}-tassel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id={`${uid}-text`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fcd34d" />
        </linearGradient>
        <filter id={`${uid}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${uid}-softglow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="60" cy="60" r="58" fill="none" stroke="rgba(245,158,11,0.25)" strokeWidth="4" />
      <circle cx="60" cy="60" r="54" fill={`url(#${uid}-bg)`} />
      <circle cx="60" cy="60" r="50" fill="none" stroke={`url(#${uid}-ring)`} strokeWidth="1.5" opacity="0.6" />
      <circle cx="60" cy="60" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 4" />

      {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 60 + 34 * Math.cos(rad);
        const y1 = 60 + 34 * Math.sin(rad);
        const x2 = 60 + 42 * Math.cos(rad);
        const y2 = 60 + 42 * Math.sin(rad);
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(252,211,77,0.12)" strokeWidth="1" />;
      })}

      <g filter={`url(#${uid}-glow)`}>
        <polygon points="60,25 90,38 60,51 30,38" fill={`url(#${uid}-cap)`} opacity="0.95" />
      </g>
      <rect x="47" y="37" width="26" height="14" rx="2" fill="rgba(254,243,199,0.75)" />
      <line x1="30" y1="38" x2="90" y2="38" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />

      <path d="M 87,38 Q 93,38 93,45 Q 93,60 90,65" stroke={`url(#${uid}-tassel)`} strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="90" cy="67" r="3.5" fill="#fbbf24" />
      <line x1="90" y1="67" x2="88" y2="74" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="90" y1="67" x2="90" y2="75" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="90" y1="67" x2="92" y2="74" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />

      <g filter={`url(#${uid}-softglow)`} opacity="0.9">
        <path d="M 32,62 Q 32,78 46,76 L 59,74 L 59,60 Q 46,62 32,62 Z" fill={`url(#${uid}-book)`} opacity="0.85" />
        <path d="M 88,62 Q 88,78 74,76 L 61,74 L 61,60 Q 74,62 88,62 Z" fill={`url(#${uid}-book)`} opacity="0.85" />
        <line x1="60" y1="60" x2="60" y2="74" stroke="rgba(245,158,11,0.6)" strokeWidth="1.5" />
        <line x1="36" y1="66" x2="56" y2="66" stroke="rgba(180,83,9,0.35)" strokeWidth="1" />
        <line x1="36" y1="69" x2="56" y2="69" stroke="rgba(180,83,9,0.35)" strokeWidth="1" />
        <line x1="36" y1="72" x2="52" y2="72" stroke="rgba(180,83,9,0.25)" strokeWidth="1" />
        <line x1="64" y1="66" x2="84" y2="66" stroke="rgba(180,83,9,0.35)" strokeWidth="1" />
        <line x1="64" y1="69" x2="84" y2="69" stroke="rgba(180,83,9,0.35)" strokeWidth="1" />
        <line x1="68" y1="72" x2="84" y2="72" stroke="rgba(180,83,9,0.25)" strokeWidth="1" />
      </g>

      <g opacity="0.8">
        <line x1="20" y1="20" x2="20" y2="26" stroke="#fcd34d" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="17" y1="23" x2="23" y2="23" stroke="#fcd34d" strokeWidth="1.2" strokeLinecap="round" />
      </g>
      <g opacity="0.6">
        <line x1="100" y1="18" x2="100" y2="22" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" />
        <line x1="98" y1="20" x2="102" y2="20" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" />
      </g>

      <text x="60" y="97" textAnchor="middle" fill={`url(#${uid}-text)`} fontSize="11.5" fontWeight="800" fontFamily="'Space Grotesk','Outfit','Inter',sans-serif" letterSpacing="3.5">
        CUPGS
      </text>
      <text x="60" y="108" textAnchor="middle" fill="rgba(252,211,77,0.5)" fontSize="6" fontWeight="600" fontFamily="'Inter',sans-serif" letterSpacing="2">
        BPUT ROURKELA
      </text>

      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => {
        const rad = (deg * Math.PI) / 180;
        const x = 60 + 52 * Math.cos(rad);
        const y = 60 + 52 * Math.sin(rad);
        return <circle key={deg} cx={x} cy={y} r="1.2" fill="rgba(245,158,11,0.35)" />;
      })}
    </svg>
  );
}
