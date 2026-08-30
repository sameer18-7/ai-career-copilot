'use client';

import { useState, useRef, useEffect } from 'react';

const SKILL_SUGGESTIONS = [
    'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'C', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala', 'Perl',
    'React', 'Next.js', 'Angular', 'Vue.js', 'Svelte', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'Ruby on Rails',
    'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap', 'SASS', 'LESS',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Firebase', 'Supabase', 'DynamoDB', 'Cassandra', 'SQLite',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'CI/CD', 'GitHub Actions',
    'Git', 'Linux', 'Bash', 'REST API', 'GraphQL', 'gRPC', 'WebSockets',
    'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy',
    'Data Structures', 'Algorithms', 'System Design', 'OOP', 'Design Patterns', 'Microservices', 'Agile', 'Scrum',
    'Testing', 'Jest', 'Cypress', 'Selenium', 'Unit Testing', 'Integration Testing',
    'Figma', 'UI/UX Design', 'Adobe XD', 'Photoshop',
    'Blockchain', 'Solidity', 'Web3', 'Smart Contracts',
    'React Native', 'Flutter', 'Android', 'iOS', 'Mobile Development',
    'DevOps', 'Networking', 'Cybersecurity', 'Cloud Computing', 'Data Analytics', 'Power BI', 'Tableau',
    'Communication', 'Leadership', 'Problem Solving', 'Critical Thinking', 'Teamwork', 'Project Management',
];

