'use client';

import { useState } from 'react';

export default function InterviewSchedulingModal({ candidate, jobTitle, onClose }) {
    const [scheduledDate, setScheduledDate] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSchedule = async (e) => {
        e.preventDefault();
        setSending(true);

        try {
            const response = await fetch('/api/company/schedule-interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidateId: candidate.id,
                    jobTitle,
                    scheduledDate,
                    candidateEmail: `${candidate.id.toLowerCase()}@example.com` // Mock email for now
                }),
            });

            if (response.ok) {
                setSent(true);
            }
        } catch (err) {
            console.error('Scheduling error:', err);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
                <div className="bg-[#1a1a1a] p-6 text-white">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">Schedule Interview</h3>
                        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <p className="text-white/60 text-sm mt-1">For Candidate {candidate.id} • {jobTitle}</p>
                </div>

                {sent ? (
                    <div className="p-10 text-center">
                        <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-4xl">check_circle</span>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">Invite Sent!</h4>
                        <p className="text-gray-500 mt-2">A calendar invite and email have been sent to the candidate.</p>
                        <button onClick={onClose} className="mt-6 w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all">
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSchedule} className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Preferred Interview Date & Time</label>
                            <input
                                type="datetime-local"
                                required
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <div className="flex gap-3">
                                <span className="material-symbols-outlined text-blue-600">info</span>
                                <p className="text-[13px] text-blue-800 leading-snug">
                                    The candidate will receive an email with this slot. They can accept it or request a different time through our automated sync.
                                </p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-900/10 transition-all flex items-center justify-center gap-2"
                        >
                            {sending ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Syncing Calendars...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                                    <span>Send Invite & Sync</span>
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
