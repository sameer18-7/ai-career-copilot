export default function FeatureCard({ icon: Icon, title, description, color = 'blue' }) {
  const colorMap = {
    blue: { bg: 'rgba(61, 90, 254, 0.1)', color: '#3D5AFE' },
    orange: { bg: 'rgba(255, 107, 53, 0.1)', color: '#FF6B35' },
    teal: { bg: 'rgba(0, 191, 165, 0.1)', color: '#00BFA5' },
    pink: { bg: 'rgba(233, 30, 99, 0.1)', color: '#E91E63' },
    purple: { bg: 'rgba(124, 58, 237, 0.1)', color: '#7C3AED' },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="card card-hover p-6 flex flex-col items-start gap-4 cursor-default">
      <div
        className="icon-badge"
        style={{ background: c.bg, color: c.color }}
      >
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-bold text-navy">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
    </div>
  );
}
