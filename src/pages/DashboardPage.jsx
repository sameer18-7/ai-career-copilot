import {
  BarChart3, Target, Briefcase, Mic, Upload, TrendingUp, TrendingDown,
  Clock, FileText, BookOpen, Bell, Calendar, ChevronRight, ExternalLink
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import AppShell from '../components/AppShell';
import MetricCard from '../components/MetricCard';

const progressData = [
  { week: 'W1', mastery: 35 }, { week: 'W2', mastery: 42 },
  { week: 'W3', mastery: 48 }, { week: 'W4', mastery: 55 },
  { week: 'W5', mastery: 58 }, { week: 'W6', mastery: 67 },
  { week: 'W7', mastery: 72 }, { week: 'W8', mastery: 78 },
];

const recentActivity = [
  { icon: FileText, text: 'Resume updated and re-analyzed', time: '2 hours ago', color: '#3D5AFE' },
  { icon: BookOpen, text: 'Completed "Docker Fundamentals" module', time: '5 hours ago', color: '#00BFA5' },
  { icon: Mic, text: 'Mock interview: Google Behavioral Round', time: '1 day ago', color: '#E91E63' },
  { icon: Briefcase, text: 'Applied to Backend Engineer at Amazon', time: '2 days ago', color: '#7C3AED' },
  { icon: Target, text: 'Skill gap re-assessed: 2 gaps closed', time: '3 days ago', color: '#FF6B35' },
];

const skillGaps = [
  { name: 'Docker', progress: 65, color: '#3D5AFE' },
  { name: 'AWS', progress: 40, color: '#FF6B35' },
  { name: 'System Design', progress: 25, color: '#E91E63' },
  { name: 'Kubernetes', progress: 15, color: '#7C3AED' },
];

const notifications = [
  { title: 'New Job Match', sub: '92% match at Google — Backend Engineer', icon: Briefcase, time: '10m ago' },
  { title: 'Resume Score Updated', sub: 'Your ATS score improved to 87%', icon: TrendingUp, time: '1h ago' },
  { title: 'Course Reminder', sub: 'Continue "AWS Cloud Practitioner"', icon: BookOpen, time: '3h ago' },
  { title: 'Interview Scheduled', sub: 'Mock interview tomorrow at 3 PM', icon: Calendar, time: '5h ago' },
];

const jobMatches = [
  { role: 'Backend Engineer', company: 'Google', match: 92, salary: '₹12-18 LPA', location: 'Bangalore', color: '#4285F4' },
  { role: 'Data Analyst', company: 'Amazon', match: 87, salary: '₹8-12 LPA', location: 'Hyderabad', color: '#FF9900' },
  { role: 'ML Engineer', company: 'Microsoft', match: 84, salary: '₹15-22 LPA', location: 'Noida', color: '#00A4EF' },
  { role: 'Full Stack Dev', company: 'Flipkart', match: 81, salary: '₹10-15 LPA', location: 'Bangalore', color: '#2874F0' },
  { role: 'DevOps Engineer', company: 'Razorpay', match: 78, salary: '₹12-16 LPA', location: 'Remote', color: '#3395FF' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="card px-4 py-3" style={{ boxShadow: 'var(--shadow-float)' }}>
        <p className="text-xs font-semibold text-navy">{label}</p>
        <p className="text-sm font-bold text-royal-blue">{payload[0].value}% Mastery</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  return (
    <AppShell>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy mb-1">Welcome back, Saksham! 👋</h1>
          <p className="text-sm text-text-secondary">Here's what's happening with your career journey today.</p>
        </div>
        <button className="btn btn-primary btn-sm">
          <Upload size={16} /> Upload New Resume
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard icon={BarChart3} label="ATS Score" value="87%" trend="up" trendValue="+5%" color="blue" />
        <MetricCard icon={Target} label="Skill Gaps" value="4" trend="down" trendValue="-2" color="orange" />
        <MetricCard icon={Briefcase} label="Applications Sent" value="23" trend="up" trendValue="+8" color="teal" />
        <MetricCard icon={Mic} label="Interview Score" value="78%" trend="up" trendValue="+12%" color="pink" />
      </div>

      {/* Main Two-Column */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Left: Charts + Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Learning Progress Chart */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-navy">Learning Progress</h3>
                <p className="text-xs text-text-secondary">Skill mastery over the last 8 weeks</p>
              </div>
              <select className="text-xs px-3 py-1.5 rounded-lg bg-bg-light border-none text-text-secondary font-medium focus:outline-none">
                <option>Last 8 Weeks</option>
                <option>Last 3 Months</option>
                <option>All Time</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={progressData}>
                <defs>
                  <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3D5AFE" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#3D5AFE" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="mastery" stroke="#3D5AFE" strokeWidth={2.5} fill="url(#dashGrad)" dot={{ r: 4, fill: '#3D5AFE', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#3D5AFE', stroke: '#fff', strokeWidth: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activity */}
          <div className="card p-6">
            <h3 className="text-base font-bold text-navy mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="icon-badge-sm flex-shrink-0"
                    style={{ background: `${a.color}15`, color: a.color }}
                  >
                    <a.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-navy font-medium">{a.text}</p>
                    <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> {a.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Sidebar Widgets */}
        <div className="space-y-6">
          {/* Skill Gap Breakdown */}
          <div className="card p-6">
            <h3 className="text-base font-bold text-navy mb-4">Skill Gap Breakdown</h3>
            <div className="space-y-4">
              {skillGaps.map((skill, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-navy">{skill.name}</span>
                    <span className="font-bold" style={{ color: skill.color }}>{skill.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${skill.progress}%`, background: skill.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mock Interview Reminder */}
          <div className="card p-6 border-l-4 border-accent-pink">
            <div className="flex items-start gap-3">
              <div className="icon-badge icon-badge-pink">
                <Mic size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-navy mb-1">Upcoming: Mock Interview</h4>
                <p className="text-xs text-text-secondary mb-3">Google Behavioral Round — Tomorrow, 3:00 PM</p>
                <button className="btn btn-sm btn-primary" style={{ padding: '6px 16px', fontSize: '12px' }}>
                  Prepare Now
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-navy flex items-center gap-2">
                <Bell size={16} /> Notifications
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">
                {notifications.length} new
              </span>
            </div>
            <div className="space-y-3">
              {notifications.map((n, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-bg-light transition-colors cursor-pointer">
                  <div className="icon-badge-sm icon-badge-blue flex-shrink-0">
                    <n.icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-navy">{n.title}</p>
                    <p className="text-[11px] text-text-secondary line-clamp-2">{n.sub}</p>
                  </div>
                  <span className="text-[10px] text-text-muted whitespace-nowrap">{n.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Job Matches */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-navy">Top Job Matches</h3>
          <a href="/jobs" className="text-xs font-semibold text-royal-blue hover:underline flex items-center gap-1 no-underline">
            View All <ChevronRight size={14} />
          </a>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {jobMatches.map((job, i) => (
            <div key={i} className="flex-shrink-0 w-[240px] p-4 rounded-2xl bg-bg-light hover:bg-white hover:shadow-card transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: job.color }}>
                  {job.company[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-navy">{job.role}</p>
                  <p className="text-xs text-text-secondary">{job.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">{job.match}% Match</span>
                <span className="text-xs text-text-secondary">{job.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-navy">{job.salary}</span>
                <button className="text-xs font-semibold text-royal-blue hover:underline flex items-center gap-1" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  View <ExternalLink size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