export default function CreateJobForm({ onAnalyze }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [competency, setCompetency] = useState('');
    const [competencies, setCompetencies] = useState([]);
    const [files, setFiles] = useState([]);
    const [dragOver, setDragOver] = useState(false);
    const [topN, setTopN] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const fileInputRef = useRef(null);
    const suggestionsRef = useRef(null);
    const competencyInputRef = useRef(null);

    const filteredSuggestions = competency.trim()
        ? SKILL_SUGGESTIONS.filter(
            skill => skill.toLowerCase().includes(competency.toLowerCase()) && !competencies.includes(skill)
        ).slice(0, 8)
        : [];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
                competencyInputRef.current && !competencyInputRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setHighlightedIndex(-1);
    }, [competency]);

    const addCompetency = (value) => {
        const val = (value || competency).trim();
        if (val && !competencies.includes(val)) {
            setCompetencies([...competencies, val]);
            setCompetency('');
            setShowSuggestions(false);
            setHighlightedIndex(-1);
        }
    };

    const removeCompetency = (c) => {
        setCompetencies(competencies.filter((item) => item !== c));
    };

    const selectSuggestion = (skill) => {
        addCompetency(skill);
        competencyInputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (showSuggestions && filteredSuggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlightedIndex(prev => (prev + 1) % filteredSuggestions.length);
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightedIndex(prev => prev <= 0 ? filteredSuggestions.length - 1 : prev - 1);
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                if (highlightedIndex >= 0) {
                    selectSuggestion(filteredSuggestions[highlightedIndex]);
                } else {
                    addCompetency();
                }
                return;
            }
            if (e.key === 'Escape') {
                setShowSuggestions(false);
                return;
            }
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            addCompetency();
        }
    };

    const processFiles = (fileList) => {
        const pdfFiles = Array.from(fileList).filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
        if (pdfFiles.length === 0) {
            alert('Please upload PDF files only.');
            return;
        }
        setFiles(prev => [...prev, ...pdfFiles]);
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer?.files?.length) {
            processFiles(e.dataTransfer.files);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files?.length) {
            processFiles(e.target.files);
            e.target.value = '';
        }
    };

    const simulateFileUpload = () => {
        // Create mock File objects for demo purposes
        const mockNames = [
            'resume_ankit_sharma.pdf', 'resume_priya_verma.pdf', 'resume_rahul_gupta.pdf',
            'resume_sneha_reddy.pdf', 'resume_vikram_singh.pdf', 'resume_deepika_jain.pdf',
            'resume_arjun_nair.pdf', 'resume_kavya_menon.pdf',
        ];
        const mockFiles = mockNames.map(name => new File([''], name, { type: 'application/pdf' }));
        setFiles(mockFiles);
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    return (
        <div className="rounded-[16px] p-6 shadow-sm" style={{ backgroundColor: '#DCD9D4', backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.50) 0%, rgba(0,0,0,0.50) 100%), radial-gradient(at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.50) 50%)', backgroundBlendMode: 'soft-light, screen' }}>
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2.5 rounded-xl">
                    <span className="material-symbols-outlined text-blue-600 text-xl">work</span>
                </div>
                <div>
                    <h2 className="text-[18px] font-bold text-gray-900">Create Job Posting</h2>
                    <p className="text-[13px] text-gray-500">Define the role and upload candidate resumes</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-5">
                    <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Job Title</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Frontend Developer" className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-400" />
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Job Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the role, responsibilities, and requirements..." className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-400" rows={4} />
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Expected Competencies</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    ref={competencyInputRef}
                                    type="text"
                                    value={competency}
                                    onChange={(e) => { setCompetency(e.target.value); setShowSuggestions(true); }}
                                    onFocus={() => setShowSuggestions(true)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="e.g. React, TypeScript..."
                                    className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-400"
                                    autoComplete="off"
                                />
                                {showSuggestions && filteredSuggestions.length > 0 && (
                                    <div
                                        ref={suggestionsRef}
                                        className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-h-56 overflow-y-auto"
                                    >
                                        {filteredSuggestions.map((skill, idx) => (
                                            <button
                                                key={skill}
                                                onClick={() => selectSuggestion(skill)}
                                                onMouseEnter={() => setHighlightedIndex(idx)}
                                                className={`w-full text-left px-4 py-2.5 text-[14px] transition-colors flex items-center gap-2 ${idx === highlightedIndex
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <span className="material-symbols-outlined text-[16px]" style={{ color: idx === highlightedIndex ? '#2563EB' : '#9CA3AF' }}>code</span>
                                                <span>
                                                    {skill.split(new RegExp(`(${competency.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i')).map((part, i) =>
                                                        part.toLowerCase() === competency.toLowerCase()
                                                            ? <strong key={i} className="font-bold text-blue-600">{part}</strong>
                                                            : <span key={i}>{part}</span>
                                                    )}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button onClick={() => addCompetency()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-[14px] font-semibold transition-colors flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">add</span>Add
                            </button>
                        </div>
                        {competencies.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {competencies.map((c) => (
                                    <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-[13px] font-medium text-blue-700 border border-blue-200">
                                        {c}
                                        <button onClick={() => removeCompetency(c)} className="ml-1 hover:text-red-500 transition-colors">
                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                            Top Candidates to Show <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={topN}
                            onChange={(e) => setTopN(e.target.value)}
                            placeholder="e.g. 5 (Leave empty to show all)"
                            className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-400"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Upload Resumes (PDF)</label>

                    {/* Hidden real file input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf,application/pdf"
                        multiple
                        onChange={handleFileSelect}
                    />

                    <div
                        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${dragOver ? 'border-blue-500 bg-blue-50/50' : 'border-white/60 hover:border-white/80 bg-white/20'}`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleFileDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className="bg-blue-100 p-4 rounded-2xl border border-blue-200">
                                <span className="material-symbols-outlined text-blue-600 text-3xl">upload_file</span>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">Drop PDF resumes here or click to browse</p>
                                <p className="text-[13px] text-gray-500 mt-1">Only .pdf files accepted • Multiple files supported</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick demo button */}
                    <button onClick={(e) => { e.stopPropagation(); simulateFileUpload(); }} className="text-[13px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">science</span>
                        Load sample resumes (demo)
                    </button>

                    {files.length > 0 && (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wider">{files.length} files uploaded</p>
                            {files.map((file, i) => (
                                <div key={i} className="flex items-center gap-3 rounded-lg bg-white/30 px-3 py-2 border border-white/40">
                                    <span className="material-symbols-outlined text-blue-600 text-[18px]">description</span>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-[13px] text-gray-800 truncate block">{file.name || file}</span>
                                        {file.size > 0 && <span className="text-[11px] text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>}
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="text-gray-400 hover:text-red-500 transition-colors">
                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <button
                    onClick={() => onAnalyze({ title: title || 'Senior Frontend Developer', description, competencies, topN: topN ? parseInt(topN) : 0, files })}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-[15px] font-semibold transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2 disabled:opacity-50"
                    disabled={files.length === 0}
                >
                    <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                    Analyze Fit with AI
                </button>
            </div>
        </div>
    );
}
