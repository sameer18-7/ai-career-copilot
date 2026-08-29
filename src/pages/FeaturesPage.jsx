import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Target, BookOpen, Mic, BarChart3, Brain, Zap,
  Briefcase, CheckCircle, ArrowRight, Check, X as XIcon,
  ChevronRight
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import CTABanner from '../components/CTABanner';
import Footer from '../components/Footer';

const radarData = [
  { skill: 'Python', you: 85, market: 90 },
  { skill: 'Docker', you: 30, market: 80 },
  { skill: 'AWS', you: 40, market: 85 },
  { skill: 'SQL', you: 75, market: 80 },
  { skill: 'System Design', you: 25, market: 70 },
  { skill: 'Git', you: 70, market: 75 },
];

const featureBlocks = [
  {
    id: 'resume',
    eyebrow: 'Phase 1',
    title: 'Resume Parsing (NLP)',
    icon: FileText,
    color: '#3D5AFE',
    description: 'Our AI-powered NLP engine automatically ingests your PDF resume and extracts structured data using Named Entity Recognition (NER).',
    bullets: ['Extract skills, education, experience, and certifications automatically', 'Normalize and map skills using sentence embeddings', 'Support for 50+ resume formats and templates'],
    mockup: 'resume',
  },
  {
    id: 'ats',
    eyebrow: 'Phase 1',
    title: 'ATS Score Prediction',
    icon: Target,
    color: '#FF6B35',
    description: 'Get an instant Applicant Tracking System compatibility score using our ML model trained on thousands of successful resumes.',
    bullets: ['Score breakdown: Formatting, Keywords, Readability, Missing Sections', 'Target role-specific scoring with industry benchmarks', 'Actionable suggestions to improve your score by 20-30%'],
    mockup: 'ats',
  },
  {
    id: 'skills',
    eyebrow: 'Phase 1',
    title: 'Skill Gap Analysis',
    icon: BarChart3,
    color: '#00BFA5',
    description: 'Semantic comparison between your profile and real-world job descriptions to identify exactly what you need to learn.',
    bullets: ['Visual radar chart comparing your skills vs market demand', 'Prioritized missing skills with severity indicators', 'Industry-specific skill benchmarks updated in real-time'],
    mockup: 'skills',
  },
  {
    id: 'jobs',
    eyebrow: 'Phase 2',
    title: 'Job Recommendation Engine',
    icon: Briefcase,
    color: '#7C3AED',
    description: 'Advanced matching using TF-IDF and Sentence Transformers that evolves into a Hybrid Recommender system for ultra-precise job matches.',
    bullets: ['Match percentage based on skills, location, and interests', 'Salary prediction engine (8–12 LPA range estimates)', 'Real-time job scraping keeps results fresh daily'],
    mockup: 'jobs',
  },
  {
    id: 'learning',
    eyebrow: 'Phase 2',
    title: 'Personalized Learning Engine',
    icon: BookOpen,
    color: '#3D5AFE',
    description: 'Content-based recommendations and embeddings create a structured learning path that adapts to your pace and learning style.',
    bullets: ['Step-by-step roadmaps for missing skills', 'Progress tracking with completion milestones', 'Curated resources from top platforms (Coursera, YouTube, etc.)'],
    mockup: 'learning',
  },
  {
    id: 'quiz',
    eyebrow: 'Phase 2',
    title: 'Adaptive Quiz Generator',
    icon: Zap,
    color: '#FF6B35',
    description: 'Dynamic technical quizzes that scale in difficulty based on your weak areas and newly identified skill gaps.',
    bullets: ['Difficulty auto-adjusts: Easy → Medium → Hard', 'Topic-specific quizzes aligned with your learning path', 'Performance analytics and spaced repetition reminders'],
    mockup: 'quiz',
  },
  {
    id: 'tutor',
    eyebrow: 'Phase 3',
    title: 'AI Tutor',
    icon: Brain,
    color: '#00BFA5',
    description: 'LLM-powered interactive assistant that provides explanations, architecture diagrams, flashcards, and instant Q&A.',
    bullets: ['Context-aware explanations tailored to your level', 'Visual diagrams for complex topics like System Design', 'Flashcard generation for quick revision sessions'],
    mockup: 'tutor',
  },
  {
    id: 'coaching',
    eyebrow: 'Phase 3',
    title: 'AI Interview Coach',
    icon: Mic,
    color: '#E91E63',
    description: 'Comprehensive mock interview module with company-specific tracks and instant AI-driven feedback on your responses.',
    bullets: ['Company tracks: Google, Amazon, Microsoft, and more', 'Behavioral + Technical + System Design rounds', 'Speech analysis for clarity, confidence, and filler words'],
    mockup: 'coaching',
  },
  {
    id: 'analytics',
    eyebrow: 'Phase 3',
    title: 'Career Dashboard',
    icon: BarChart3,
    color: '#3D5AFE',
    description: 'Centralized control center tracking all your career metrics in real-time with actionable insights.',
    bullets: ['Real-time metrics: ATS Score, Interview Score, Skill Gaps', 'Application tracking with status updates', 'Weekly progress reports with AI recommendations'],
    mockup: 'dashboard',
  },
];

