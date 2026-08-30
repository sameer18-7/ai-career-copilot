'use client';

function parseResumeSection(text) {
    const lines = text.trim().split('\n');
    const sections = [];
    let currentSection = { title: 'Header', lines: [] };

    const sectionHeaders = [
        'EDUCATION', 'EXPERIENCE', 'PROJECTS', 'SKILLS', 'ACHIEVEMENTS',
        'CERTIFICATIONS', 'WORK EXPERIENCE', 'TECHNICAL SKILLS', 'SUMMARY',
    ];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (sectionHeaders.some((h) => trimmed.toUpperCase() === h)) {
            if (currentSection.lines.length > 0) {
                sections.push(currentSection);
            }
            currentSection = { title: trimmed, lines: [] };
        } else {
            currentSection.lines.push(trimmed);
        }
    }
    if (currentSection.lines.length > 0) {
        sections.push(currentSection);
    }

    return sections;
}

function getSectionIcon(title) {
    const t = title.toUpperCase();
    if (t.includes('EDUCATION')) return 'school';
    if (t.includes('EXPERIENCE')) return 'work';
    if (t.includes('PROJECT')) return 'code';
    if (t.includes('SKILL')) return 'build';
    if (t.includes('ACHIEVEMENT') || t.includes('CERTIFICATION')) return 'military_tech';
    return 'description';
}

export default function ResumeViewerModal({ candidate, resumeText, onClose }) {
    const sections = parseResumeSection(resumeText || '');
    const headerSection = sections.length > 0 && sections[0].title === 'Header' ? sections[0] : null;
    const bodySections = headerSection ? sections.slice(1) : sections;

    const candidateName = headerSection?.lines[0] || candidate.id;
    const contactLines = headerSection?.lines.slice(1) || [];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '720px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
            >
                <div className="flex items-center justify-between mb-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2.5 rounded-xl">
                            <span className="material-symbols-outlined text-[#2563EB] text-xl">description</span>
                        </div>
                        <div>
                            <h3 className="text-[18px] font-bold text-gray-900">Resume Viewer</h3>
                            <p className="text-[13px] text-gray-500">{candidate.fileName || 'resume.pdf'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`px-3 py-1.5 rounded-lg font-bold text-[13px] ${candidate.matchScore >= 80 ? 'bg-green-50 text-green-700 border border-green-200' : candidate.matchScore >= 60 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                            {candidate.matchScore}% Match
                        </div>
                        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 pr-2">
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                            <h2 className="text-[22px] font-bold text-gray-900 mb-2">{candidateName}</h2>
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                                {contactLines.map((line, i) => {
                                    const parts = line.split('|').map((p) => p.trim());
                                    return parts.map((part, j) => (
                                        <span key={`${i}-${j}`} className="text-[13px] text-gray-500 flex items-center gap-1.5">
                                            {part.includes('@') ? <span className="material-symbols-outlined text-[14px] text-blue-500">mail</span> :
                                                part.includes('+91') || part.includes('Phone') ? <span className="material-symbols-outlined text-[14px] text-green-500">phone</span> :
                                                    part.includes('linkedin') || part.includes('github') || part.includes('http') ? <span className="material-symbols-outlined text-[14px] text-purple-500">link</span> :
                                                        null}
                                            {part}
                                        </span>
                                    ));
                                })}
                            </div>
                        </div>

                        <div className="px-8 py-5 space-y-5">
                            {bodySections.map((section, si) => (
                                <div key={si}>
                                    <div className="flex items-center gap-2 mb-3 pb-1.5 border-b border-blue-100">
                                        <span className="material-symbols-outlined text-[#2563EB] text-[16px]">{getSectionIcon(section.title)}</span>
                                        <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#2563EB]">{section.title}</h3>
                                    </div>
                                    <div className="space-y-1">
                                        {section.lines.map((line, li) => {
                                            const isBullet = line.startsWith('•') || line.startsWith('-');
                                            const isBold = /^[A-Z].*—|^\w+.*\(.*\)$/.test(line) && !isBullet;
                                            const isSkillLine = section.title.toUpperCase().includes('SKILL') && line.includes(':');

                                            if (isSkillLine) {
                                                const [label, values] = line.split(':');
                                                return (
                                                    <div key={li} className="flex flex-wrap gap-1 mb-2">
                                                        <span className="text-[12px] font-semibold text-gray-700 mr-2 min-w-[80px]">{label.trim()}:</span>
                                                        {values?.split(',').map((v, vi) => (
                                                            <span key={vi} className="inline-block px-2 py-0.5 text-[11px] rounded-md bg-blue-50 text-[#2563EB] border border-blue-100">
                                                                {v.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                );
                                            }

                                            return (
                                                <p key={li} className={`text-[13px] leading-relaxed ${isBullet ? 'text-gray-500 pl-2' : isBold ? 'text-gray-800 font-semibold mt-2' : 'text-gray-600'}`}>
                                                    {line}
                                                </p>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 shrink-0">
                    <p className="text-[12px] text-gray-400">Candidate ID: {candidate.id} • Blind Hiring Mode Active</p>
                    <button onClick={onClose} className="btn-secondary">Close</button>
                </div>
            </div>
        </div>
    );
}
