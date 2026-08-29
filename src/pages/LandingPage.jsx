import { Link } from 'react-router-dom';
import {
  FileText, Target, BookOpen, Mic, Briefcase, ArrowRight, Play,
  Upload, Search, Brain, Award, Sparkles, Star, Quote,
  CheckCircle, Zap, TrendingUp, Users, BarChart3
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import FeatureCard from '../components/FeatureCard';
import PillBadge from '../components/PillBadge';
import CTABanner from '../components/CTABanner';
import Footer from '../components/Footer';

/* ─── Mini chart data for dashboard mockup ─── */
const chartData = [
  { name: 'Jan', value: 40 }, { name: 'Feb', value: 55 },
  { name: 'Mar', value: 48 }, { name: 'Apr', value: 72 },
  { name: 'May', value: 65 }, { name: 'Jun', value: 87 },
];

/* ─── Testimonials ─── */
const testimonials = [
  {
    name: 'Priya Sharma',
    university: 'IIT Delhi',
    quote: 'AI Career Copilot helped me identify my skill gaps and land a role at Google within 3 months. The interview coach was a game-changer!',
    avatar: 'PS',
    rating: 5,
  },
  {
    name: 'Alex Chen',
    university: 'Stanford University',
    quote: 'The resume analyzer boosted my ATS score from 52 to 91. I started getting callbacks within a week. Absolutely incredible platform.',
    avatar: 'AC',
    rating: 5,
  },
  {
    name: 'Maria Rodriguez',
    university: 'MIT',
    quote: 'The personalized learning paths were exactly what I needed. Instead of random courses, I got a structured roadmap tailored to my dream role.',
    avatar: 'MR',
    rating: 5,
  },
];

/* ─── How it Works Steps ─── */
const steps = [
  { icon: Upload, label: 'Upload Resume', desc: 'Drop your PDF resume' },
  { icon: Search, label: 'Analyze Gaps', desc: 'AI identifies skill gaps' },
  { icon: BookOpen, label: 'Learn & Grow', desc: 'Personalized courses' },
  { icon: Mic, label: 'Mock Practice', desc: 'AI interview coaching' },
  { icon: Award, label: 'Get Placed', desc: 'Land your dream job' },
];

/* ─── Features ─── */
const features = [
  { icon: FileText, title: 'Resume Parsing', description: 'NLP-powered resume analysis extracts skills, education, and experience automatically with ATS scoring.', color: 'blue' },
  { icon: Target, title: 'Skill Gap Analysis', description: 'Compare your profile against market demands with visual radar charts showing exactly what to learn.', color: 'orange' },
  { icon: BookOpen, title: 'Learning Paths', description: 'AI-generated personalized learning roadmaps with adaptive quizzes that adjust to your pace.', color: 'teal' },
  { icon: Mic, title: 'AI Interview Coach', description: 'Practice with company-specific mock interviews (Google, Amazon, etc.) and get instant AI feedback.', color: 'pink' },
  { icon: Briefcase, title: 'Job Matching', description: 'Smart job recommendations with match percentages, salary predictions, and skill compatibility tags.', color: 'purple' },
];

export default function LandingPage() {
  return (
    <div>
      {/* ─── HERO SECTION ─── */}
      <section className="gradient-hero relative overflow-hidden min-h-screen flex items-center pt-20">
        {/* Decorative elements */}
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        {/* Rocket SVG decoration */}
        <div className="absolute bottom-10 left-10 opacity-20 animate-float hidden lg:block">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="50" fill="white" fillOpacity="0.1" />
            <path d="M60 20 C60 20 80 40 80 65 C80 80 70 90 60 95 C50 90 40 80 40 65 C40 40 60 20 60 20Z" fill="white" fillOpacity="0.3" />
            <circle cx="60" cy="55" r="8" fill="white" fillOpacity="0.5" />
            <path d="M45 80 L35 95 L50 85Z" fill="white" fillOpacity="0.2" />
            <path d="M75 80 L85 95 L70 85Z" fill="white" fillOpacity="0.2" />
            <path d="M52 95 L55 110 L60 100 L65 110 L68 95" fill="white" fillOpacity="0.15" />
          </svg>
        </div>

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-6 animate-fade-in-up">
                <Sparkles size={14} />
                AI-Powered Career Acceleration
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6 animate-fade-in-up delay-100" style={{ animationFillMode: 'both' }}>
                Land Your Dream Job{' '}
                <span className="relative">
                  with AI
                  <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                    <path d="M2 6C50 2 150 2 198 6" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>

              <p className="text-lg text-white/70 max-w-lg mb-8 animate-fade-in-up delay-200 leading-relaxed" style={{ animationFillMode: 'both' }}>
                From resume analysis to job placement — one AI platform that finds your skill gaps, builds your learning path, coaches your interviews, and matches you with perfect roles.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 animate-fade-in-up delay-300" style={{ animationFillMode: 'both' }}>
                <Link to="/signup" className="btn btn-white btn-lg no-underline">
                  Get Started Free <ArrowRight size={18} />
                </Link>
                <button className="btn btn-outline-white btn-lg" style={{ background: 'transparent' }}>
                  <Play size={18} /> Watch Demo
                </button>
              </div>

              {/* Pill Badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 animate-fade-in-up delay-400" style={{ animationFillMode: 'both' }}>
                <PillBadge icon={FileText}>AI Resume Analyzer</PillBadge>
                <PillBadge icon={Target}>Real-Time Job Matching</PillBadge>
                <PillBadge icon={BookOpen}>Adaptive Learning Paths</PillBadge>
                <PillBadge icon={Mic}>Mock Interview Coach</PillBadge>
              </div>
            </div>

            {/* Right: Floating Dashboard Mockup */}
            <div className="relative animate-fade-in-up delay-300 hidden lg:block" style={{ animationFillMode: 'both' }}>
              <div className="relative">
                {/* Main Dashboard Card */}
                <div className="card-float p-6 rounded-2xl" style={{ background: '#FFFFFF', borderRadius: '20px' }}>
                  {/* Mock top bar */}
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-sm font-bold text-navy">Career Dashboard</h3>
                      <p className="text-xs text-text-secondary">Welcome back, Saksham!</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center text-white text-xs font-bold">SK</div>
                  </div>

                  {/* Mini metric cards */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      { label: 'ATS Score', value: '87%', color: '#3D5AFE', icon: '📊' },
                      { label: 'Skill Gaps', value: '4', color: '#FF6B35', icon: '🎯' },
                      { label: 'Applications', value: '23', color: '#00BFA5', icon: '📨' },
                      { label: 'Interview Score', value: '78%', color: '#E91E63', icon: '🎤' },
                    ].map((m, i) => (
                      <div key={i} className="p-3 rounded-xl bg-bg-light">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">{m.icon}</span>
                          <span className="text-[11px] text-text-secondary font-medium">{m.label}</span>
                        </div>
                        <span className="text-lg font-extrabold" style={{ color: m.color }}>{m.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Mini chart */}
                  <div className="rounded-xl bg-bg-light p-3">
                    <p className="text-xs font-semibold text-navy mb-2">Learning Progress</p>
                    <ResponsiveContainer width="100%" height={80}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3D5AFE" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#3D5AFE" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke="#3D5AFE" strokeWidth={2} fill="url(#heroGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Floating notification cards */}
                <div className="absolute -top-4 -right-4 card-float px-4 py-3 rounded-xl animate-float" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <CheckCircle size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-navy">ATS Score: 87%</p>
                      <p className="text-[10px] text-text-secondary">Resume optimized!</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 card-float px-4 py-3 rounded-xl animate-float-slow" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Briefcase size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-navy">3 New Job Matches</p>
                      <p className="text-[10px] text-text-secondary">92% match found</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full">
            <path d="M0 40 C360 80 1080 0 1440 40 L1440 80 L0 80Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ─── LOGO STRIP ─── */}
      <section className="py-16 bg-white">
        <div className="container text-center">
          <p className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-8">
            Trusted by students from top universities
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 opacity-40">
            {['MIT', 'Stanford', 'IIT Delhi', 'Harvard', 'Oxford', 'Cambridge'].map(name => (
              <div key={name} className="text-xl font-extrabold text-gray-400 tracking-tight">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURE GRID ─── */}
      <section className="section bg-white">
        <div className="container">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-light text-royal-blue text-xs font-bold uppercase tracking-wider mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy tracking-tight mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Five AI-powered modules working together to accelerate your career from resume to placement.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className={i === 4 ? 'sm:col-span-2 lg:col-span-1' : ''}>
                <FeatureCard {...f} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="section bg-bg-light">
        <div className="container">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-light text-royal-blue text-xs font-bold uppercase tracking-wider mb-4">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy tracking-tight mb-4">
              From Resume to Job Offer in 5 Steps
            </h2>
          </div>

          <div className="relative">
            {/* Connection line (desktop) */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-royal-blue via-accent-teal to-accent-purple opacity-30" />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4">
              {steps.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center relative">
                  <div className="w-16 h-16 rounded-2xl gradient-blue flex items-center justify-center text-white mb-4 shadow-lg relative z-10" style={{ boxShadow: '0 4px 14px rgba(61, 90, 254, 0.3)' }}>
                    <step.icon size={26} />
                  </div>
                  <span className="text-xs font-bold text-royal-blue mb-1">Step {i + 1}</span>
                  <h4 className="text-sm font-bold text-navy mb-1">{step.label}</h4>
                  <p className="text-xs text-text-secondary">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRODUCT SHOWCASE ─── */}
      <section className="section bg-white overflow-hidden">
        <div className="container">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-light text-royal-blue text-xs font-bold uppercase tracking-wider mb-4">
              Product Preview
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy tracking-tight mb-4">
              A Dashboard Built for Career Success
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Track your progress, manage applications, and get AI-powered insights — all in one place.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Browser frame */}
            <div className="rounded-2xl overflow-hidden shadow-float border border-gray-200">
              {/* Browser bar */}
              <div className="bg-gray-100 px-4 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-lg px-4 py-1.5 text-xs text-gray-400 border border-gray-200">
                    app.aicareercopilot.com/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="bg-bg-light p-6">
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'ATS Score', value: '87%', bg: '#EEF0FF', color: '#3D5AFE' },
                    { label: 'Skill Gaps', value: '4', bg: '#FFF3ED', color: '#FF6B35' },
                    { label: 'Applications', value: '23', bg: '#E6FAF5', color: '#00BFA5' },
                    { label: 'Interview Score', value: '78%', bg: '#FDE8F0', color: '#E91E63' },
                  ].map((m, i) => (
                    <div key={i} className="bg-white rounded-xl p-3 shadow-sm">
                      <p className="text-[10px] text-text-secondary mb-1">{m.label}</p>
                      <p className="text-xl font-extrabold" style={{ color: m.color }}>{m.value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs font-semibold text-navy mb-3">Skill Mastery Over Time</p>
                  <ResponsiveContainer width="100%" height={120}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="showcaseGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3D5AFE" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#3D5AFE" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="value" stroke="#3D5AFE" strokeWidth={2} fill="url(#showcaseGrad)" dot={{ r: 3, fill: '#3D5AFE' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <div className="absolute -top-3 -right-6 card-float px-4 py-3 rounded-xl animate-float hidden md:flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp size={14} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-navy">+12% this week</p>
                <p className="text-[10px] text-text-secondary">Learning progress</p>
              </div>
            </div>

            <div className="absolute -bottom-3 -left-6 card-float px-4 py-3 rounded-xl animate-float-slow hidden md:flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                <Zap size={14} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-navy">New: System Design</p>
                <p className="text-[10px] text-text-secondary">Course recommended</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="section bg-bg-light">
        <div className="container">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-light text-royal-blue text-xs font-bold uppercase tracking-wider mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy tracking-tight mb-4">
              Students Love AI Career Copilot
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="card p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-6 italic">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-blue flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy">{t.name}</p>
                    <p className="text-xs text-text-secondary">{t.university}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING TEASER ─── */}
      <section className="section bg-white">
        <div className="container">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-light text-royal-blue text-xs font-bold uppercase tracking-wider mb-4">
              Pricing
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy tracking-tight mb-4">
              Plans for Every Student
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { name: 'Free', price: '$0', desc: 'Perfect to get started', features: ['1 Resume Scan', 'Basic Skill Gap', '5 Job Matches/day'], cta: 'Get Started' },
              { name: 'Pro', price: '$9/mo', desc: 'For serious job seekers', features: ['Unlimited Scans', 'AI Interview Coach', 'All Learning Paths', 'Priority Matching'], cta: 'Start Free Trial', highlighted: true },
              { name: 'Campus', price: 'Custom', desc: 'For universities & bootcamps', features: ['Bulk Licensing', 'Admin Dashboard', 'Analytics & Reports'], cta: 'Contact Sales' },
            ].map((plan, i) => (
              <div key={i} className={`card p-6 text-center relative ${plan.highlighted ? 'border-2 border-royal-blue' : 'border border-gray-100'}`} style={{ borderRadius: 'var(--radius-xl)' }}>
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-royal-blue text-white text-[10px] font-bold uppercase tracking-wider">
                      Popular
                    </span>
                  </div>
                )}
                <h4 className="text-base font-bold text-navy mb-1">{plan.name}</h4>
                <p className="text-2xl font-extrabold text-navy mb-1">{plan.price}</p>
                <p className="text-xs text-text-secondary mb-4">{plan.desc}</p>
                <ul className="space-y-2 mb-5 text-left" style={{ listStyle: 'none' }}>
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle size={14} className="text-royal-blue flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`btn btn-sm w-full ${plan.highlighted ? 'btn-primary' : 'btn-outline'}`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <p className="text-center mt-8">
            <Link to="/pricing" className="text-sm font-semibold text-royal-blue hover:underline inline-flex items-center gap-1">
              See full pricing & comparison <ArrowRight size={14} />
            </Link>
          </p>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <CTABanner />

      {/* ─── FOOTER ─── */}
      <Footer />
    </div>
  );
}
