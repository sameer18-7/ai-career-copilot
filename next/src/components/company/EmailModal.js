'use client';

export default function EmailModal({ candidate, jobTitle, onClose }) {
    const strengths = candidate.keyStrengths || candidate.skills || [];
    const missingSkills = candidate.criticalMissingSkills || [];

    const emailTemplate = {
        to: `candidate_${candidate.id.toLowerCase()}@university.ac.in`,
        subject: `Interview Invitation — ${jobTitle || 'Open Position'}`,
        body: `Dear Candidate ${candidate.id},

We are pleased to inform you that after a thorough AI-powered evaluation of your resume, you have been shortlisted for the "${jobTitle || 'Open Position'}" position.

Your Profile Highlights:
• Match Score: ${candidate.matchScore}%
• Key Strengths: ${strengths.join(', ') || 'N/A'}

AI Assessment Summary:
"${candidate.justification}"
${missingSkills.length > 0 ? `
Areas for Growth:
${missingSkills.map(s => `• ${s}`).join('\n')}
` : ''}
Next Steps:
1. Technical Interview — Round 1 (Online Coding Assessment)
2. Technical Interview — Round 2 (System Design & Problem Solving)
3. HR Interview & Cultural Fit Assessment

Please confirm your availability for the first round by replying to this email within 48 hours.

We look forward to speaking with you!

Best regards,
Hiring Team
Powered by Placify AI`,
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2.5 rounded-xl">
                            <span className="material-symbols-outlined text-[#2563EB] text-xl">mail</span>
                        </div>
                        <div>
                            <h3 className="text-[18px] font-bold text-gray-900">Shortlist & Send Email</h3>
                            <p className="text-[13px] text-gray-500">Candidate {candidate.id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex items-center gap-4 mb-6 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 border border-blue-200">
                        <span className="material-symbols-outlined text-[#2563EB]">person</span>
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-gray-800">{candidate.id}</p>
                        <p className="text-[13px] text-gray-500">Blind Hiring — Identity Protected</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg font-bold text-[13px] ${candidate.matchScore >= 90 ? 'bg-green-50 text-green-700 border border-green-200' : candidate.matchScore >= 80 ? 'bg-blue-50 text-blue-700 border border-blue-200' : candidate.matchScore >= 70 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                        {candidate.matchScore}% Match
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[13px] font-medium text-gray-600 mb-1.5">To</label>
                        <input type="email" defaultValue={emailTemplate.to} className="input-field" />
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium text-gray-600 mb-1.5">Subject</label>
                        <input type="text" defaultValue={emailTemplate.subject} className="input-field" />
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium text-gray-600 mb-1.5">Message Body</label>
                        <textarea className="input-field font-mono text-[12px] leading-relaxed" rows={14} defaultValue={emailTemplate.body} />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button onClick={() => { alert('✅ Email sent successfully! (Simulated)'); onClose(); }} className="btn-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">send</span>Send Email
                    </button>
                </div>
            </div>
        </div>
    );
}
