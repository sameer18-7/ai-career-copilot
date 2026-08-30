'use client';

import { User, Target, Building, Upload, Sparkles, FileText } from 'lucide-react';
import { useState } from 'react';

const roles = ['Frontend Dev', 'Backend Dev', 'Full Stack Dev', 'Data Scientist', 'ML Engineer', 'DevOps Engineer', 'Mobile Developer', 'UI/UX Designer'];
const companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Flipkart', 'Razorpay', 'Swiggy'];

export default function ProfileInput({ onGenerate }) {
    const [role, setRole] = useState('');
    const [company, setCompany] = useState('');
    const [resumeFile, setResumeFile] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setResumeFile(file);
        } else {
            alert('Please upload a valid PDF file.');
        }
    };

    return (
        <div className="glass-card p-6 fade-in-up">
            <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/20">
                    <User className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-100">Your Career Profile</h2>
                    <p className="text-sm text-slate-500">Tell us your target and we'll build your roadmap</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Target Role */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                        <Target className="h-4 w-4 text-purple-400" />
                        Target Role
                    </label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="input-field appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-slate-900">Select a role...</option>
                        {roles.map((r) => (
                            <option key={r} value={r} className="bg-slate-900">{r}</option>
                        ))}
                    </select>
                </div>

                {/* Target Company */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                        <Building className="h-4 w-4 text-pink-400" />
                        Target Company
                    </label>
                    <select
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="input-field appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-slate-900">Select a company...</option>
                        {companies.map((c) => (
                            <option key={c} value={c} className="bg-slate-900">{c}</option>
                        ))}
                    </select>
                </div>

                {/* Upload Resume */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                        <FileText className="h-4 w-4 text-indigo-400" />
                        Current Resume
                    </label>
                    <label
                        className={`w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-2.5 text-sm font-medium transition-all cursor-pointer ${resumeFile
                                ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400'
                                : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400 hover:bg-slate-800/30'
                            }`}
                    >
                        <input 
                            type="file" 
                            accept=".pdf" 
                            className="hidden" 
                            onChange={handleFileChange} 
                        />
                        {resumeFile ? (
                            <span className="truncate max-w-[200px]">✓ {resumeFile.name}</span>
                        ) : (
                            <><Upload className="h-4 w-4" /> Upload Resume (PDF)</>
                        )}
                    </label>
                </div>
            </div>

            {/* Generate Button */}
            <div className="mt-6 flex justify-center">
                <button
                    onClick={() => onGenerate(role || 'Frontend Dev', company || 'Google', resumeFile)}
                    disabled={!role && !company}
                    style={{ opacity: (!role && !company) ? 0.5 : 1 }}
                    className="btn-primary flex items-center gap-2 text-base px-8 py-3"
                >
                    <Sparkles className="h-5 w-5" />
                    Generate Career Roadmap
                </button>
            </div>
        </div>
    );
}
