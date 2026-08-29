import { Check } from 'lucide-react';

export default function PricingCard({ name, price, period, description, features, cta, highlighted, onCta }) {
  return (
    <div
      className={`card relative p-8 flex flex-col ${
        highlighted
          ? 'border-2 border-royal-blue scale-105 shadow-glow z-10'
          : 'border border-gray-100'
      }`}
      style={{ borderRadius: 'var(--radius-xl)' }}
    >
      {highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1.5 rounded-full bg-royal-blue text-white text-xs font-bold uppercase tracking-wider">
            Most Popular
          </span>
        </div>
      )}

      <h3 className="text-lg font-bold text-navy mb-1">{name}</h3>
      <p className="text-sm text-text-secondary mb-5">{description}</p>

      <div className="flex items-baseline gap-1 mb-6">
        {typeof price === 'number' ? (
          <>
            <span className="text-4xl font-extrabold text-navy">${price}</span>
            <span className="text-text-secondary text-sm">/{period || 'mo'}</span>
          </>
        ) : (
          <span className="text-2xl font-extrabold text-navy">{price}</span>
        )}
      </div>

      <ul className="flex-1 space-y-3 mb-8" style={{ listStyle: 'none' }}>
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
            <div className="w-5 h-5 rounded-full bg-blue-light flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check size={12} className="text-royal-blue" />
            </div>
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={onCta}
        className={`btn w-full ${highlighted ? 'btn-primary' : 'btn-outline'}`}
      >
        {cta}
      </button>
    </div>
  );
}