const categories = [
  { id: 'resume', label: 'Resume' },
  { id: 'skills', label: 'Skills' },
  { id: 'learning', label: 'Learning' },
  { id: 'coaching', label: 'Coaching' },
  { id: 'analytics', label: 'Analytics' },
];

const comparisonRows = [
  { feature: 'AI Resume Parsing', us: true, others: false },
  { feature: 'ATS Score Prediction', us: true, others: false },
  { feature: 'Skill Gap Analysis', us: true, others: false },
  { feature: 'Personalized Learning Paths', us: true, others: false },
  { feature: 'Company-Specific Interview Prep', us: true, others: false },
  { feature: 'AI-Powered Job Matching', us: true, others: 'Basic' },
  { feature: 'Adaptive Quizzes', us: true, others: false },
  { feature: 'Career Dashboard', us: true, others: 'Limited' },
  { feature: 'Salary Predictions', us: true, others: false },
  { feature: 'Free for Students', us: true, others: false },
];

function MockupRenderer({ type }) {
  if (type === 'skills') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6" style={{ borderRadius: '20px' }}>
        <h4 className="text-sm font-bold text-navy mb-4">Your Skills vs Market Demand</h4>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: '#6B7280' }} />
            <Radar name="You" dataKey="you" stroke="#3D5AFE" fill="#3D5AFE" fillOpacity={0.2} strokeWidth={2} />
            <Radar name="Market" dataKey="market" stroke="#FF6B35" fill="#FF6B35" fillOpacity={0.1} strokeWidth={2} dot />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'ats') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6" style={{ borderRadius: '20px' }}>
        <div className="flex items-center gap-6">
          <div className="relative" style={{ width: 100, height: 100 }}>
            <svg width="100" height="100" className="transform -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="8" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#10B981" strokeWidth="8"
                strokeDasharray={`${0.87 * 2 * Math.PI * 40} ${(1 - 0.87) * 2 * Math.PI * 40}`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-extrabold text-navy">87</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {[
              { label: 'Formatting', pct: 92 },
              { label: 'Keywords', pct: 78 },
              { label: 'Readability', pct: 95 },
            ].map(bar => (
              <div key={bar.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-secondary">{bar.label}</span>
                  <span className="font-semibold text-navy">{bar.pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-royal-blue rounded-full transition-all" style={{ width: `${bar.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'jobs') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-4 space-y-3" style={{ borderRadius: '20px' }}>
        {[
          { role: 'Backend Engineer', company: 'Google', match: 92, salary: '12-18 LPA' },
          { role: 'Data Analyst', company: 'Amazon', match: 87, salary: '8-12 LPA' },
        ].map((job, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-bg-light">
            <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center text-white text-xs font-bold">
              {job.company[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-navy">{job.role}</p>
              <p className="text-xs text-text-secondary">{job.company} · {job.salary}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
              {job.match}%
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Default mockup
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6" style={{ borderRadius: '20px' }}>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bg-light" />
            <div className="flex-1">
              <div className="h-3 bg-bg-light rounded-full w-3/4 mb-1.5" />
              <div className="h-2 bg-bg-light rounded-full w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  const [activeSection, setActiveSection] = useState('resume');

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-30% 0px -70% 0px' }
    );

    featureBlocks.forEach(block => {
      const el = document.getElementById(block.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="pt-[72px]">
      {/* ─── Page Header ─── */}
      <section className="gradient-blue-subtle py-16">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-text-secondary mb-4">
            <Link to="/" className="hover:text-royal-blue no-underline text-text-secondary">Home</Link>
            <ChevronRight size={14} />
            <span className="text-royal-blue font-medium">Features</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-navy tracking-tight mb-4">
            Everything You Need to Land the Job
          </h1>
          <p className="text-text-secondary max-w-xl mx-auto text-lg">
            Explore our comprehensive suite of AI-powered tools designed for every step of your career journey.
          </p>
        </div>
      </section>

      {/* ─── Sticky Sub-Nav ─── */}
      <div className="sticky top-[72px] bg-white/95 backdrop-blur-md border-b border-gray-100 z-20">
        <div className="container flex items-center gap-1 py-2 overflow-x-auto">
          {categories.map(cat => (
            <a
              key={cat.id}
              href={`#${cat.id}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors no-underline ${
                activeSection === cat.id || featureBlocks.find(b => b.id === activeSection)?.id === cat.id
                  ? 'bg-royal-blue text-white'
                  : 'text-text-secondary hover:bg-bg-light hover:text-navy'
              }`}
            >
              {cat.label}
            </a>
          ))}
        </div>
      </div>

      {/* ─── Feature Blocks ─── */}
      <div className="py-16">
        {featureBlocks.map((block, i) => (
          <section key={block.id} id={block.id} className="py-12">
            <div className="container">
              <div className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                {/* Text */}
                <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
                    style={{ background: `${block.color}15`, color: block.color }}
                  >
                    {block.eyebrow}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight mb-4 flex items-center gap-3">
                    <div
                      className="icon-badge"
                      style={{ background: `${block.color}15`, color: block.color }}
                    >
                      <block.icon size={24} />
                    </div>
                    {block.title}
                  </h2>
                  <p className="text-text-secondary leading-relaxed mb-6">
                    {block.description}
                  </p>
                  <ul className="space-y-3" style={{ listStyle: 'none' }}>
                    {block.bullets.map((bullet, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-gray-600">
                        <CheckCircle size={18} className="text-royal-blue flex-shrink-0 mt-0.5" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mockup */}
                <div className={`${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <MockupRenderer type={block.mockup} />
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* ─── Comparison ─── */}
      <section className="section bg-bg-light">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-navy tracking-tight mb-4">
              Why AI Career Copilot vs Generic Tools?
            </h2>
          </div>

          <div className="max-w-2xl mx-auto card overflow-hidden" style={{ borderRadius: 'var(--radius-xl)' }}>
            <div className="grid grid-cols-3 bg-bg-light px-6 py-3 border-b border-gray-100">
              <span className="text-sm font-bold text-navy">Feature</span>
              <span className="text-sm font-bold text-royal-blue text-center">AI Career Copilot</span>
              <span className="text-sm font-bold text-text-secondary text-center">Generic Tools</span>
            </div>
            {comparisonRows.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-6 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-bg-light/50'} border-b border-gray-50`}>
                <span className="text-sm text-gray-600">{row.feature}</span>
                <div className="flex justify-center">
                  {row.us === true ? (
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <Check size={14} className="text-green-600" />
                    </div>
                  ) : (
                    <span className="text-sm text-text-secondary">{row.us}</span>
                  )}
                </div>
                <div className="flex justify-center">
                  {row.others === false ? (
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                      <XIcon size={14} className="text-red-500" />
                    </div>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">{row.others}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA + Footer ─── */}
      <CTABanner showEmail={false} />
      <Footer />
    </div>
  );
}
