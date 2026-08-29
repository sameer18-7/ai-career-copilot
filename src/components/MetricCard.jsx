import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ icon: Icon, label, value, trend, trendValue, color = 'blue' }) {
  const colorMap = {
    blue: 'icon-badge-blue',
    orange: 'icon-badge-orange',
    teal: 'icon-badge-teal',
    pink: 'icon-badge-pink',
    purple: 'icon-badge-purple',
    success: 'icon-badge-success',
  };

  const isUp = trend === 'up';

  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`icon-badge ${colorMap[color] || colorMap.blue}`}>
        <Icon size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-secondary font-medium mb-1">{label}</p>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-extrabold text-navy leading-none">{value}</span>
          {trendValue && (
            <span className={isUp ? 'trend-up' : 'trend-down'}>
              {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {trendValue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
