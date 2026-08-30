'use client';

import { useState } from 'react';
import { visitingCompanies, topStudentsForCompany } from '@/data/mockCollegeData';

export default function CompanyMapping() {
    const [selectedCompany, setSelectedCompany] = useState('');
    const students = selectedCompany ? topStudentsForCompany[selectedCompany] || [] : [];
    const company = visitingCompanies.find((c) => c.id === selectedCompany);

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 80) return 'text-blue-600';
        if (score >= 70) return 'text-amber-600';
        return 'text-gray-500';
    };

    const getScoreBarColor = (score) => {
        if (score >= 90) return 'bg-green-500';
        if (score >= 80) return 'bg-blue-500';
        if (score >= 70) return 'bg-amber-500';
        return 'bg-gray-400';
    };

    return (
        <div className="bg-white rounded-[16px] p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-100 p-2.5 rounded-xl">
                    <span className="material-symbols-outlined text-purple-600 text-xl">hub</span>
                </div>
                <div>
                    <h2 className="text-[18px] font-bold text-gray-900">Company-Student Mapping</h2>
                    <p className="text-[13px] text-gray-500">AI-matched top 10% students (overriding CGPA metrics)</p>
                </div>
            </div>

            {/* Company Selector */}
            <div className="mb-6">
                <label className="block text-[13px] font-medium text-gray-600 mb-2">Select Visiting Company</label>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {visitingCompanies.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => setSelectedCompany(c.id)}
                            className={`rounded-xl p-4 text-left transition-all border ${selectedCompany === c.id
                                ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100'
                                : 'bg-gray-50 border-gray-100 hover:border-gray-200 hover:bg-gray-100'}`}
                        >
                            <p className={`font-bold text-[13px] ${selectedCompany === c.id ? 'text-[#2563EB]' : 'text-gray-700'}`}>{c.name}</p>
                            <p className="text-[12px] text-gray-500 mt-0.5">{c.role}</p>
                            <p className="text-[12px] font-semibold text-green-600 mt-1">{c.package}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Company Requirements */}
            {company && (
                <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-[12px] font-semibold uppercase tracking-wider text-[#2563EB] mb-2">Required Competencies</p>
                    <div className="flex flex-wrap gap-2">
                        {company.requirements.map((req) => (
                            <span key={req} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[12px] font-medium text-[#2563EB] border border-blue-200">
                                <span className="material-symbols-outlined text-[14px]">sell</span>{req}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Student Table */}
            {students.length > 0 && (
                <div className="overflow-x-auto">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-purple-600 text-[18px]">shield</span>
                        <p className="text-[14px] font-semibold text-gray-700">Top {students.length} AI-Matched Students for {company?.name}</p>
                        <span className="badge badge-purple text-[12px] ml-2">CGPA Overridden</span>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="pb-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-400 w-16">Rank</th>
                                <th className="pb-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-400">Student ID</th>
                                <th className="pb-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-400 w-44">AI Match Score</th>
                                <th className="pb-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-400">Key Strengths</th>
                                <th className="pb-3 text-right text-[12px] font-semibold uppercase tracking-wider text-gray-400 w-24">CGPA</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {students.map((student, i) => (
                                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3.5">
                                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-50">
                                            {student.rank <= 3 ? (
                                                <span className={`material-symbols-outlined text-[18px] ${student.rank === 1 ? 'text-amber-500' : student.rank === 2 ? 'text-gray-400' : 'text-amber-700'}`}>emoji_events</span>
                                            ) : (
                                                <span className="text-[12px] font-bold text-gray-400">#{student.rank}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3.5">
                                        <span className="font-semibold text-gray-800 text-[14px]">{student.id}</span>
                                    </td>
                                    <td className="py-3.5">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[14px] font-bold tabular-nums ${getScoreColor(student.matchScore)}`}>{student.matchScore}%</span>
                                            <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                                <div className={`h-full rounded-full ${getScoreBarColor(student.matchScore)} score-bar`} style={{ width: `${student.matchScore}%`, animationDelay: `${i * 0.08}s` }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3.5">
                                        <p className="text-[12px] text-gray-500">{student.strengths}</p>
                                    </td>
                                    <td className="py-3.5 text-right">
                                        <span className="text-[14px] text-gray-500 tabular-nums">{student.cgpa}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!selectedCompany && (
                <div className="text-center py-12 text-gray-400">
                    <span className="material-symbols-outlined text-[48px] mb-3 block opacity-30">apartment</span>
                    <p className="font-medium">Select a company above to see matched students</p>
                </div>
            )}
        </div>
    );
}
