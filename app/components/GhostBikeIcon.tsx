interface GhostBikeIconProps {
  size?: number;
  className?: string;
}

export default function GhostBikeIcon({ size = 28, className }: GhostBikeIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 34 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="wingGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f3f4f6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#f3f4f6" stopOpacity="0" />
        </linearGradient>
        <filter id="ghostGlow">
          <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#f3f4f6" floodOpacity="0.6" />
        </filter>
      </defs>

      <style>{`
        @keyframes ghostWingPulse {
          0%, 100% { opacity: 0.5; filter: drop-shadow(0 0 2px rgba(243,244,246,0.3)); }
          50% { opacity: 1; filter: drop-shadow(0 0 6px rgba(243,244,246,0.7)); }
        }
        .ghost-wings {
          animation: ghostWingPulse 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* Teardrop shape - true teardrop (border-radius: 50% 50% 50% 0 + rotate -45deg) */}
      <g transform="rotate(-45, 17, 17)">
        <path
          d="M 5,17
             A 12,12 0 0,1 17,5
             A 12,12 0 0,1 29,17
             A 12,12 0 0,1 17,29
             L 5,29
             Z"
          fill="#1a1a2e"
          stroke="#d1d5db"
          strokeWidth="1.2"
        />
      </g>

      {/* Wings - left */}
      <path
        d="M 3.5,14 Q -2,12 -5,8 Q -1,13 4,16 Z"
        fill="url(#wingGrad)"
        className="ghost-wings"
      />
      <path
        d="M 4.5,17 Q -1,16 -4,14 Q 0,18 5.5,18.5 Z"
        fill="url(#wingGrad)"
        className="ghost-wings"
        style={{ animationDelay: '0.5s' }}
      />

      {/* Wings - right */}
      <path
        d="M 30.5,14 Q 36,12 39,8 Q 35,13 30,16 Z"
        fill="url(#wingGrad)"
        className="ghost-wings"
        style={{ animationDelay: '0.25s' }}
      />
      <path
        d="M 29.5,17 Q 35,16 38,14 Q 34,18 28.5,18.5 Z"
        fill="url(#wingGrad)"
        className="ghost-wings"
        style={{ animationDelay: '0.75s' }}
      />

      {/* Bike silhouette */}
      <g transform="translate(7, 8) scale(0.85)">
        {/* Rear wheel */}
        <circle cx="5" cy="17" r="4.5" stroke="#f3f4f6" strokeWidth="1.8" fill="none" />
        {/* Front wheel */}
        <circle cx="19" cy="17" r="4.5" stroke="#f3f4f6" strokeWidth="1.8" fill="none" />
        {/* Frame */}
        <polyline
          points="5,17 10,5 19,17"
          stroke="#f3f4f6"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Seat post */}
        <line x1="10" y1="5" x2="10" y2="2" stroke="#f3f4f6" strokeWidth="1.8" strokeLinecap="round" />
        {/* Handlebar hint */}
        <line x1="19" y1="17" x2="21" y2="14" stroke="#f3f4f6" strokeWidth="1.5" strokeLinecap="round" />
        {/* Pedal crank */}
        <line x1="10.5" y1="11" x2="14" y2="12" stroke="#f3f4f6" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}
