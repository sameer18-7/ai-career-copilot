'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const TABS = ['Explore Jobs', 'My Applications', 'My Profile', 'AI Match'];

export default function IndividualDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('Explore Jobs');
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applyingJob, setApplyingJob] = useState(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [applyStatus, setApplyStatus] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        name: '',
        headline: '',
        location: '',
        phone: '',
        linkedin: '',
        github: '',
        portfolio: '',
        currentRole: '',
        currentCompany: '',
        totalExperience: '',
        skills: '',
        bio: '',
    });

    useEffect(() => {
        if (status === 'unauthenticated') router.replace('/auth/login/individuals');
        if (status === 'authenticated' && session?.user?.role !== 'INDIVIDUAL') {
            router.replace('/auth/login/individuals');
        }
    }, [status, session]);

    useEffect(() => {
        if (status !== 'authenticated') return;
        fetchData();
    }, [status]);

    async function fetchData() {
        setLoading(true);
        try {
            const [jobsRes, appsRes, profRes] = await Promise.all([
                fetch('/api/individual/jobs'),
                fetch('/api/individual/applications'),
                fetch('/api/individual/profile'),
            ]);
            if (jobsRes.ok) setJobs(await jobsRes.json());
            if (appsRes.ok) setApplications(await appsRes.json());
            if (profRes.ok) {
                const p = await profRes.json();
                setProfile(p);
                setProfileForm({
                    name: p.user?.name || '',
                    headline: p.headline || '',
                    location: p.location || '',
                    phone: p.phone || '',
                    linkedin: p.linkedin || '',
                    github: p.github || '',
                    portfolio: p.portfolio || '',
                    currentRole: p.currentRole || '',
                    currentCompany: p.currentCompany || '',
                    totalExperience: p.totalExperience || '',
                    skills: (p.skills || []).join(', '),
                    bio: p.bio || '',
                });
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    async function handleApply(e) {
        e.preventDefault();
        setApplyStatus('submitting');
        try {
            const res = await fetch('/api/individual/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId: applyingJob.id, coverLetter }),
            });
            if (res.ok) {
                setApplyStatus('success');
                setTimeout(() => {
                    setApplyingJob(null);
                    setCoverLetter('');
                    setApplyStatus('');
                    fetchData();
                }, 1200);
            }
        } catch (err) {
            console.error(err);
            setApplyStatus('error');
        }
    }

    async function handleSaveProfile(e) {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const payload = {
                ...profileForm,
                skills: profileForm.skills.split(',').map(s => s.trim()).filter(Boolean),
            };
            const res = await fetch('/api/individual/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                const updated = await res.json();
                setProfile(updated);
                alert('Profile updated successfully!');
            }
        } catch (err) {
            console.error(err);
        }
        setSavingProfile(false);
    }

    const appliedJobIds = new Set(applications.map(a => a.jobId));

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-blue-600 text-[48px] animate-spin">progress_activity</span>
                    <p className="text-gray-500 font-medium">Loading your career dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
                <a href="/" className="flex items-center gap-2.5">
                    <div className="bg-[#1a1a1a] p-2 rounded-lg"><span className="material-symbols-outlined text-white text-xl">grid_view</span></div>
                    <span className="text-[20px] font-bold tracking-tight text-gray-900">linker.intel</span>
                </a>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                        <span className="material-symbols-outlined text-blue-600 text-[18px]">badge</span>
                        <span className="text-[13px] font-semibold text-blue-700">{profile?.user?.name || session?.user?.name || 'Professional'}</span>
                    </div>
                    <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100">
                        <span className="material-symbols-outlined text-[18px]">logout</span>Sign out
                    </button>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Hero Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-[12px] font-medium tracking-wide inline-block mb-3">
                            ✨ AI-Powered Career Copilot
                        </span>
                        <h1 className="text-[30px] font-extrabold">Welcome back, {profile?.user?.name || 'Professional'}!</h1>
                        <p className="text-blue-100 mt-1 max-w-xl text-[15px]">
                            {profile?.headline || 'Discover curated roles matching your skills and experience from top hiring businesses.'}
                        </p>
                        <div className="flex gap-4 mt-6">
                            <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/15 text-center">
                                <span className="block text-[20px] font-bold">{jobs.length}</span>
                                <span className="text-[11px] text-blue-100">Active Roles</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/15 text-center">
                                <span className="block text-[20px] font-bold">{applications.length}</span>
                                <span className="text-[11px] text-blue-100">Applied Jobs</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/15 text-center">
                                <span className="block text-[20px] font-bold">{profile?.skills?.length || 0}</span>
                                <span className="text-[11px] text-blue-100">Skills Tracked</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
                    {TABS.map(t => (
                        <button key={t} onClick={() => setActiveTab(t)}
                            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${activeTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* Tab 1: Explore Jobs */}
                {activeTab === 'Explore Jobs' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-[18px] font-bold text-gray-900">Featured Job Openings</h2>
                            <span className="text-[13px] text-gray-500">{jobs.length} available opportunities</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {jobs.map(job => {
                                const isApplied = appliedJobIds.has(job.id);
                                return (
                                    <div key={job.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <span className="text-[12px] font-semibold text-indigo-600 uppercase tracking-wider">{job.company?.name || 'Hiring Company'}</span>
                                                    <h3 className="font-bold text-gray-900 text-[17px] mt-0.5">{job.title}</h3>
                                                </div>
                                                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 capitalize">{job.jobType.replace('_', ' ')}</span>
                                            </div>
                                            <p className="text-[13px] text-gray-500 mb-4 line-clamp-2">{job.description || 'Exciting career opportunity at a fast-growing company.'}</p>
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {(job.skills || []).map(s => (
                                                    <span key={s} className="bg-gray-50 text-gray-700 text-[11px] font-medium px-2 py-0.5 rounded-md border border-gray-200/60">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-2">
                                            <div className="text-[12px] text-gray-500">
                                                <span className="font-medium text-gray-900">{job.location || 'Remote'}</span>
                                                {job.experienceMin != null && <span> • {job.experienceMin}–{job.experienceMax} yrs</span>}
                                            </div>
                                            {isApplied ? (
                                                <span className="text-[12px] font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[16px]">check_circle</span>Applied
                                                </span>
                                            ) : (
                                                <button onClick={() => setApplyingJob(job)} className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-500/20">
                                                    Quick Apply
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Tab 2: My Applications */}
                {activeTab === 'My Applications' && (
                    <div className="space-y-4">
                        <h2 className="text-[18px] font-bold text-gray-900 mb-2">Track Application Progress</h2>
                        {applications.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                                <span className="material-symbols-outlined text-gray-300 text-[48px] block mb-3">folder_open</span>
                                <p className="text-gray-500 font-medium">You have not submitted any applications yet.</p>
                                <button onClick={() => setActiveTab('Explore Jobs')} className="mt-4 text-blue-600 font-semibold hover:underline text-[14px]">Explore available jobs →</button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {applications.map(app => (
                                    <div key={app.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-blue-600 text-[24px]">apartment</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-[15px]">{app.job?.title}</h4>
                                                <p className="text-[12px] text-gray-500">{app.job?.company?.name} • Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {app.matchScore && (
                                                <div className="text-right">
                                                    <span className="text-[13px] font-bold text-emerald-600 flex items-center gap-1 justify-end">
                                                        <span className="material-symbols-outlined text-[16px]">auto_awesome</span>{app.matchScore}%
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">Match Score</span>
                                                </div>
                                            )}
                                            <span className="text-[12px] font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 capitalize border border-blue-100">
                                                {app.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 3: My Profile */}
                {activeTab === 'My Profile' && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                        <h2 className="text-[20px] font-bold text-gray-900 mb-1">Professional Profile</h2>
                        <p className="text-gray-500 text-[13px] mb-6">Keep your credentials up-to-date so businesses can reach out with top offers.</p>

                        <form onSubmit={handleSaveProfile} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">Full Name</label>
                                    <input value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">Professional Headline</label>
                                    <input value={profileForm.headline} onChange={e => setProfileForm(p => ({ ...p, headline: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/40" placeholder="e.g. Senior Frontend Engineer | React & TS" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">Current Role</label>
                                    <input value={profileForm.currentRole} onChange={e => setProfileForm(p => ({ ...p, currentRole: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/40" placeholder="Software Engineer" />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">Current Company</label>
                                    <input value={profileForm.currentCompany} onChange={e => setProfileForm(p => ({ ...p, currentCompany: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/40" placeholder="Acme Inc." />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">Total Experience (Years)</label>
                                    <input type="number" value={profileForm.totalExperience} onChange={e => setProfileForm(p => ({ ...p, totalExperience: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/40" placeholder="4" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Key Skills (comma-separated)</label>
                                <input value={profileForm.skills} onChange={e => setProfileForm(p => ({ ...p, skills: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/40" placeholder="React, Node.js, Python, AWS, Docker" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">Location</label>
                                    <input value={profileForm.location} onChange={e => setProfileForm(p => ({ ...p, location: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/40" placeholder="Bangalore, India" />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">LinkedIn Profile</label>
                                    <input value={profileForm.linkedin} onChange={e => setProfileForm(p => ({ ...p, linkedin: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/40" placeholder="https://linkedin.com/in/..." />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">GitHub / Portfolio</label>
                                    <input value={profileForm.github} onChange={e => setProfileForm(p => ({ ...p, github: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/40" placeholder="https://github.com/..." />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Professional Bio</label>
                                <textarea value={profileForm.bio} onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))} rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none" placeholder="Brief summary of your professional journey, technical expertise, and career aspirations..." />
                            </div>

                            <button type="submit" disabled={savingProfile} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
                                {savingProfile ? 'Saving Changes...' : 'Save Profile Details'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Tab 4: AI Match */}
                {activeTab === 'AI Match' && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="material-symbols-outlined text-[28px]">auto_awesome</span>
                                <h3 className="text-[20px] font-bold">AI Skill Gap & Match Insights</h3>
                            </div>
                            <p className="text-emerald-100 text-[14px]">
                                Our AI system analyzes your skills profile against active hiring requirements across all business listings.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {jobs.slice(0, 4).map(job => {
                                const mySkills = new Set((profile?.skills || []).map(s => s.toLowerCase()));
                                const required = job.skills || [];
                                const matched = required.filter(s => mySkills.has(s.toLowerCase()));
                                const missing = required.filter(s => !mySkills.has(s.toLowerCase()));
                                const score = required.length > 0 ? Math.round((matched.length / required.length) * 100) : 80;

                                return (
                                    <div key={job.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-[16px]">{job.title}</h4>
                                                <p className="text-[12px] text-gray-500">{job.company?.name}</p>
                                            </div>
                                            <span className={`text-[14px] font-bold px-3 py-1 rounded-xl ${score >= 70 ? 'bg-emerald-50 text-emerald-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                                {score}% Fit
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-[13px] mt-4">
                                            <div>
                                                <span className="text-[11px] font-semibold text-gray-400 block mb-1">MATCHED SKILLS:</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {matched.length > 0 ? matched.map(m => (
                                                        <span key={m} className="bg-emerald-50 text-emerald-700 text-[11px] px-2 py-0.5 rounded font-medium">✓ {m}</span>
                                                    )) : <span className="text-gray-400 text-[11px]">None yet</span>}
                                                </div>
                                            </div>
                                            {missing.length > 0 && (
                                                <div className="pt-2">
                                                    <span className="text-[11px] font-semibold text-gray-400 block mb-1">SKILL RECOMMENDATIONS:</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {missing.map(m => (
                                                            <span key={m} className="bg-indigo-50 text-indigo-700 text-[11px] px-2 py-0.5 rounded font-medium">+ Learn {m}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Apply Modal */}
            {applyingJob && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h3 className="font-bold text-gray-900 text-[17px]">Apply for {applyingJob.title}</h3>
                                <p className="text-[12px] text-gray-500">{applyingJob.company?.name} • {applyingJob.location || 'Remote'}</p>
                            </div>
                            <button onClick={() => setApplyingJob(null)} className="text-gray-400 hover:text-gray-700"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <form onSubmit={handleApply} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Cover Note / Highlights for Recruiter</label>
                                <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none" placeholder="Highlight your relevant experience, technical achievements, and why you are a great fit..." />
                            </div>

                            {applyStatus === 'success' && (
                                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-[13px] font-semibold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">check_circle</span> Application submitted successfully!
                                </div>
                            )}

                            <button type="submit" disabled={applyStatus === 'submitting' || applyStatus === 'success'} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all text-[14px] shadow-lg shadow-blue-500/20 disabled:opacity-50">
                                {applyStatus === 'submitting' ? 'Submitting...' : 'Send Application'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}