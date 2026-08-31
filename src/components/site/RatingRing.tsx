const SIZE_MAP = {
  sm: { box: 40, stroke: 3, font: "text-xs" },
  md: { box: 56, stroke: 4, font: "text-sm" },
  lg: { box: 88, stroke: 5, font: "text-2xl" },
};

export default function RatingRing({
  rating,
  size = "md",
  max = 5,
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
  max?: number;
}) {
  const { box, stroke, font } = SIZE_MAP[size];
  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, rating / max));
  const offset = circumference * (1 - pct);

  const color = rating >= 4 ? "var(--color-accent)" : rating >= 2.5 ? "var(--color-rating)" : "var(--color-danger)";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: box, height: box }}>
      <svg width={box} height={box} className="-rotate-90">
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className={`absolute font-mono font-semibold ${font}`} style={{ color }}>
        {rating > 0 ? rating.toFixed(1) : "—"}
      </span>
    </div>
  );
}
