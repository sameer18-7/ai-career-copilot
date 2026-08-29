export default function CircularGauge({ value, max = 100, size = 160, strokeWidth = 12, label }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / max) * circumference;
  const remaining = circumference - progress;

  // Color based on percentage
  const pct = (value / max) * 100;
  let color = '#10B981'; // green
  if (pct < 50) color = '#EF4444'; // red
  else if (pct < 75) color = '#F59E0B'; // yellow

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${progress} ${remaining}`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-navy">{value}</span>
          <span className="text-xs text-text-secondary font-medium">/ {max}</span>
        </div>
      </div>
      {label && (
        <span className="text-sm font-semibold text-navy">{label}</span>
      )}
    </div>
  );
}
