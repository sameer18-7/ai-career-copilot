export default function PillBadge({ children, icon: Icon, className = '' }) {
  return (
    <span className={`pill-badge ${className}`}>
      {Icon && <Icon size={14} />}
      {children}
    </span>
  );
}
