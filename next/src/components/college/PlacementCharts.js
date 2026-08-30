'use client';

import {
    AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { placementTrend, skillDistribution } from '@/data/mockCollegeData';

const BLUE_COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#7C3AED', '#8B5CF6', '#A78BFA'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-xl bg-white px-4 py-3 border border-gray-200 shadow-lg">
                <p className="text-[13px] font-semibold text-gray-800 mb-1">{label}</p>
                {payload.map((entry, i) => (
                    <p key={i} className="text-[12px]" style={{ color: entry.color }}>
                        {entry.name}: <span className="font-bold">{entry.value}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function PlacementCharts() {
    const coloredDistribution = skillDistribution.map((item, i) => ({
        ...item,
        fill: BLUE_COLORS[i % BLUE_COLORS.length],
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Placement Trend */}
            <div className="bg-white rounded-[16px] p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="bg-green-100 p-2 rounded-xl">
                        <span className="material-symbols-outlined text-green-600 text-xl">show_chart</span>
                    </div>
                    <h3 className="text-[18px] font-bold text-gray-900">Placement Trend</h3>
                </div>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={placementTrend}>
                            <defs>
                                <linearGradient id="placedGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="offersGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                            <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '12px', color: '#6B7280' }} />
                            <Area type="monotone" dataKey="placed" name="Students Placed" stroke="#2563EB" strokeWidth={2} fill="url(#placedGrad)" />
                            <Area type="monotone" dataKey="offers" name="Offers Extended" stroke="#7C3AED" strokeWidth={2} fill="url(#offersGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Skill Distribution */}
            <div className="bg-white rounded-[16px] p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="bg-purple-100 p-2 rounded-xl">
                        <span className="material-symbols-outlined text-purple-600 text-xl">pie_chart</span>
                    </div>
                    <h3 className="text-[18px] font-bold text-gray-900">Skill Distribution</h3>
                </div>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={coloredDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {coloredDistribution.map((entry, i) => (
                                    <Cell key={`cell-${i}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: '11px', color: '#6B7280' }}
                                formatter={(value) => <span style={{ color: '#6B7280' }}>{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
