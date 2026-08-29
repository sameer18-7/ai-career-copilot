import { useState } from 'react';
import { Check, X, ChevronDown, HelpCircle, Minus } from 'lucide-react';
import PricingCard from '../components/PricingCard';
import CTABanner from '../components/CTABanner';
import Footer from '../components/Footer';

const plans = [
  {
    name: 'Free / Student',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Perfect for getting started with your career journey.',
    features: [
      '1 Resume scan per month',
      'Basic ATS Score',
      'Top 3 Skill Gap insights',
      '1 Learning Path',
      '5 Job Matches per day',
      'Community support',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    monthlyPrice: 12,
    annualPrice: 9,
    description: 'For serious job seekers ready to accelerate their career.',
    features: [
      'Unlimited resume scans',
      'Full ATS Score + breakdown',
      'Complete Skill Gap Analysis',
      'All Learning Paths + Quizzes',
      'AI Interview Coach (unlimited)',
      'Priority Job Matching',
      'AI Tutor access',
      'Career Analytics Dashboard',
      'Email support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Campus / Enterprise',
    monthlyPrice: 'Contact Us',
    annualPrice: 'Contact Us',
    description: 'For universities, bootcamps, and career centers.',
    features: [
      'Everything in Pro',
      'Bulk student licensing',
      'Admin dashboard & analytics',
      'Custom branding',
      'API access',
      'Dedicated account manager',
      'SSO integration',
      'Priority support',
    ],
    cta: 'Contact Sales',
  },
];

const comparisonFeatures = [
  { name: 'Resume Analyzer', free: '1/month', pro: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'ATS Score', free: 'Basic', pro: 'Full + Breakdown', enterprise: 'Full + Breakdown' },
  { name: 'Skill Gap Analysis', free: 'Top 3 only', pro: true, enterprise: true },
  { name: 'Learning Paths', free: '1 path', pro: 'All paths', enterprise: 'All + Custom' },
  { name: 'Adaptive Quizzes', free: false, pro: true, enterprise: true },
  { name: 'AI Tutor', free: false, pro: true, enterprise: true },
  { name: 'AI Interview Coach', free: false, pro: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Job Matching', free: '5/day', pro: 'Priority', enterprise: 'Priority + API' },
  { name: 'Analytics Dashboard', free: false, pro: true, enterprise: 'Advanced' },
  { name: 'Support', free: 'Community', pro: 'Email', enterprise: 'Dedicated Manager' },
  { name: 'Admin Dashboard', free: false, pro: false, enterprise: true },
  { name: 'Custom Branding', free: false, pro: false, enterprise: true },
];

const faqs = [
  {
    q: 'Is AI Career Copilot really free for students?',
    a: 'Yes! Our Free plan gives you access to core features at no cost. You can scan 1 resume per month, get basic skill gap insights, and receive 5 job matches daily. No credit card required.',
  },
  {
    q: 'What happens after my free trial ends?',
    a: 'Your Pro free trial lasts 14 days. After that, you can continue with the Free plan or upgrade to Pro. You won\'t lose any data.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Absolutely. You can cancel your Pro subscription at any time from your account settings. Your access continues until the end of your billing period.',
  },
  {
    q: 'Do you offer student discounts?',
    a: 'Our Free plan is designed specifically for students. Additionally, we offer special bulk pricing for universities and bootcamps through our Campus plan.',
  },
  {
    q: 'How does the Campus/Enterprise plan work?',
    a: 'We offer flexible licensing for educational institutions. Contact our sales team for a custom quote based on your student count and specific needs.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. We use industry-standard encryption, GDPR-compliant data practices, and never share your personal data with employers without your explicit consent.',
  },
];

function CellValue({ value }) {
  if (value === true) {
    return (
      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mx-auto">
        <Check size={14} className="text-green-600" />
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
        <Minus size={14} className="text-gray-400" />
      </div>
    );
  }
  return <span className="text-sm text-navy font-medium">{value}</span>;
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="pt-[72px]">
      {/* Header */}
      <section className="gradient-blue-subtle py-16 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid-dark opacity-30" />
        <div className="container relative z-10 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-navy tracking-tight mb-4">
            Simple Pricing for Every Student
          </h1>
          <p className="text-text-secondary max-w-lg mx-auto text-lg mb-8">
            Start free. Upgrade when you're ready. No hidden fees, no surprises.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!annual ? 'text-navy' : 'text-text-secondary'}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className="relative w-14 h-7 rounded-full transition-colors"
              style={{
                background: annual ? '#3D5AFE' : '#D1D5DB',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <div
                className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                style={{ left: annual ? '32px' : '4px' }}
              />
            </button>
            <span className={`text-sm font-medium ${annual ? 'text-navy' : 'text-text-secondary'}`}>
              Annual
            </span>
            {annual && (
              <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold animate-scale-in">
                Save 25%
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 -mt-4">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto items-start">
            {plans.map((plan, i) => (
              <PricingCard
                key={i}
                name={plan.name}
                price={typeof plan.monthlyPrice === 'number' ? (annual ? plan.annualPrice : plan.monthlyPrice) : plan.monthlyPrice}
                period={typeof plan.monthlyPrice === 'number' ? (annual ? 'mo (billed annually)' : 'mo') : undefined}
                description={plan.description}
                features={plan.features}
                cta={plan.cta}
                highlighted={plan.highlighted}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="section bg-bg-light">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-extrabold text-navy text-center tracking-tight mb-10">
            Feature Comparison
          </h2>

          <div className="max-w-4xl mx-auto card overflow-hidden" style={{ borderRadius: 'var(--radius-xl)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr className="bg-bg-light">
                    <th className="text-left text-xs font-bold text-navy uppercase tracking-wider px-6 py-4 sticky left-0 bg-bg-light z-10" style={{ minWidth: '200px' }}>Feature</th>
                    <th className="text-center text-xs font-bold text-text-secondary uppercase tracking-wider px-4 py-4 w-[140px]">Free</th>
                    <th className="text-center text-xs font-bold text-royal-blue uppercase tracking-wider px-4 py-4 w-[140px]">
                      Pro
                      <span className="block text-[10px] font-normal text-royal-blue/70 mt-0.5">Most Popular</span>
                    </th>
                    <th className="text-center text-xs font-bold text-text-secondary uppercase tracking-wider px-4 py-4 w-[140px]">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, i) => (
                    <tr key={i} className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-6 py-3.5 text-sm text-gray-700 font-medium sticky left-0 z-10" style={{ background: i % 2 === 0 ? 'white' : '#FAFBFC' }}>{row.name}</td>
                      <td className="px-4 py-3.5 text-center"><CellValue value={row.free} /></td>
                      <td className="px-4 py-3.5 text-center bg-blue-50/30"><CellValue value={row.pro} /></td>
                      <td className="px-4 py-3.5 text-center"><CellValue value={row.enterprise} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-white">
        <div className="container max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-text-secondary">Everything you need to know about our pricing.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="card overflow-hidden" style={{ borderRadius: 'var(--radius-card)' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-bg-light/50 transition-colors"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <span className="text-sm font-semibold text-navy pr-4">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-text-secondary flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 -mt-1">
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + Footer */}
      <CTABanner
        headline="Ready to accelerate your career?"
        subtext="Join thousands of students already landing their dream jobs with AI."
        showEmail={false}
      />
      <Footer />
    </div>
  );
}
