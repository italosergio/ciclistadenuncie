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
      {/* Teardrop shape — border-radius: 50% 50% 50% 0 + rotate -45deg
          Same technique as the cluster marker. Three arcs (top-right, bottom-right,
          bottom-left) for roundness, then a straight L to the start for the point. */}
      <g transform="rotate(-45, 14, 14)">
        <path
          d="M 14,2
             A 12,12 0 0,1 26,14
             A 12,12 0 0,1 14,26
             L 2,26
             Z"
          fill="#1a1a2e"
          stroke="#d1d5db"
          strokeWidth="1.2"
          strokeLinejoin="round"
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
