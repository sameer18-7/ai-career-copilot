'use client';

import {
    AlertTriangle, BookOpen, CheckCircle2, Clock, ExternalLink,
    GraduationCap, Lightbulb, MapPin, Rocket, Star, Target, TrendingUp
} from 'lucide-react';

export default function CareerDashboard({ data, role, company }) {
    const { gaps, roadmap, courses } = data;

    const getSeverityBadge = (severity) => {
        const map = {
            high: { class: 'badge-danger', icon: AlertTriangle, label: 'Critical Gap' },
            medium: { class: 'badge-warning', icon: TrendingUp, label: 'Moderate Gap' },
            low: { class: 'badge-info', icon: Lightbulb, label: 'Nice to Have' },
        };
        return map[severity] || map.medium;
    };

    const getPhaseColor = (type) => {
        const map = {
            learn: 'from-blue-500 to-cyan-500',
            project: 'from-purple-500 to-pink-500',
            practice: 'from-amber-500 to-orange-500',
            milestone: 'from-emerald-500 to-teal-500',
        };
        return map[type] || 'from-indigo-500 to-purple-500';
    };

    const getPhaseIcon = (type) => {
        const map = {
            learn: BookOpen,
            project: Rocket,
            practice: Target,
            milestone: CheckCircle2,
        };
        return map[type] || Clock;
    };

    return (
        <div className="space-y-8 fade-in-up">
            {/* Header */}
            <div className="text-center fade-in-up">
                <h2 className="text-2xl font-bold gradient-text mb-2">
                    Your Personalized Roadmap
                </h2>
                <p className="text-slate-500">
                    {role} at {company} — AI-generated career path
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gap Analysis */}
                <div className="glass-card p-6 fade-in-up stagger-1">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-100">Gap Analysis</h3>
                    </div>
                    <div className="space-y-4">
                        {gaps.map((gap, i) => {
                            const badge = getSeverityBadge(gap.severity);
                            const BadgeIcon = badge.icon;
                            return (
                                <div key={i} className="rounded-xl bg-slate-800/40 p-4 border border-slate-700/30 hover:border-slate-600/50 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-slate-200 text-sm">{gap.skill}</h4>
                                        <span className={`badge ${badge.class} text-xs`}>
                                            <BadgeIcon className="h-3 w-3" />
                                            {badge.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed">{gap.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Learning Roadmap */}
                <div className="glass-card p-6 fade-in-up stagger-2">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                            <MapPin className="h-5 w-5 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-100">Learning Roadmap</h3>
                    </div>
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-emerald-500 opacity-30" />

                        <div className="space-y-5">
                            {roadmap.map((step, i) => {
                                const PhaseIcon = getPhaseIcon(step.type);
                                return (
                                    <div key={i} className="relative flex gap-4 pl-1">
                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getPhaseColor(step.type)} shadow-lg z-10`}>
                                            <PhaseIcon className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1 pb-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{step.phase}</span>
                                            </div>
                                            <h4 className="font-semibold text-slate-200 text-sm">{step.title}</h4>
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Recommended Courses */}
                <div className="glass-card p-6 fade-in-up stagger-3">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <GraduationCap className="h-5 w-5 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-100">Recommended Courses</h3>
                    </div>
                    <div className="space-y-3">
                        {courses.map((course, i) => (
                            <a
                                key={i}
                                href={course.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block rounded-xl bg-slate-800/40 p-4 border border-slate-700/30 hover:border-indigo-500/30 hover:bg-slate-800/60 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-slate-200 text-sm group-hover:text-indigo-300 transition-colors flex-1 pr-2">
                                        {course.title}
                                    </h4>
                                    <ExternalLink className="h-3.5 w-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0 mt-0.5" />
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span className="badge bg-slate-700/50 text-slate-400 text-xs">{course.platform}</span>
                                    <span className="flex items-center gap-1">
                                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                        {course.rating}
                                    </span>
                                    <span>{course.duration}</span>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-slate-600">{course.instructor}</span>
                                    <span className="text-xs font-semibold text-emerald-400">{course.price}</span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
