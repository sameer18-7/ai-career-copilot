'use client';
import { useState, useMemo } from 'react';

export default function CourseLibrary({ courses }) {
    const [difficultyFilter, setDifficultyFilter] = useState('all');
    const [pricingFilter, setPricingFilter] = useState('all');
    const [platformFilter, setPlatformFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const platforms = useMemo(() => [...new Set(courses.map(c => c.platform))], [courses]);

    const filtered = useMemo(() => {
        let result = [...courses];
        if (difficultyFilter !== 'all') result = result.filter(c => c.difficulty === difficultyFilter);
        if (pricingFilter === 'free') result = result.filter(c => c.price.toLowerCase() === 'free');
        else if (pricingFilter === 'paid') result = result.filter(c => c.price.toLowerCase() !== 'free');
        if (platformFilter !== 'all') result = result.filter(c => c.platform === platformFilter);
        if (searchQuery) result = result.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.category.toLowerCase().includes(searchQuery.toLowerCase()) || c.skillGap.toLowerCase().includes(searchQuery.toLowerCase()));
        return result;
    }, [courses, difficultyFilter, pricingFilter, platformFilter, searchQuery]);

    const diffColors = { beginner: 'bg-green-100 text-green-700', intermediate: 'bg-blue-100 text-blue-700', advanced: 'bg-purple-100 text-purple-700' };

    return (
        <div>
            <div className="mb-6"><h1 className="text-[28px] font-bold text-gray-900">Course Recommendations</h1><p className="text-[15px] text-gray-500 mt-1">Curated learning resources to bridge your skill gaps</p></div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-[20px]">search</span>
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search courses, skills..." className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-white/60 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-400" />
                </div>
                <select value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value)} className="px-4 py-2.5 bg-white/50 border border-white/60 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-700">
                    <option value="all">All Levels</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
                </select>
                <select value={pricingFilter} onChange={e => setPricingFilter(e.target.value)} className="px-4 py-2.5 bg-white/50 border border-white/60 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-700">
                    <option value="all">All Pricing</option><option value="free">Free</option><option value="paid">Paid</option>
                </select>
                <select value={platformFilter} onChange={e => setPlatformFilter(e.target.value)} className="px-4 py-2.5 bg-white/50 border border-white/60 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-700">
                    <option value="all">All Platforms</option>{platforms.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>

            <p className="text-[13px] text-gray-500 mb-4">{filtered.length} courses found</p>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map(course => (
                    <a key={course.id} href={course.url} target="_blank" rel="noopener noreferrer" className="rounded-[16px] p-6 shadow-sm hover:shadow-md transition-all border border-white/50 block group" style={{ backgroundImage: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)' }}>
                        <div className="flex items-start gap-3">
                            <div className="bg-white/40 p-2.5 rounded-lg text-blue-600 shrink-0 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-xl">play_circle</span></div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-[15px] text-gray-900 mb-1 truncate">{course.title}</h4>
                                <p className="text-[13px] text-gray-500">{course.platform} • {course.instructor}</p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <span className="text-[13px] text-yellow-600 font-medium">★ {course.rating}</span>
                                    <span className="text-[12px] text-gray-400">({course.ratingsCount?.toLocaleString()})</span>
                                    <span className="text-[12px] text-gray-400">• {course.duration}</span>
                                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${diffColors[course.difficulty] || 'bg-gray-100 text-gray-600'}`}>{course.difficulty}</span>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-[14px] font-bold text-blue-600">{course.price}</span>
                                    <span className="px-2.5 py-0.5 bg-white/40 rounded-full text-[12px] text-gray-600 font-medium">{course.skillGap}</span>
                                </div>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
            {filtered.length === 0 && <div className="text-center py-12 text-gray-400"><span className="material-symbols-outlined text-[48px] mb-3 block">search_off</span><p className="text-[16px] font-medium">No courses match your filters</p></div>}
        </div>
    );
}
