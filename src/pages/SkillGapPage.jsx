import {
  ChevronDown, Play, BookOpen, Video, FileText, Bookmark,
  CheckCircle, Clock, Zap, BarChart3, Lock, ArrowRight
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import AppShell from '../components/AppShell';

const radarData = [
  { skill: 'Python', you: 85, market: 90 },
  { skill: 'Docker', you: 35, market: 80 },
  { skill: 'AWS', you: 40, market: 85 },
  { skill: 'SQL', you: 78, market: 80 },
  { skill: 'System Design', you: 25, market: 75 },
  { skill: 'Git', you: 72, market: 70 },
  { skill: 'CI/CD', you: 20, market: 70 },
  { skill: 'Kubernetes', you: 15, market: 65 },
];

const missingSkills = [
  { name: 'Docker', severity: 'Critical', icon: '🐳', color: '#EF4444' },
  { name: 'System Design', severity: 'Critical', icon: '🏗️', color: '#EF4444' },
  { name: 'AWS', severity: 'Moderate', icon: '☁️', color: '#F59E0B' },
  { name: 'CI/CD', severity: 'Moderate', icon: '🔄', color: '#F59E0B' },
  { name: 'Kubernetes', severity: 'Minor', icon: '⚙️', color: '#3D5AFE' },
];

const roadmap = [
  { step: 1, name: 'Docker Fundamentals', time: '4 hours', status: 'completed', progress: 100 },
  { step: 2, name: 'Docker Compose & Networking', time: '3 hours', status: 'completed', progress: 100 },
  { step: 3, name: 'AWS Cloud Practitioner', time: '8 hours', status: 'in-progress', progress: 65 },
  { step: 4, name: 'CI/CD with GitHub Actions', time: '5 hours', status: 'not-started', progress: 0 },
  { step: 5, name: 'System Design Basics', time: '10 hours', status: 'not-started', progress: 0 },
  { step: 6, name: 'Kubernetes Fundamentals', time: '6 hours', status: 'locked', progress: 0 },
];

const quizHistory = [
  { day: 'Mon', score: 60 }, { day: 'Tue', score: 70 },
  { day: 'Wed', score: 65 }, { day: 'Thu', score: 80 },
  { day: 'Fri', score: 75 }, { day: 'Sat', score: 85 },
  { day: 'Sun', score: 90 },
];

const resources = [
  { type: 'video', title: 'Docker Crash Course 2025', source: 'YouTube — TechWorld', duration: '45 min', icon: Video },
  { type: 'course', title: 'AWS Cloud Practitioner', source: 'Coursera', duration: '20 hours', icon: BookOpen },
  { type: 'article', title: 'System Design Interview Guide', source: 'Medium', duration: '15 min read', icon: FileText },
  { type: 'video', title: 'CI/CD Pipeline Tutorial', source: 'YouTube — Fireship', duration: '12 min', icon: Video },
];

const statusConfig = {
  'completed': { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed', iconColor: '#10B981' },
  'in-progress': { bg: 'bg-blue-100', text: 'text-royal-blue', label: 'In Progress', iconColor: '#3D5AFE' },
  'not-started': { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Not Started', iconColor: '#9CA3AF' },
  'locked': { bg: 'bg-gray-100', text: 'text-gray-400', label: 'Locked', iconColor: '#D1D5DB' },
};

export default function SkillGapPage() {
  return (
    <AppShell>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy mb-1">Your Skill Gap & Learning Path</h1>
          <p className="text-sm text-text-secondary">Analyze your skill gaps and follow a personalized roadmap to close them.</p>
        </div>
        <div className="relative">
          <select className="px-4 py-2.5 pr-9 rounded-xl bg-white border border-gray-200 text-sm text-navy font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-royal-blue/20 cursor-pointer shadow-sm">
            <option>🎯 Backend Engineer</option>
            <option>📊 Data Analyst</option>
            <option>🤖 ML Engineer</option>
            <option>🌐 Full Stack Developer</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Radar Chart */}
          <div className="card p-6">
            <h3 className="text-base font-bold text-navy mb-2">Skills vs Market Demand</h3>
            <p className="text-xs text-text-secondary mb-4">Compare your current skill levels against what employers are looking for.</p>
            <div className="flex items-center gap-6 mb-3">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-royal-blue" />
                <span className="text-text-secondary font-medium">Your Skills</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-accent-orange" />
                <span className="text-text-secondary font-medium">Market Demand</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Radar name="You" dataKey="you" stroke="#3D5AFE" fill="#3D5AFE" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3 }} />
                <Radar name="Market" dataKey="market" stroke="#FF6B35" fill="#FF6B35" fillOpacity={0.08} strokeWidth={2} strokeDasharray="5 3" />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Missing Skills */}
          <div className="card p-6">
            <h3 className="text-base font-bold text-navy mb-4">Missing Skills</h3>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {missingSkills.map((skill, i) => (
                <div key={i} className="flex-shrink-0 w-[180px] p-4 rounded-2xl bg-bg-light hover:bg-white hover:shadow-card transition-all">
                  <span className="text-2xl mb-2 block">{skill.icon}</span>
                  <p className="text-sm font-bold text-navy mb-1">{skill.name}</p>
                  <span
                    className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3"
                    style={{ background: `${skill.color}15`, color: skill.color }}
                  >
                    {skill.severity}
                  </span>
                  <button className="btn btn-sm btn-primary w-full" style={{ padding: '6px 12px', fontSize: '11px' }}>
                    Start Learning <ArrowRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Roadmap */}
          <div className="card p-6">
            <h3 className="text-base font-bold text-navy mb-6">Learning Roadmap</h3>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

              <div className="space-y-6">
                {roadmap.map((item, i) => {
                  const config = statusConfig[item.status];
                  return (
                    <div key={i} className="flex gap-4 relative">
                      {/* Node */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-sm font-bold ${
                        item.status === 'completed' ? 'bg-green-500 text-white' :
                        item.status === 'in-progress' ? 'gradient-blue text-white' :
                        item.status === 'locked' ? 'bg-gray-200 text-gray-400' :
                        'bg-white border-2 border-gray-300 text-gray-400'
                      }`}>
                        {item.status === 'completed' ? <CheckCircle size={18} /> :
                         item.status === 'locked' ? <Lock size={16} /> :
                         item.step}
                      </div>

                      {/* Content */}
                      <div className={`flex-1 p-4 rounded-xl ${item.status === 'locked' ? 'bg-gray-50 opacity-60' : 'bg-bg-light'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-bold text-navy">{item.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-text-secondary flex items-center gap-1">
                                <Clock size={10} /> {item.time}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${config.bg} ${config.text}`}>
                                {config.label}
                              </span>
                            </div>
                          </div>
                          {item.status === 'in-progress' && (
                            <button className="btn btn-sm btn-primary" style={{ padding: '4px 12px', fontSize: '11px' }}>
                              Continue
                            </button>
                          )}
                          {item.status === 'not-started' && (
                            <button className="btn btn-sm btn-outline" style={{ padding: '4px 12px', fontSize: '11px' }}>
                              Start
                            </button>
                          )}
                        </div>
                        {item.progress > 0 && item.progress < 100 && (
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-royal-blue rounded-full" style={{ width: `${item.progress}%` }} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Adaptive Quiz */}
          <div className="card p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <div className="icon-badge icon-badge-orange">
                <Zap size={20} />
              </div>
              <h3 className="text-base font-bold text-navy">Adaptive Quiz</h3>
            </div>
            <div className="p-4 rounded-xl bg-bg-light mb-4">
              <p className="text-sm font-semibold text-navy mb-1">Current Topic: Docker</p>
              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-accent-orange text-[10px] font-bold uppercase">
                Medium Difficulty
              </span>
            </div>
            <button className="btn btn-primary w-full mb-5">
              <Play size={16} /> Start Quiz
            </button>

            {/* Score History Sparkline */}
            <div>
              <p className="text-xs font-semibold text-text-secondary mb-2">Score History (This Week)</p>
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={quizHistory}>
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="score" stroke="#FF6B35" strokeWidth={2} dot={{ r: 3, fill: '#FF6B35' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommended Resources */}
          <div className="card p-6">
            <h3 className="text-base font-bold text-navy mb-4">Recommended Resources</h3>
            <div className="space-y-3">
              {resources.map((res, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-bg-light transition-colors cursor-pointer">
                  <div className={`icon-badge-sm ${res.type === 'video' ? 'icon-badge-pink' : res.type === 'course' ? 'icon-badge-teal' : 'icon-badge-blue'}`}>
                    <res.icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-navy line-clamp-2">{res.title}</p>
                    <p className="text-[10px] text-text-secondary mt-0.5">{res.source} · {res.duration}</p>
                  </div>
                  <button className="p-1 text-text-muted hover:text-royal-blue transition-colors" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Bookmark size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
