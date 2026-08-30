'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const TABS = ['Overview', 'Job Postings', 'Applicants', 'Interviews'];

function StatCard({ icon, label, value, sub, color }) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <span className="material-symbols-outlined text-white text-[22px]">{icon}</span>
            </div>
            <p className="text-[13px] text-gray-500 font-medium">{label}</p>
            <p className="text-[28px] font-bold text-gray-900 mt-1">{value}</p>
            {sub && <p className="text-[12px] text-gray-400 mt-1">{sub}</p>}
        </div>
    );
}

function JobCard({ job, onViewApplicants }) {
    const statusColors = { active: 'bg-emerald-100 text-emerald-700', closed: 'bg-red-100 text-red-700', draft: 'bg-gray-100 text-gray-500' };
    const typeLabels = { full_time: 'Full Time', part_time: 'Part Time', contract: 'Contract', remote: 'Remote' };
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-semibold text-gray-900 text-[16px]">{job.title}</h3>
                    <p className="text-[13px] text-gray-500 mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">location_on</span>{job.location || 'Location TBD'}
                    </p>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColors[job.status] || 'bg-gray-100 text-gray-500'}`}>{job.status}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
                {(job.skills || []).slice(0, 4).map(s => (
                    <span key={s} className="bg-indigo-50 text-indigo-700 text-[11px] font-medium px-2 py-0.5 rounded-md">{s}</span>
                ))}
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[12px] text-gray-400">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">work</span>{typeLabels[job.jobType] || job.jobType}</span>
                    {job.experienceMin != null && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span>{job.experienceMin}–{job.experienceMax}yr exp</span>}
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">people</span>{job._count?.applications ?? 0} applicants</span>
                </div>
                <button onClick={() => onViewApplicants(job)} className="text-[13px] text-indigo-600 font-semibold hover:text-indigo-800 transition-colors flex items-center gap-1">
                    View <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
            </div>
        </div>
    );
}

function ApplicantCard({ app }) {
    const statusColors = {
        applied: 'bg-blue-50 text-blue-700', reviewing: 'bg-yellow-50 text-yellow-700',
        shortlisted: 'bg-purple-50 text-purple-700', interviewing: 'bg-orange-50 text-orange-700',
        offered: 'bg-emerald-50 text-emerald-700', rejected: 'bg-red-50 text-red-700',
    };
    const ind = app.individual;
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-indigo-600 text-[20px]">person</span>
                </div>
                <div>
                    <p className="font-semibold text-gray-900 text-[15px]">{ind?.user?.name || 'Professional'}</p>
                    <p className="text-[12px] text-gray-500">{ind?.currentRole} @ {ind?.currentCompany}</p>
                </div>
                <span className={`ml-auto text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColors[app.status] || 'bg-gray-100 text-gray-500'}`}>{app.status}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
                {(ind?.skills || []).slice(0, 4).map(s => (
                    <span key={s} className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-0.5 rounded-md">{s}</span>
                ))}
            </div>
            <div className="flex items-center justify-between text-[12px] text-gray-400">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span>{ind?.totalExperience}yr exp</span>
                {app.matchScore && <span className="flex items-center gap-1 text-emerald-600 font-semibold"><span className="material-symbols-outlined text-[14px]">auto_awesome</span>{app.matchScore}% match</span>}
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span>{ind?.location || '—'}</span>
            </div>
        </div>
    );
}

export default function CompanyDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('Overview');
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNewJob, setShowNewJob] = useState(false);
    const [newJob, setNewJob] = useState({ title: '', location: '', jobType: 'full_time', description: '', experienceMin: '', experienceMax: '', salaryMin: '', salaryMax: '', skills: '' });

    useEffect(() => {
        if (status === 'unauthenticated') router.replace('/auth/login/company');
        if (status === 'authenticated' && session?.user?.role !== 'BUSINESS') router.replace('/auth/login/company');
    }, [status, session]);

    useEffect(() => {
        if (status !== 'authenticated') return;
        fetchData();
    }, [status]);

    async function fetchData() {
        setLoading(true);
        try {
            const [jobsRes, appsRes] = await Promise.all([
                fetch('/api/company/jobs'),
                fetch('/api/company/applications'),
            ]);
            if (jobsRes.ok) setJobs(await jobsRes.json());
            if (appsRes.ok) setApplications(await appsRes.json());
        } catch (e) { console.error(e); }
        setLoading(false);
    }

    async function handlePostJob(e) {
        e.preventDefault();
        const payload = { ...newJob, skills: newJob.skills.split(',').map(s => s.trim()).filter(Boolean), experienceMin: Number(newJob.experienceMin) || null, experienceMax: Number(newJob.experienceMax) || null, salaryMin: Number(newJob.salaryMin) || null, salaryMax: Number(newJob.salaryMax) || null };
        const res = await fetch('/api/company/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) { setShowNewJob(false); setNewJob({ title: '', location: '', jobType: 'full_time', description: '', experienceMin: '', experienceMax: '', salaryMin: '', salaryMax: '', skills: '' }); fetchData(); }
    }

    function handleViewApplicants(job) { setSelectedJob(job); setActiveTab('Applicants'); }

    const activeJobs = jobs.filter(j => j.status === 'active');
    const totalApplicants = jobs.reduce((s, j) => s + (j._count?.applications ?? 0), 0);
    const shortlisted = applications.filter(a => a.status === 'shortlisted').length;
    const interviewing = applications.filter(a => a.status === 'interviewing').length;
    const filteredApps = selectedJob ? applications.filter(a => a.jobId === selectedJob.id) : applications;

    if (status === 'loading' || loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-indigo-600 text-[48px] animate-spin">progress_activity</span>
                <p className="text-gray-500 font-medium">Loading dashboard...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
                <a href="/" className="flex items-center gap-2.5">
                    <div className="bg-[#1a1a1a] p-2 rounded-lg"><span className="material-symbols-outlined text-white text-xl">grid_view</span></div>
                    <span className="text-[20px] font-bold tracking-tight text-gray-900">linker.intel</span>
                </a>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg">
                        <span className="material-symbols-outlined text-indigo-600 text-[18px]">business</span>
                        <span className="text-[13px] font-semibold text-indigo-700">{session?.user?.name || 'Business'}</span>
                    </div>
                    <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100">
                        <span className="material-symbols-outlined text-[18px]">logout</span>Sign out
                    </button>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-[28px] font-bold text-gray-900">Business Dashboard</h1>
                        <p className="text-gray-500 mt-1">Manage job postings and find the right professionals</p>
                    </div>
                    <button onClick={() => setShowNewJob(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200">
                        <span className="material-symbols-outlined text-[18px]">add</span>Post a Job
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard icon="work" label="Active Jobs" value={activeJobs.length} sub={`${jobs.length} total postings`} color="bg-indigo-500" />
                    <StatCard icon="people" label="Total Applicants" value={totalApplicants} sub="across all jobs" color="bg-blue-500" />
                    <StatCard icon="star" label="Shortlisted" value={shortlisted} sub="ready for review" color="bg-purple-500" />
                    <StatCard icon="record_voice_over" label="Interviewing" value={interviewing} sub="in progress" color="bg-orange-500" />
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
                    {TABS.map(t => (
                        <button key={t} onClick={() => { setActiveTab(t); if (t !== 'Applicants') setSelectedJob(null); }}
                            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${activeTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'Overview' && (
                    <div className="space-y-4">
                        <h2 className="text-[16px] font-bold text-gray-900">Recent Job Postings</h2>
                        {jobs.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                                <span className="material-symbols-outlined text-gray-300 text-[48px] block mb-3">work_off</span>
                                <p className="text-gray-500 font-medium">No jobs posted yet</p>
                                <button onClick={() => setShowNewJob(true)} className="mt-4 text-indigo-600 font-semibold hover:underline text-[14px]">Post your first job →</button>
                            </div>
                        ) : jobs.slice(0, 4).map(job => <JobCard key={job.id} job={job} onViewApplicants={handleViewApplicants} />)}
                    </div>
                )}

                {activeTab === 'Job Postings' && (
                    <div className="space-y-4">
                        {jobs.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                                <span className="material-symbols-outlined text-gray-300 text-[48px] block mb-3">work_off</span>
                                <p className="text-gray-500 font-medium">No jobs posted yet</p>
                            </div>
                        ) : jobs.map(job => <JobCard key={job.id} job={job} onViewApplicants={handleViewApplicants} />)}
                    </div>
                )}

                {activeTab === 'Applicants' && (
                    <div className="space-y-4">
                        {selectedJob && (
                            <div className="flex items-center gap-2 mb-2">
                                <button onClick={() => setSelectedJob(null)} className="text-[13px] text-gray-500 hover:text-gray-800 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">arrow_back</span>All applicants</button>
                                <span className="text-gray-300">/</span>
                                <span className="text-[13px] font-semibold text-gray-900">{selectedJob.title}</span>
                            </div>
                        )}
                        {filteredApps.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                                <span className="material-symbols-outlined text-gray-300 text-[48px] block mb-3">person_off</span>
                                <p className="text-gray-500 font-medium">No applicants yet</p>
                            </div>
                        ) : filteredApps.map(app => <ApplicantCard key={app.id} app={app} />)}
                    </div>
                )}

                {activeTab === 'Interviews' && (
                    <div className="space-y-4">
                        {applications.filter(a => a.status === 'interviewing' || a.status === 'shortlisted').length === 0 ? (
                            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                                <span className="material-symbols-outlined text-gray-300 text-[48px] block mb-3">event_busy</span>
                                <p className="text-gray-500 font-medium">No interviews scheduled</p>
                            </div>
                        ) : applications.filter(a => a.status === 'interviewing' || a.status === 'shortlisted').map(app => <ApplicantCard key={app.id} app={app} />)}
                    </div>
                )}
            </div>

            {/* New Job Modal */}
            {showNewJob && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-[18px] font-bold text-gray-900">Post a New Job</h2>
                            <button onClick={() => setShowNewJob(false)} className="text-gray-400 hover:text-gray-700"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <form onSubmit={handlePostJob} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Job Title *</label>
                                <input required value={newJob.title} onChange={e => setNewJob(p => ({ ...p, title: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500/40" placeholder="e.g. Senior Backend Engineer" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">Location</label>
                                    <input value={newJob.location} onChange={e => setNewJob(p => ({ ...p, location: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500/40" placeholder="e.g. Bangalore" />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">Job Type</label>
                                    <select value={newJob.jobType} onChange={e => setNewJob(p => ({ ...p, jobType: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                                        <option value="full_time">Full Time</option>
                                        <option value="part_time">Part Time</option>
                                        <option value="contract">Contract</option>
                                        <option value="remote">Remote</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">Min Experience (yrs)</label>
                                    <input type="number" value={newJob.experienceMin} onChange={e => setNewJob(p => ({ ...p, experienceMin: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500/40" placeholder="e.g. 2" />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-semibold text-gray-700 mb-1">Max Experience (yrs)</label>
                                    <input type="number" value={newJob.experienceMax} onChange={e => setNewJob(p => ({ ...p, experienceMax: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500/40" placeholder="e.g. 6" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Required Skills (comma-separated)</label>
                                <input value={newJob.skills} onChange={e => setNewJob(p => ({ ...p, skills: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500/40" placeholder="React, Node.js, TypeScript" />
                            </div>
                            <div>
                                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Job Description</label>
                                <textarea value={newJob.description} onChange={e => setNewJob(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none" placeholder="Describe the role and responsibilities..." />
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-colors text-[15px]">Post Job</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}