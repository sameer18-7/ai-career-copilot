'use client';

import { batchStats, topSkills, skillGaps } from '@/data/mockCollegeData';

export default function BatchAnalytics() {
    const stats = [
        { label: 'Total Students', value: batchStats.totalStudents.toLocaleString(), icon: 'groups', color: 'bg-blue-100 text-blue-600', change: '+12%' },
        { label: 'Placement Rate', value: `${batchStats.placementRate}%`, icon: 'trending_up', color: 'bg-green-100 text-green-600', change: '+8.2%' },
        { label: 'Avg Package', value: batchStats.avgPackage, icon: 'military_tech', color: 'bg-amber-100 text-amber-600', change: '+15%' },
        { label: 'Companies Visited', value: batchStats.companiesVisited, icon: 'apartment', color: 'bg-pink-100 text-pink-600', change: '+23%' },
        { label: 'Highest Package', value: batchStats.highestPackage, icon: 'star', color: 'bg-purple-100 text-purple-600', change: '' },
        { label: 'Ongoing Drives', value: batchStats.ongoingDrives, icon: 'menu_book', color: 'bg-cyan-100 text-cyan-600', change: 'Active' },
    ];

    return (
        <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-[16px] p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={`${stat.color} p-3 rounded-xl`}>
                            <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-[22px] font-bold text-gray-900">{stat.value}</p>
                            <p className="text-[13px] text-gray-500">{stat.label}</p>
                        </div>
                        {stat.change && (
                            <span className={`text-[12px] font-semibold px-2 py-1 rounded-lg ${stat.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                {stat.change}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Skills */}
                <div className="bg-white rounded-[16px] p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="bg-blue-100 p-2 rounded-xl">
                            <span className="material-symbols-outlined text-blue-600 text-xl">bar_chart</span>
                        </div>
                        <h3 className="text-[18px] font-bold text-gray-900">Top Skills in Batch</h3>
                    </div>
                    <div className="space-y-3">
                        {topSkills.map((skill, i) => (
                            <div key={skill.skill}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[14px] font-medium text-gray-700">{skill.skill}</span>
                                    <span className="text-[12px] text-gray-400">{skill.count} students ({skill.percentage}%)</span>
                                </div>
                                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 score-bar" style={{ width: `${skill.percentage}%`, animationDelay: `${i * 0.1}s` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skill Gaps */}
                <div className="bg-white rounded-[16px] p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="bg-red-100 p-2 rounded-xl">
                            <span className="material-symbols-outlined text-red-600 text-xl">warning</span>
                        </div>
                        <h3 className="text-[18px] font-bold text-gray-900">Skill Gaps in Batch</h3>
                    </div>
                    <div className="space-y-3">
                        {skillGaps.map((item, i) => (
                            <div key={item.skill} className="rounded-xl bg-gray-50 p-4 border border-gray-100 hover:border-red-200 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-gray-800 text-[14px]">{item.skill}</span>
                                    <span className="badge badge-danger text-[12px]">{item.gap}% gap</span>
                                </div>
                                <p className="text-[12px] text-gray-500">{item.description}</p>
                                <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden mt-2">
                                    <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500 score-bar" style={{ width: `${item.gap}%`, animationDelay: `${i * 0.1}s` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
