import { useState } from 'react';
import {
  Mic, Play, Square, SkipForward, Clock, Star, ChevronDown,
  CheckCircle, AlertCircle, TrendingUp, Volume2, MessageSquare,
  Award, ChevronRight, Eye
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import AppShell from '../components/AppShell';
import CircularGauge from '../components/CircularGauge';

const companies = [
  { name: 'Google', color: '#4285F4', logo: 'G' },
  { name: 'Amazon', color: '#FF9900', logo: 'A' },
  { name: 'Microsoft', color: '#00A4EF', logo: 'M' },
  { name: 'Meta', color: '#0668E1', logo: 'f' },
  { name: 'Apple', color: '#555555', logo: '' },
  { name: 'Startup', color: '#10B981', logo: 'S' },
];

const feedbackBreakdown = [
  { category: 'Clarity', score: 82, color: '#3D5AFE' },
  { category: 'Confidence', score: 75, color: '#FF6B35' },
  { category: 'Technical', score: 88, color: '#00BFA5' },
  { category: 'Structure', score: 70, color: '#E91E63' },
  { category: 'Filler Words', score: 65, color: '#7C3AED' },
];

const strengths = [
  'Strong technical explanations with relevant examples',
  'Good use of STAR method in behavioral answers',
  'Clear communication of complex system design concepts',
];

const improvements = [
  'Reduce filler words ("um", "like") — detected 12 times',
  'Provide more quantified results in behavioral answers',
  'Practice time management — 2 questions went over time limit',
];

const questionReview = [
  {
    q: 'Tell me about a time you had to deal with a difficult team member.',
    answer: 'Discussed a college project scenario where I mediated a conflict between two team members...',
    feedback: 'Good use of STAR method. Consider adding more specific outcomes and metrics.',
    score: 78,
  },
  {
    q: 'Design a URL shortening service like bit.ly.',
    answer: 'Covered database design, hashing algorithms, caching layer with Redis, and scalability...',
    feedback: 'Excellent technical depth. Could improve by discussing trade-offs more explicitly.',
    score: 85,
  },
  {
    q: 'What is your biggest weakness?',
    answer: 'Discussed tendency to over-engineer solutions and steps taken to balance perfectionism...',
    feedback: 'Authentic answer. Add more concrete examples of improvement steps taken.',
    score: 72,
  },
];

const interviewHistory = [
  { date: '2025-08-28', track: 'Google — Behavioral', score: 78, duration: '32 min' },
  { date: '2025-08-25', track: 'Amazon — Technical', score: 82, duration: '45 min' },
  { date: '2025-08-22', track: 'Microsoft — System Design', score: 71, duration: '38 min' },
  { date: '2025-08-19', track: 'Google — Technical', score: 85, duration: '40 min' },
  { date: '2025-08-15', track: 'Startup — Behavioral', score: 88, duration: '25 min' },
];

export default function InterviewCoachPage() {
  const [selectedCompany, setSelectedCompany] = useState('Google');
  const [interviewType, setInterviewType] = useState('Behavioral');
  const [difficulty, setDifficulty] = useState('Medium');
  const [expandedQ, setExpandedQ] = useState(null);

  return (
    <AppShell>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-navy mb-1">AI Interview Coach</h1>
        <p className="text-sm text-text-secondary">Practice with role-specific mock interviews and get instant AI feedback.</p>
      </div>

      {/* Setup Panel */}
      <div className="card p-6 mb-8">
        <h3 className="text-base font-bold text-navy mb-5">Setup Your Mock Interview</h3>

        {/* Company Selector */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 block">Select Company Track</label>
          <div className="flex flex-wrap gap-2">
            {companies.map(c => (
              <button
                key={c.name}
                onClick={() => setSelectedCompany(c.name)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  selectedCompany === c.name
                    ? 'text-white shadow-md'
                    : 'bg-bg-light text-navy hover:bg-gray-200'
                }`}
                style={selectedCompany === c.name ? { background: c.color, border: 'none', cursor: 'pointer' } : { border: 'none', cursor: 'pointer' }}
              >
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                  selectedCompany === c.name ? 'bg-white/20 text-white' : ''
                }`} style={selectedCompany !== c.name ? { background: `${c.color}20`, color: c.color } : {}}>
                  {c.logo}
                </div>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Interview Type */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 block">Interview Type</label>
          <div className="flex gap-1 bg-bg-light rounded-xl p-1 max-w-md">
            {['Behavioral', 'Technical', 'System Design'].map(type => (
              <button
                key={type}
                onClick={() => setInterviewType(type)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  interviewType === type
                    ? 'bg-white text-navy shadow-sm'
                    : 'text-text-secondary hover:text-navy'
                }`}
                style={{ border: 'none', cursor: 'pointer' }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 block">Difficulty</label>
          <div className="flex gap-2 max-w-xs">
            {['Easy', 'Medium', 'Hard'].map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  difficulty === d
                    ? d === 'Easy' ? 'bg-green-100 text-green-700 shadow-sm' :
                      d === 'Medium' ? 'bg-yellow-100 text-yellow-700 shadow-sm' :
                      'bg-red-100 text-red-600 shadow-sm'
                    : 'bg-bg-light text-text-secondary hover:text-navy'
                }`}
                style={{ border: 'none', cursor: 'pointer' }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary btn-lg">
          <Play size={18} /> Start Mock Interview
        </button>
      </div>

      {/* Mock Interview Interface */}
      <div className="card p-6 mb-8">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse-soft" />
          <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Live Session</span>
          <span className="ml-auto text-sm font-semibold text-navy flex items-center gap-1"><Clock size={14} /> 12:34</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* AI Interviewer Panel */}
          <div className="rounded-2xl bg-navy-light p-6 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A1F36, #252B48)' }}>
            <div className="absolute inset-0 dot-grid opacity-10" />
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-full gradient-blue flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ boxShadow: '0 4px 20px rgba(61, 90, 254, 0.4)' }}>
                <Mic size={32} className="text-white" />
              </div>
              <p className="text-white font-bold mb-1">AI Interviewer</p>
              <p className="text-white/50 text-xs mb-4">Google — Behavioral Round</p>

              {/* Waveform */}
              <div className="flex items-center justify-center gap-1 h-8">
                {[3, 5, 8, 12, 8, 15, 10, 7, 12, 8, 5, 3].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-royal-blue rounded-full animate-pulse-soft"
                    style={{ height: `${h * 2}px`, animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-center gap-1 mt-3">
                <Volume2 size={12} className="text-white/40" />
                <span className="text-[10px] text-white/40">Speaking...</span>
              </div>
            </div>
          </div>

          {/* Transcript Panel */}
          <div className="flex flex-col">
            <div className="flex-1 rounded-2xl bg-bg-light p-5 mb-4 min-h-[200px]">
              <div className="mb-4">
                <span className="text-[10px] font-bold text-royal-blue uppercase tracking-wider">Question 3 of 5</span>
                <p className="text-sm text-navy font-semibold mt-2 leading-relaxed">
                  "Tell me about a time when you had to work under pressure to meet a tight deadline. How did you handle it, and what was the outcome?"
                </p>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Your Response</span>
                <div className="mt-2 flex items-start gap-2">
                  <MessageSquare size={14} className="text-text-muted mt-0.5" />
                  <p className="text-xs text-text-secondary italic">Start speaking or type your answer...</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="btn btn-outline flex-1" style={{ padding: '10px 16px' }}>
                <SkipForward size={16} /> Next Question
              </button>
              <button className="btn flex-1" style={{ padding: '10px 16px', background: '#EF4444', color: 'white', borderColor: '#EF4444' }}>
                <Square size={16} /> End Interview
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Results */}
      <div className="mb-8">
        <h2 className="text-xl font-extrabold text-navy mb-6">Interview Feedback</h2>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Overall Score */}
          <div className="card p-6 flex flex-col items-center">
            <h3 className="text-sm font-bold text-navy mb-4">Overall Score</h3>
            <CircularGauge value={78} max={100} size={140} strokeWidth={12} />
            <p className="text-xs text-text-secondary mt-3 text-center">Good performance! Focus on reducing filler words.</p>
          </div>

          {/* Breakdown Chart */}
          <div className="card p-6 lg:col-span-2">
            <h3 className="text-sm font-bold text-navy mb-4">Score Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={feedbackBreakdown} layout="vertical" barCategoryGap="20%">
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  formatter={(value) => [`${value}%`, 'Score']}
                />
                <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={20}>
                  {feedbackBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="card p-6">
            <h3 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
              <div className="icon-badge-sm icon-badge-success"><CheckCircle size={14} /></div>
              Strengths
            </h3>
            <ul className="space-y-3" style={{ listStyle: 'none' }}>
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <h3 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
              <div className="icon-badge-sm icon-badge-orange"><AlertCircle size={14} /></div>
              Areas to Improve
            </h3>
            <ul className="space-y-3" style={{ listStyle: 'none' }}>
              {improvements.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <AlertCircle size={16} className="text-accent-orange flex-shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Question-by-Question Review */}
        <div className="card p-6 mb-6">
          <h3 className="text-sm font-bold text-navy mb-4">Question-by-Question Review</h3>
          <div className="space-y-2">
            {questionReview.map((item, i) => (
              <div key={i} className="rounded-xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 hover:bg-bg-light transition-colors text-left"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      item.score >= 80 ? 'bg-green-100 text-green-700' :
                      item.score >= 70 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {item.score}%
                    </span>
                    <span className="text-sm font-medium text-navy truncate">{item.q}</span>
                  </div>
                  <ChevronDown size={16} className={`text-text-secondary transition-transform flex-shrink-0 ml-2 ${expandedQ === i ? 'rotate-180' : ''}`} />
                </button>
                {expandedQ === i && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                    <div>
                      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Your Answer Summary</p>
                      <p className="text-sm text-gray-600">{item.answer}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">AI Feedback</p>
                      <p className="text-sm text-royal-blue">{item.feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interview History */}
      <div className="card p-6">
        <h3 className="text-base font-bold text-navy mb-4">Interview History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}>
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider pb-3 px-4">Date</th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider pb-3 px-4">Track</th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider pb-3 px-4">Score</th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider pb-3 px-4">Duration</th>
                <th className="text-right text-xs font-semibold text-text-secondary uppercase tracking-wider pb-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {interviewHistory.map((row, i) => (
                <tr key={i} className={`${i % 2 === 0 ? 'bg-bg-light' : 'bg-white'}`} style={{ borderRadius: '12px' }}>
                  <td className="px-4 py-3 text-navy font-medium rounded-l-xl">{row.date}</td>
                  <td className="px-4 py-3 text-text-secondary">{row.track}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      row.score >= 80 ? 'bg-green-100 text-green-700' :
                      row.score >= 70 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {row.score}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{row.duration}</td>
                  <td className="px-4 py-3 text-right rounded-r-xl">
                    <button className="text-xs font-semibold text-royal-blue hover:underline flex items-center gap-1 ml-auto" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Eye size={12} /> View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
