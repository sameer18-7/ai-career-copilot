import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CTABanner({ 
  headline = "Start your career journey today",
  subtext = "Join thousands of students already using AI Career Copilot to land their dream jobs.",
  showEmail = true 
}) {
  return (
    <section className="gradient-hero py-20 relative overflow-hidden">
      {/* Dot grid decoration */}
      <div className="absolute inset-0 dot-grid opacity-30" />
      
      <div className="container relative z-10 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
          {headline}
        </h2>
        <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
          {subtext}
        </p>

        {showEmail ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full sm:flex-1 px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 text-sm backdrop-blur-sm"
            />
            <button className="btn btn-white btn-sm whitespace-nowrap">
              Get Started <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4">
            <Link to="/signup" className="btn btn-white no-underline">
              Get Started Free <ArrowRight size={16} />
            </Link>
            <Link to="/features" className="btn btn-outline-white no-underline">
              Learn More
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
