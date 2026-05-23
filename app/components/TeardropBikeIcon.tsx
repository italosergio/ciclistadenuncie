interface TeardropBikeIconProps {
  size?: number;
  color?: "white" | "red";
  className?: string;
}

const bikePath =
  "M12 17.5V14l-3-3 4-3 2 3h2";

export default function TeardropBikeIcon({
  size = 28,
  color = "white",
  className,
}: TeardropBikeIconProps) {
  const bikeColor = color === "red" ? "#ef4444" : "#f3f4f6";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Teardrop shape — rotated rounded square (diamond/lozenge) */}
      <g transform="rotate(-45, 14, 14)">
        <rect
          x="2"
          y="2"
          width="24"
          height="24"
          rx="12"
          ry="12"
          fill="#1a1a2e"
          stroke="#d1d5db"
          strokeWidth="1.2"
        />
      </g>

      {/* Lucide Bike icon centered inside */}
      <g transform="translate(3.8, 3.8) scale(0.85)">
        {/* Rear wheel */}
        <circle
          cx="5.5"
          cy="17.5"
          r="3.5"
          stroke={bikeColor}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Front wheel */}
        <circle
          cx="18.5"
          cy="17.5"
          r="3.5"
          stroke={bikeColor}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Seat / top tube joint */}
        <circle
          cx="15"
          cy="5"
          r="1"
          stroke={bikeColor}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Frame */}
        <path
          d={bikePath}
          stroke={bikeColor}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
