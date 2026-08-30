'use client';
import { useState } from 'react';

const statusConfig = {
    applied: { label: 'Applied', color: 'bg-blue-100 text-blue-700', icon: 'send' },
    shortlisted: { label: 'Shortlisted', color: 'bg-yellow-100 text-yellow-700', icon: 'star' },
    interview: { label: 'Interview', color: 'bg-purple-100 text-purple-700', icon: 'groups' },
    offered: { label: 'Offered', color: 'bg-green-100 text-green-700', icon: 'celebration' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: 'close' },
};

const roundStatusColors = { passed: 'text-green-600', failed: 'text-red-600', scheduled: 'text-blue-600', upcoming: 'text-gray-500' };

export default function ApplicationTracker({ applications }) {
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [noteInputs, setNoteInputs] = useState({});

    const filtered = statusFilter === 'all' ? applications : applications.filter(a => a.status === statusFilter);
    const counts = { all: applications.length, applied: applications.filter(a => a.status === 'applied').length, shortlisted: applications.filter(a => a.status === 'shortlisted').length, interview: applications.filter(a => a.status === 'interview').length, offered: applications.filter(a => a.status === 'offered').length, rejected: applications.filter(a => a.status === 'rejected').length };

    return (
        <div>
            <div className="mb-6"><h1 className="text-[28px] font-bold text-gray-900">Application Tracker</h1><p className="text-[15px] text-gray-500 mt-1">Track your job applications, interviews, and offers</p></div>

            {/* Status Summary */}
            <div className="grid grid-cols-6 gap-3 mb-6">
                {Object.entries({ all: { label: 'All', color: 'bg-gray-100 text-gray-700', icon: 'apps' }, ...statusConfig }).map(([key, cfg]) => (
                    <button key={key} onClick={() => setStatusFilter(key)} className={`rounded-xl p-3 text-center border transition-all ${statusFilter === key ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm' : 'border-white/50'}`} style={{ backgroundImage: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)' }}>
                        <span className="material-symbols-outlined text-[20px] text-gray-700 block mb-1">{cfg.icon}</span>
                        <p className="text-[18px] font-bold text-gray-900">{counts[key]}</p>
                        <p className="text-[11px] text-gray-500 font-medium uppercase">{cfg.label}</p>
                    </button>
                ))}
            </div>

            {/* Application Cards */}
            <div className="space-y-4">
                {filtered.map(app => {
                    const sc = statusConfig[app.status];
                    const isExpanded = expandedId === app.id;
                    return (
                        <div key={app.id} className="rounded-[16px] shadow-sm overflow-hidden" style={{ backgroundColor: '#DCD9D4', backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.50) 0%, rgba(0,0,0,0.50) 100%), radial-gradient(at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.50) 50%)', backgroundBlendMode: 'soft-light, screen' }}>
                            <div className="p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : app.id)}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white/40 w-12 h-12 rounded-xl flex items-center justify-center"><span className="material-symbols-outlined text-gray-900">business</span></div>
                                        <div>
                                            <h3 className="text-[16px] font-bold text-gray-900">{app.role}</h3>
                                            <p className="text-[14px] text-gray-500">{app.company} • {app.location} • {app.package}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[13px] font-medium text-green-600">{app.matchScore}% match</span>
                                        <span className={`px-2.5 py-1 rounded-full text-[12px] font-bold ${sc.color}`}>{sc.label}</span>
                                        <span className="text-[13px] text-gray-400">{app.appliedDate}</span>
                                        <span className={`material-symbols-outlined text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                                    </div>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="px-5 pb-5 border-t border-white/30 pt-4">
                                    {/* Interview Rounds */}
                                    {app.interviewRounds.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="text-[14px] font-bold text-gray-900 mb-3">Interview Rounds</h4>
                                            <div className="space-y-2">
                                                {app.interviewRounds.map((r, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/20 border border-white/30">
                                                        <div className="bg-white/40 w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold text-gray-700">{r.round}</div>
                                                        <div className="flex-1"><p className="text-[14px] font-medium text-gray-900">{r.type}</p><p className="text-[12px] text-gray-500">{r.date}</p></div>
                                                        <span className={`text-[13px] font-bold capitalize ${roundStatusColors[r.status] || 'text-gray-500'}`}>{r.status}</span>
                                                        {r.feedback && <p className="text-[12px] text-gray-500 max-w-[200px] truncate" title={r.feedback}>{r.feedback}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {/* Notes */}
                                    <div>
                                        <h4 className="text-[14px] font-bold text-gray-900 mb-2">Notes</h4>
                                        <p className="text-[13px] text-gray-600 bg-white/20 p-3 rounded-lg border border-white/30">{app.notes || 'No notes yet.'}</p>
                                        <div className="flex gap-2 mt-2">
                                            <input value={noteInputs[app.id] || ''} onChange={e => setNoteInputs({ ...noteInputs, [app.id]: e.target.value })} placeholder="Add a note..." className="flex-1 px-3 py-2 bg-white/50 border border-white/60 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-400" />
                                            <button onClick={() => setNoteInputs({ ...noteInputs, [app.id]: '' })} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-blue-700 transition-colors">Save</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {filtered.length === 0 && <div className="text-center py-12 text-gray-400"><span className="material-symbols-outlined text-[48px] mb-3 block">folder_off</span><p className="text-[16px] font-medium">No applications with this status</p></div>}
        </div>
    );
}
