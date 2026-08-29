import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Eye, EyeOff, TrendingUp, BarChart3 } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Blue */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12" style={{ background: 'linear-gradient(160deg, #1A237E 0%, #3D5AFE 50%, #6366F1 100%)' }}>
        <div className="absolute inset-0 dot-grid opacity-15" />
        <div className="relative z-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-white no-underline mb-16">
            <div className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <Rocket size={20} className="text-white" />
            </div>
            AI Career Copilot
          </Link>

          {/* Headline */}
          <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight mb-6">
            Welcome back.<br />
            Keep building<br />
            your career.
          </h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-sm mb-10">
            Continue where you left off. Your dashboard, learning paths, and job matches are waiting.
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-3">
            <span className="pill-badge" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}>
              📊 Track Progress
            </span>
            <span className="pill-badge" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}>
              🎯 Close Skill Gaps
            </span>
            <span className="pill-badge" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}>
              💼 Land Jobs
            </span>
          </div>
        </div>

        {/* Floating dashboard mini card */}
        <div className="relative z-10">
          <div className="card-float p-5 rounded-2xl inline-block animate-float" style={{ background: 'rgba(255,255,255,0.95)' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingUp size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-navy">Your ATS Score</p>
                <p className="text-2xl font-extrabold text-green-600">87%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 font-extrabold text-xl text-navy mb-10">
            <div className="w-9 h-9 rounded-lg gradient-blue flex items-center justify-center">
              <Rocket size={20} className="text-white" />
            </div>
            AI Career Copilot
          </div>

          <h2 className="text-2xl font-extrabold text-navy mb-1">Log in to your account</h2>
          <p className="text-sm text-text-secondary mb-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-royal-blue font-semibold hover:underline no-underline">
              Sign up
            </Link>
          </p>

          {/* Social Login */}
          <div className="flex gap-3 mb-6">
            <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm font-medium text-navy hover:bg-bg-light transition-colors" style={{ background: 'white', cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm font-medium text-navy hover:bg-bg-light transition-colors" style={{ background: 'white', cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-text-muted font-medium">or log in with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div>
              <label className="text-sm font-medium text-navy mb-1.5 block">Email</label>
              <input
                type="email"
                placeholder="saksham@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-royal-blue/20 focus:border-royal-blue transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-navy mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-royal-blue/20 focus:border-royal-blue transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-navy transition-colors"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-royal-blue w-4 h-4 rounded" />
                <span className="text-sm text-text-secondary">Remember me</span>
              </label>
              <a href="#" className="text-sm text-royal-blue font-medium hover:underline">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg mt-2">
              Log In
            </button>
          </form>

          {/* Footer micro-links */}
          <div className="flex items-center justify-center gap-4 mt-8 text-xs text-text-muted">
            <a href="#" className="hover:text-navy transition-colors">Terms</a>
            <span>·</span>
            <a href="#" className="hover:text-navy transition-colors">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:text-navy transition-colors">Help</a>
          </div>
        </div>
      </div>
    </div>
  );
}
