'use client';

export default function ReadinessDetails({ data }) {
    if (!data) return null;
    const { overallScore, breakdown, suggestions } = data;
    const categories = [
        { key: 'skills', label: 'Skills', icon: 'code', color: 'bg-blue-500' },
        { key: 'resume', label: 'Resume', icon: 'description', color: 'bg-purple-500' },
        { key: 'practice', label: 'Practice', icon: 'fitness_center', color: 'bg-orange-500' },
        { key: 'projects', label: 'Projects', icon: 'rocket_launch', color: 'bg-green-500' },
    ];
    const priorityColors = { high: 'bg-red-100 text-red-700', medium: 'bg-yellow-100 text-yellow-700', low: 'bg-green-100 text-green-700' };

    return (
        <div>
            <div className="mb-6"><h1 className="text-[28px] font-bold text-gray-900">Placement Readiness Score</h1><p className="text-[15px] text-gray-500 mt-1">Your overall placement preparedness metric</p></div>

            {/* Score Card */}
            <div className="rounded-[16px] p-[28px] mb-6 shadow-sm" style={{ backgroundColor: '#DCD9D4', backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.50) 0%, rgba(0,0,0,0.50) 100%), radial-gradient(at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.50) 50%)', backgroundBlendMode: 'soft-light, screen' }}>
                <div className="flex items-center gap-10">
                    <div className="relative w-[140px] h-[140px] shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path className="fill-none stroke-white/50 stroke-[3]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className={`fill-none stroke-[3] stroke-linecap-round ${overallScore >= 75 ? 'stroke-green-500' : overallScore >= 50 ? 'stroke-blue-500' : 'stroke-orange-500'}`} strokeDasharray={`${overallScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-[32px] font-bold text-gray-900">{overallScore}</span>
                            <span className="text-[12px] text-gray-500 font-medium uppercase">out of 100</span>
                        </div>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                        {categories.map(cat => (
                            <div key={cat.key} className="flex items-center gap-3">
                                <div className={`${cat.color} p-2 rounded-lg text-white shrink-0`}><span className="material-symbols-outlined text-[20px]">{cat.icon}</span></div>
                                <div className="flex-1">
                                    <div className="flex justify-between text-[13px] mb-1"><span className="text-gray-700 font-medium">{cat.label}</span><span className="font-bold text-gray-900">{breakdown[cat.key]}%</span></div>
                                    <div className="h-2 bg-white/50 rounded-full overflow-hidden"><div className={`h-full ${cat.color} rounded-full transition-all`} style={{ width: `${breakdown[cat.key]}%` }}></div></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Improvement Suggestions */}
            <div className="rounded-[16px] p-[28px] shadow-sm" style={{ backgroundColor: '#DCD9D4', backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.50) 0%, rgba(0,0,0,0.50) 100%), radial-gradient(at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.50) 50%)', backgroundBlendMode: 'soft-light, screen' }}>
                <h2 className="text-[20px] font-bold text-gray-900 mb-5">Improvement Suggestions</h2>
                <div className="space-y-3">
                    {suggestions.map((s, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/20 border border-white/30">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase shrink-0 mt-0.5 ${priorityColors[s.priority]}`}>{s.priority}</span>
                            <div><p className="text-[14px] font-medium text-gray-900">{s.area}</p><p className="text-[13px] text-gray-600 mt-0.5">{s.suggestion}</p></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
