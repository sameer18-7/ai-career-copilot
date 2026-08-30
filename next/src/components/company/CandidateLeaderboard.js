'use client';

import { useState } from 'react';
import EmailModal from './EmailModal';
import ResumeViewerModal from './ResumeViewerModal';
import InterviewSchedulingModal from './InterviewSchedulingModal';

export default function CandidateLeaderboard({ candidates, jobTitle, resumeTexts }) {
    const [emailCandidate, setEmailCandidate] = useState(null);
    const [viewCandidate, setViewCandidate] = useState(null);
    const [scheduleCandidate, setScheduleCandidate] = useState(null);
    const [shortlisted, setShortlisted] = useState({});
    const [risks, setRisks] = useState({});
    const [predicting, setPredicting] = useState({});

    const handleShortlist = (candidate) => {
        setEmailCandidate(candidate);
        setShortlisted((prev) => ({ ...prev, [candidate.id]: true }));
    };

    const handlePredictRisk = async (candidate) => {
        setPredicting(prev => ({ ...prev, [candidate.id]: true }));
        try {
            // In a real app, candidate.offerId would be passed
            // Here we simulate for individual candidates
            const response = await fetch('/api/company/predict-retention', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offerId: candidate.id }),
            });
            const data = await response.json();
            setRisks(prev => ({ ...prev, [candidate.id]: data }));
        } catch (err) {
            console.error('Risk prediction error:', err);
        } finally {
            setPredicting(prev => ({ ...prev, [candidate.id]: false }));
        }
    };

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

    const getRiskBadge = (risk) => {
        const colors = {
            'High': 'bg-red-100 text-red-700 border-red-200',
            'Medium': 'bg-amber-100 text-amber-700 border-amber-200',
            'Low': 'bg-green-100 text-green-700 border-green-200'
        };
        return colors[risk] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
        <>
            <div className="bg-white rounded-[16px] p-6 shadow-xl border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2.5 rounded-xl">
                            <span className="material-symbols-outlined text-indigo-600 text-xl">analytics</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-[18px] font-bold text-gray-900">Advanced Hiring Leaderboard</h2>
                                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg text-[12px] font-bold border border-indigo-100">
                                    AI-Powered Insights
                                </span>
                            </div>
                            <p className="text-[13px] text-gray-500 mt-1">Retention prediction & Automated synchronization active</p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="pb-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-400 w-28">Candidate</th>
                                <th className="pb-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-400 w-32">Match Score</th>
                                <th className="pb-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-400 w-44">Retention Risk (Joining Prediction)</th>
                                <th className="pb-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-400">Analysis Highlights</th>
                                <th className="pb-3 text-right text-[12px] font-semibold uppercase tracking-wider text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(candidates || []).map((candidate, index) => {
                                const rank = index + 1;
                                const strengths = candidate.keyStrengths || candidate.skills || [];
                                const riskInfo = risks[candidate.id];
                                return (
                                    <tr key={candidate.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-[13px] font-bold ${rank <= 3 ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                                                    {candidate.id.slice(-2)}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-gray-900 text-[14px]">{candidate.id}</span>
                                                    <p className="text-[11px] text-gray-400">Rank #{rank}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center justify-between text-[13px] font-bold mb-0.5">
                                                    <span className={getScoreColor(candidate.matchScore)}>{candidate.matchScore}%</span>
                                                </div>
                                                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                                                    <div className={`h-full rounded-full ${getScoreBarColor(candidate.matchScore)}`} style={{ width: `${candidate.matchScore}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5">
                                            {riskInfo ? (
                                                <div className="flex flex-col gap-1.5 animate-fade-in">
                                                    <div className={`inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${getRiskBadge(riskInfo.retentionRisk)}`}>
                                                        <span className="h-2 w-2 rounded-full bg-current"></span>
                                                        {riskInfo.retentionRisk} Risk
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 leading-tight pr-4" title={riskInfo.riskJustification}>
                                                        {riskInfo.riskJustification?.length > 60 ? riskInfo.riskJustification.slice(0, 60) + '...' : (riskInfo.riskJustification || 'No justification provided')}
                                                    </p>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handlePredictRisk(candidate)}
                                                    disabled={predicting[candidate.id]}
                                                    className="flex items-center gap-1.5 text-[12px] font-semibold text-indigo-600 hover:text-indigo-700 py-1"
                                                >
                                                    {predicting[candidate.id] ? (
                                                        <div className="h-3 w-3 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                                    ) : (
                                                        <span className="material-symbols-outlined text-[16px]">psychology</span>
                                                    )}
                                                    Predict Likelihood
                                                </button>
                                            )}
                                        </td>
                                        <td className="py-5">
                                            <div className="flex flex-col gap-2">
                                                <p className="text-[12px] text-gray-600 leading-relaxed max-w-sm line-clamp-2">{candidate.justification}</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {strengths.slice(0, 2).map((skill) => (
                                                        <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => setScheduleCandidate(candidate)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100" title="Schedule Interview">
                                                    <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                                                </button>
                                                <button onClick={() => setViewCandidate(candidate)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200" title="View Resume">
                                                    <span className="material-symbols-outlined text-[20px]">description</span>
                                                </button>
                                                <button
                                                    onClick={() => handleShortlist(candidate)}
                                                    className={`px-4 py-2 text-[13px] font-bold rounded-lg transition-all ${shortlisted[candidate.id] ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                                                >
                                                    {shortlisted[candidate.id] ? 'Shortlisted' : 'Shortlist'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {emailCandidate && <EmailModal candidate={emailCandidate} jobTitle={jobTitle} onClose={() => setEmailCandidate(null)} />}
            {viewCandidate && <ResumeViewerModal candidate={viewCandidate} resumeText={resumeTexts?.[viewCandidate.fileName] || ''} onClose={() => setViewCandidate(null)} />}
            {scheduleCandidate && <InterviewSchedulingModal candidate={scheduleCandidate} jobTitle={jobTitle} onClose={() => setScheduleCandidate(null)} />}
        </>
    );
}
