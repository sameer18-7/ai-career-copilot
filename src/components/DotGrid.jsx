export default function DotGrid({ className = '', style = {} }) {
  return (
    <div
      className={`absolute pointer-events-none dot-grid ${className}`}
      style={{
        width: '200px',
        height: '200px',
        opacity: 0.4,
        ...style,
      }}
    />
  );
}
