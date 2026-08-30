'use client';

import React, { useState, useRef, useEffect } from 'react';
import { mockGapAnalysis, defaultGapData } from '@/data/mockCareerData';
import { mockReadinessData, mockCourseLibrary, mockApplications, buildStudentReport } from '@/data/mockStudentFeatures';
import ReadinessDetails from '@/components/student/ReadinessDetails';
import CourseLibrary from '@/components/student/CourseLibrary';
import ApplicationTracker from '@/components/student/ApplicationTracker';

const roles = ['Frontend Dev', 'Backend Dev', 'Full Stack Dev', 'Data Scientist', 'ML Engineer', 'DevOps Engineer'];
const companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Flipkart', 'Razorpay'];

export default function StudentPortal() {
    const [role, setRole] = useState('Full Stack Dev');
    const [company, setCompany] = useState('Google');
    const [resumeFile, setResumeFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [careerData, setCareerData] = useState(null);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [editingRole, setEditingRole] = useState(false);
    const [editingCompany, setEditingCompany] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [rightPanelOpen, setRightPanelOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { role: 'assistant', text: "Hi Alex! I'm your AI career coach. Select a target and plot your route to get started!" }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [sendingChat, setSendingChat] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        loadCareerData(role, company);
    }, []);

    const loadCareerData = (r, c) => {
        const roleData = mockGapAnalysis[r];
        if (roleData && roleData[c]) {
            setCareerData(roleData[c]);
        } else {
            setCareerData(defaultGapData);
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        setAiAnalysis(null);
        try {
            const response = await fetch('/api/student/ai-insight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role, company, resumeText: '' }), // Resume text can be extracted if file uploaded
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setAiAnalysis(data);
            setLoading(false);
            setActiveTab('dashboard');

            setChatMessages(prev => [...prev, {
                role: 'assistant',
                text: `I've analyzed the path for ${role} at ${company}. Your match score is ${data.matchPercent}%. Check the 'Skills Gap' tab for what to learn next!`
            }]);
        } catch (err) {
            console.error('AI Integration Error:', err);
            setLoading(false);
        }
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setSendingChat(true);

        try {
            // Reusing the AI insight route for simple chat or we could make a dedicated one
            const response = await fetch('/api/student/ai-insight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role,
                    company,
                    resumeText: `User Question: ${userMsg}\nContext: These are my insights: ${JSON.stringify(aiAnalysis)}`
                }),
            });
            const data = await response.json();
            setChatMessages(prev => [...prev, { role: 'assistant', text: data.aiSummary || "I can help with that! Let's focus on your roadmap." }]);
        } catch (err) {
            setChatMessages(prev => [...prev, { role: 'assistant', text: "I'm having trouble connecting right now, but your roadmap is safe!" }]);
        } finally {
            setSendingChat(false);
        }
    };

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        setEditingRole(false);
        loadCareerData(newRole, company);
    };

    const handleCompanyChange = (newCompany) => {
        setCompany(newCompany);
        setEditingCompany(false);
        loadCareerData(role, newCompany);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setResumeFile(file);
        } else if (file) {
            alert('Please upload a valid PDF file.');
        }
    };

    const displayMatchPercent = aiAnalysis ? aiAnalysis.matchPercent : (careerData ? Math.max(30, 100 - careerData.gaps.length * 12) : 72);
    const displayGaps = aiAnalysis ? aiAnalysis.gaps : (careerData ? careerData.gaps : []);
    const displayRoadmap = aiAnalysis ? aiAnalysis.roadmap : (careerData ? careerData.roadmap : []);
    const displayReadiness = aiAnalysis ? aiAnalysis.readinessBreakdown : mockReadinessData.breakdown;
    const displayCourses = aiAnalysis ? aiAnalysis.courseRecommendations : (careerData ? careerData.courses : []);

    const getSkillPercent = (severity) => {
        if (severity === 'low') return 80;
        if (severity === 'medium') return 55;
        return 35;
    };

    const notifications = [
        { id: 1, text: 'New roadmap recommendation available', time: '2m ago', unread: true },
        { id: 2, text: 'System Design course completed by 200+ peers', time: '1h ago', unread: true },
        { id: 3, text: 'Google updated their hiring criteria', time: '3h ago', unread: false },
    ];

    return (
        <div
            className="min-h-screen flex flex-col font-sans text-gray-900"
            style={{
                backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.25), rgba(240,242,245,0.35)), url(/backgrounds/portal-bg.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* ===== HEADER ===== */}
            <header className="h-[64px] bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between px-4 sm:px-10 shrink-0 z-20">
                <div className="flex items-center gap-4 sm:gap-8">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                        <span className="material-symbols-outlined text-[24px]">menu</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <span className="material-symbols-outlined text-white text-2xl">grid_view</span>
                        </div>
                        <span className="text-[24px] font-bold tracking-tight text-white">Placify</span>
                    </div>
                    <nav className="flex items-center gap-2 h-[64px]">
                        <a href="/student" className="text-[14px] font-medium text-white px-4 h-full flex items-center border-b-2 border-white">Explore</a>
                        <a href="/company" className="text-[14px] font-medium text-white/70 px-4 h-full flex items-center hover:text-white border-b-2 border-transparent transition-colors">Company</a>
                        <a href="/college" className="text-[14px] font-medium text-white/70 px-4 h-full flex items-center hover:text-white border-b-2 border-transparent transition-colors">College</a>
                    </nav>
                </div>
                <div className="flex-1 flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-white/60">search</span>
                        </div>
                        <input
                            className="block w-[400px] pl-[44px] pr-5 py-2.5 bg-white/10 border border-white/20 rounded-[50px] text-[15px] text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm"
                            placeholder="Explore career paths..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }} className="p-2 text-white/80 hover:text-white relative transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white/20"></span>
                        </button>
                        {showNotifications && (
                            <div className="absolute right-0 top-12 w-[320px] bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                                    <span className="font-bold text-[14px] text-gray-900">Notifications</span>
                                    <span className="text-[12px] text-[#2563EB] font-medium cursor-pointer">Mark all read</span>
                                </div>
                                {notifications.map(n => (
                                    <div key={n.id} className={`px-4 py-3 hover:bg-gray-50 cursor-pointer flex gap-3 ${n.unread ? 'bg-blue-50/50' : ''}`}>
                                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.unread ? 'bg-[#2563EB]' : 'bg-transparent'}`}></div>
                                        <div>
                                            <p className="text-[13px] text-gray-800">{n.text}</p>
                                            <p className="text-[12px] text-gray-400 mt-0.5">{n.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <div className="flex items-center gap-3 pl-4 border-l border-white/20 cursor-pointer" onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}>
                            <div className="relative">
                                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm border-2 border-white/20 shadow-sm">ST</div>
                                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white/20"></span>
                            </div>
                        </div>
                        {showProfile && (
                            <div className="absolute right-0 top-14 w-[200px] bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="font-bold text-[14px] text-gray-900">Alex Student</p>
                                    <p className="text-[12px] text-gray-400">alex@university.edu</p>
                                </div>
                                <a href="/student" className="block px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50">
                                    <span className="material-symbols-outlined text-[16px] mr-2 align-middle">person</span>My Profile
                                </a>
                                <a href="#" className="block px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50">
                                    <span className="material-symbols-outlined text-[16px] mr-2 align-middle">settings</span>Settings
                                </a>
                                <div className="border-t border-gray-100">
                                    <a href="/" className="block px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50">
                                        <span className="material-symbols-outlined text-[16px] mr-2 align-middle">logout</span>Sign Out
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ===== LEFT SIDEBAR OVERLAY ===== */}
            {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setSidebarOpen(false)} />}
            <aside className={`fixed top-0 left-0 h-full w-[300px] z-40 flex flex-col overflow-y-auto py-[32px] px-[24px] shadow-2xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ backgroundImage: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)' }}>
                <div className="flex justify-between items-center mb-6">
                    <span className="text-[18px] font-bold text-gray-900">Navigation</span>
                    <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-white/40 rounded-lg transition-colors"><span className="material-symbols-outlined text-gray-600">close</span></button>
                </div>
                <nav className="flex-1 space-y-2 mb-8">
                    <button onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }} className={`w-full flex items-center px-4 py-2 text-[14px] font-medium rounded-lg transition-colors ${activeTab === 'dashboard' ? 'sidebar-item-active' : 'text-gray-700 hover:bg-white/30 hover:text-gray-900'}`}>
                        <span className="material-symbols-outlined mr-3 text-[20px]">dashboard</span>Dashboard
                    </button>
                    <button onClick={() => { setActiveTab('skills'); setSidebarOpen(false); }} className={`w-full flex items-center px-4 py-2 text-[14px] font-medium rounded-lg transition-colors ${activeTab === 'skills' ? 'sidebar-item-active' : 'text-gray-700 hover:bg-white/30 hover:text-gray-900'}`}>
                        <span className="material-symbols-outlined mr-3 text-[20px]">school</span>Skills Gap
                    </button>
                    <button onClick={() => { setActiveTab('jobs'); setSidebarOpen(false); }} className={`w-full flex items-center px-4 py-2 text-[14px] font-medium rounded-lg transition-colors ${activeTab === 'jobs' ? 'sidebar-item-active' : 'text-gray-700 hover:bg-white/30 hover:text-gray-900'}`}>
                        <span className="material-symbols-outlined mr-3 text-[20px]">work</span>Jobs
                    </button>
                    <button onClick={() => { setActiveTab('readiness'); setSidebarOpen(false); }} className={`w-full flex items-center px-4 py-2 text-[14px] font-medium rounded-lg transition-colors ${activeTab === 'readiness' ? 'sidebar-item-active' : 'text-gray-700 hover:bg-white/30 hover:text-gray-900'}`}>
                        <span className="material-symbols-outlined mr-3 text-[20px]">speed</span>Readiness
                    </button>
                    <button onClick={() => { setActiveTab('courses'); setSidebarOpen(false); }} className={`w-full flex items-center px-4 py-2 text-[14px] font-medium rounded-lg transition-colors ${activeTab === 'courses' ? 'sidebar-item-active' : 'text-gray-700 hover:bg-white/30 hover:text-gray-900'}`}>
                        <span className="material-symbols-outlined mr-3 text-[20px]">menu_book</span>Courses
                    </button>
                    <button onClick={() => { setActiveTab('applications'); setSidebarOpen(false); }} className={`w-full flex items-center px-4 py-2 text-[14px] font-medium rounded-lg transition-colors ${activeTab === 'applications' ? 'sidebar-item-active' : 'text-gray-700 hover:bg-white/30 hover:text-gray-900'}`}>
                        <span className="material-symbols-outlined mr-3 text-[20px]">assignment</span>Applications
                    </button>
                    <button onClick={() => {
                        const report = buildStudentReport(
                            { ...mockReadinessData, overallScore: displayMatchPercent, breakdown: displayReadiness, suggestions: displayGaps.map(g => ({ area: 'Skill', suggestion: g.skill, priority: g.severity })) },
                            mockApplications
                        );
                        if (aiAnalysis) report.aiSummary = aiAnalysis.aiSummary;
                        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Placify_Report_${role}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                    }} className="w-full flex items-center px-4 py-2 text-[14px] font-medium rounded-lg text-gray-700 hover:bg-white/30 hover:text-gray-900 transition-colors">
                        <span className="material-symbols-outlined mr-3 text-[20px]">download</span>Export Report
                    </button>
                </nav>
                <div className="mt-auto">
                    <h3 className="text-[20px] font-bold text-gray-900 leading-[1.4] mb-4">
                        I want to be a{' '}
                        {editingRole ? (
                            <select className="text-blue-700 font-bold bg-white/40 rounded px-1 border border-white/50 text-[18px]" value={role} onChange={(e) => handleRoleChange(e.target.value)} onBlur={() => setEditingRole(false)} autoFocus>
                                {roles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        ) : (
                            <span className="text-blue-700 cursor-pointer hover:underline" onClick={() => setEditingRole(true)}>{role}</span>
                        )}
                        {' '}at{' '}
                        {editingCompany ? (
                            <select className="text-blue-700 font-bold bg-white/40 rounded px-1 border border-white/50 text-[18px] underline decoration-2 underline-offset-4" value={company} onChange={(e) => handleCompanyChange(e.target.value)} onBlur={() => setEditingCompany(false)} autoFocus>
                                {companies.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        ) : (
                            <span className="text-blue-700 underline decoration-2 underline-offset-4 cursor-pointer hover:text-blue-800" onClick={() => setEditingCompany(true)}>{company}.</span>
                        )}
                    </h3>
                    <div
                        className="inline-flex items-center gap-[6px] px-[14px] py-[6px] rounded-[50px] text-[13px] font-medium bg-white/40 text-gray-800 mb-5 border border-white/50 cursor-pointer hover:bg-white/50"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <span className="material-symbols-outlined text-[16px] text-gray-600">attach_file</span>
                        {resumeFile ? resumeFile.name : 'Upload Resume'}
                        <input type="file" accept=".pdf" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-[8px] bg-blue-600 hover:bg-blue-700 text-white p-[14px] rounded-[12px] text-[16px] font-semibold transition-colors mt-5 shadow-lg shadow-blue-900/20 disabled:opacity-50"
                    >
                        {loading ? (
                            <><span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>Analyzing...</>
                        ) : (
                            <><span className="material-symbols-outlined text-[20px]">timeline</span>Plot My Route</>
                        )}
                    </button>
                </div>
            </aside>

            {/* ===== BODY ===== */}
            <div className="flex flex-1 overflow-hidden">

                {/* MAIN CONTENT */}
                <main className="flex-grow p-[24px] sm:p-[32px] overflow-y-auto">
                    <div className="max-w-5xl mx-auto">

                        {/* ===== DASHBOARD TAB ===== */}
                        {activeTab === 'dashboard' && (
                            <>
                                <div className="flex justify-between items-end mb-6">
                                    <div>
                                        <h1 className="text-[32px] font-bold text-gray-900 leading-tight">Good morning, Alex! 👋</h1>
                                        <p className="text-[16px] text-gray-600 mt-1">You&apos;re making great progress towards your goal.</p>
                                    </div>
                                </div>

                                {/* Readiness Dashboard */}
                                <div className="rounded-[16px] p-[28px] mb-[24px] shadow-sm" style={{ backgroundColor: '#DCD9D4', backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.50) 0%, rgba(0,0,0,0.50) 100%), radial-gradient(at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.50) 50%)', backgroundBlendMode: 'soft-light, screen' }}>
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-[20px] font-bold text-gray-900">Readiness Dashboard</h2>
                                        <button onClick={() => setActiveTab('skills')} className="text-[15px] text-[#2563EB] font-medium hover:underline">View details</button>
                                    </div>
                                    <div className="flex items-center gap-[40px]">
                                        <div className="relative w-[120px] h-[120px] shrink-0">
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                <path className="fill-none stroke-white/50 stroke-[3.8]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                <path className="fill-none stroke-[#2563EB] stroke-[3.8] stroke-linecap-round" strokeDasharray={`${displayMatchPercent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-[24px] font-bold text-gray-900 leading-none">{displayMatchPercent}%</span>
                                                <span className="text-[13px] text-gray-500 font-medium mt-1 uppercase">Match</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 flex flex-col gap-[16px]">
                                            {aiAnalysis && (
                                                <div className="bg-white/40 p-3 rounded-xl border border-white/60 mb-2">
                                                    <p className="text-[13px] font-bold text-blue-700 uppercase tracking-wider mb-1">AI Coach Insight</p>
                                                    <p className="text-[14px] text-gray-800 leading-relaxed italic">"{aiAnalysis.aiSummary}"</p>
                                                </div>
                                            )}
                                            {displayGaps.slice(0, 3).map((gap, i) => (
                                                <div key={i} className="flex items-center gap-[16px]">
                                                    <span className="text-[15px] font-semibold text-gray-900 w-32 shrink-0 truncate">{gap.skill.split(' ').slice(0, 3).join(' ')}</span>
                                                    <div className="flex-1 h-2.5 bg-white/50 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${gap.severity === 'high' ? 'bg-orange-500' : gap.severity === 'medium' ? 'bg-blue-400' : 'bg-green-500'}`} style={{ width: `${getSkillPercent(gap.severity)}%` }}></div>
                                                    </div>
                                                    <span className={`px-2.5 py-1 rounded-full text-[13px] font-bold shrink-0 ${gap.severity === 'high' ? 'bg-orange-100 text-orange-700' : gap.severity === 'medium' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                        {gap.severity === 'high' ? 'High Priority' : gap.severity === 'medium' ? 'In Progress' : 'Quick Win'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Route Timeline */}
                                <div className="rounded-[16px] p-[28px] shadow-sm" style={{ backgroundColor: '#DCD9D4', backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.50) 0%, rgba(0,0,0,0.50) 100%), radial-gradient(at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.50) 50%)', backgroundBlendMode: 'soft-light, screen' }}>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-[20px] font-bold text-gray-900">Your Route</h2>
                                        <span className="text-[15px] text-gray-500">Est. {displayRoadmap.length} phases</span>
                                    </div>
                                    <div className="relative pl-4">
                                        <div className="absolute left-[23px] top-8 bottom-8 w-0.5 bg-gray-200"></div>
                                        {displayRoadmap.map((step, i) => (
                                            <div key={i} className="relative flex gap-[16px] py-[20px]">
                                                <div className={`relative z-10 w-4 h-4 mt-1 rounded-full ring-4 ring-[#DCD9D4] shrink-0 ${i === 0 ? 'bg-[#2563EB]' : i < displayRoadmap.length - 1 ? 'bg-[#2563EB]' : 'bg-gray-300'}`}></div>
                                                <div className={`flex-1 ${i === displayRoadmap.length - 1 && !aiAnalysis ? 'opacity-60' : ''}`}>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-[16px] font-bold text-gray-900">Station {i + 1}: {step.title}</h3>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[13px] font-medium ${i === 0 ? 'bg-green-100 text-green-700' : i < displayRoadmap.length - 1 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                                            {i === 0 ? 'Active' : i < displayRoadmap.length - 1 ? 'In Progress' : 'Planned'}
                                                        </span>
                                                    </div>
                                                    <p className="text-[15px] text-gray-500">{step.description}</p>
                                                    <p className="text-[13px] text-gray-400 mt-1">{step.phase}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ===== SKILLS GAP TAB ===== */}
                        {activeTab === 'skills' && (
                            <>
                                <div className="mb-6">
                                    <h1 className="text-[28px] font-bold text-gray-900">Skills Gap Analysis</h1>
                                    <p className="text-[15px] text-gray-500 mt-1">For {role} at {company}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {displayGaps.map((gap, i) => (
                                        <div key={i} className="rounded-[16px] p-6 shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: '#DCD9D4', backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.50) 0%, rgba(0,0,0,0.50) 100%), radial-gradient(at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.50) 50%)', backgroundBlendMode: 'soft-light, screen' }}>
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="text-[16px] font-bold text-gray-900">{gap.skill}</h3>
                                                <span className={`px-2.5 py-1 rounded-full text-[12px] font-bold ${gap.severity === 'high' ? 'bg-red-100 text-red-700' : gap.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                                    {gap.severity}
                                                </span>
                                            </div>
                                            <p className="text-[14px] text-gray-500 leading-relaxed">{gap.description}</p>
                                            <div className="mt-4 h-2 bg-white/50 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${gap.severity === 'high' ? 'bg-red-500' : gap.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${100 - getSkillPercent(gap.severity)}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {displayCourses && (
                                    <div className="mt-8">
                                        <h2 className="text-[20px] font-bold text-gray-900 mb-4">Recommended Courses</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {displayCourses.map((course, i) => (
                                                <a key={i} href={course.url} target="_blank" rel="noopener noreferrer" className="rounded-[16px] p-5 shadow-sm hover:shadow-md transition-all border border-white/50 block" style={{ backgroundImage: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)' }}>
                                                    <div className="flex items-start gap-3">
                                                        <div className="bg-white/40 p-2 rounded-lg text-blue-600 shrink-0">
                                                            <span className="material-symbols-outlined text-xl">play_circle</span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-[15px] text-gray-900 mb-1">{course.title}</h4>
                                                            <p className="text-[13px] text-gray-500">{course.platform} • {course.instructor}</p>
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <span className="text-[13px] text-yellow-600 font-medium">★ {course.rating}</span>
                                                                <span className="text-[12px] text-gray-400">{course.duration}</span>
                                                                <span className="text-[12px] font-bold text-[#2563EB]">{course.price}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* ===== JOBS TAB ===== */}
                        {activeTab === 'jobs' && (
                            <>
                                <div className="mb-6">
                                    <h1 className="text-[28px] font-bold text-gray-900">Matching Jobs</h1>
                                    <p className="text-[15px] text-gray-500 mt-1">Opportunities matching your profile as a {role}</p>
                                </div>
                                {[
                                    { title: `${role} Intern`, co: company, pkg: '₹18 LPA', match: matchPercent, loc: 'Bangalore', type: 'Full-time' },
                                    { title: `Junior ${role}`, co: 'Microsoft', pkg: '₹22 LPA', match: matchPercent - 8, loc: 'Hyderabad', type: 'Full-time' },
                                    { title: `${role}`, co: 'Flipkart', pkg: '₹16 LPA', match: matchPercent - 15, loc: 'Bangalore', type: 'Full-time' },
                                    { title: `${role} (Contract)`, co: 'Razorpay', pkg: '₹14 LPA', match: matchPercent - 20, loc: 'Remote', type: 'Contract' },
                                ].map((job, i) => (
                                    <div key={i} className="rounded-[16px] p-6 mb-4 shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: '#DCD9D4', backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.50) 0%, rgba(0,0,0,0.50) 100%), radial-gradient(at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.50) 50%)', backgroundBlendMode: 'soft-light, screen' }}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-white/40 w-12 h-12 rounded-xl flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-blue-600">work</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-[16px] font-bold text-gray-900">{job.title}</h3>
                                                    <p className="text-[14px] text-gray-500">{job.co} • {job.loc} • {job.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-[16px] font-bold text-gray-900">{job.pkg}</p>
                                                    <p className="text-[13px] text-green-600 font-medium">{job.match}% match</p>
                                                    {aiAnalysis && <div className="mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase tracking-tighter">AI Match</div>}
                                                </div>
                                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors">
                                                    Apply
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                        {/* ===== READINESS TAB ===== */}
                        {activeTab === 'readiness' && <ReadinessDetails data={{ ...mockReadinessData, breakdown: displayReadiness }} />}

                        {/* ===== COURSES TAB ===== */}
                        {activeTab === 'courses' && <CourseLibrary courses={displayCourses} />}

                        {/* ===== APPLICATIONS TAB ===== */}
                        {activeTab === 'applications' && <ApplicationTracker applications={mockApplications} />}

                    </div>
                </main>

                {/* RIGHT PANEL TOGGLE BUTTON */}
                <button onClick={() => setRightPanelOpen(!rightPanelOpen)} className="fixed bottom-6 right-6 z-20 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg shadow-blue-900/30 transition-all hover:scale-105">
                    <span className="material-symbols-outlined text-[24px]">{rightPanelOpen ? 'close' : 'info'}</span>
                </button>
            </div>

            {/* ===== RIGHT PANEL OVERLAY ===== */}
            {rightPanelOpen && <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setRightPanelOpen(false)} />}
            <aside className={`fixed top-0 right-0 h-full w-[320px] z-40 overflow-y-auto shadow-2xl transition-transform duration-300 ${rightPanelOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ backgroundImage: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)' }}>
                <div className="p-[28px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            AI Career Coach
                        </h3>
                        <button onClick={() => setRightPanelOpen(false)} className="p-1 hover:bg-white/40 rounded-lg transition-colors"><span className="material-symbols-outlined text-gray-600">close</span></button>
                    </div>

                    <div className="h-[400px] flex flex-col bg-white/40 rounded-2xl border border-white/60 mb-6 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {chatMessages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {sendingChat && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <form onSubmit={handleChatSubmit} className="p-3 bg-white/50 border-t border-white/60 flex gap-2">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Ask about your roadmap..."
                                className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                            <button type="submit" disabled={sendingChat} className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
                                <span className="material-symbols-outlined text-[18px]">send</span>
                            </button>
                        </form>
                    </div>

                    <h3 className="text-[15px] font-bold text-gray-900 mb-4">Suggested Next Steps</h3>
                    <div className="space-y-4">
                        {displayCourses.slice(0, 2).map((course, i) => (
                            <a key={i} href={course.url} target="_blank" rel="noopener noreferrer" className="group p-4 rounded-xl shadow-sm transition-all cursor-pointer hover:opacity-90 border border-white/50 block" style={{ backgroundImage: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)' }}>
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="bg-white/40 p-2 rounded-lg text-gray-900 shrink-0">
                                        <span className="material-symbols-outlined text-xl">{i === 0 ? 'book' : 'code_blocks'}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[15px] text-gray-900 leading-tight mb-1">{course.title}</h4>
                                        <p className="text-[13px] text-gray-700">{course.platform} • {course.instructor}</p>
                                    </div>
                                </div>
                                <div className="w-full bg-black/10 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full" style={{ width: `${(i + 1) * 25}%` }}></div>
                                </div>
                            </a>
                        ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/40">
                        <h3 className="text-[15px] font-bold text-gray-900 mb-4">Weekly Activity</h3>
                        <div className="grid grid-cols-7 gap-1.5">
                            {['bg-green-500/60', 'bg-green-500', 'bg-white/40', 'bg-green-600', 'bg-green-500/80', 'bg-white/40', 'bg-white/40'].map((c, i) => (
                                <div key={i} className={`h-10 w-full rounded ${c} hover:ring-2 hover:ring-blue-300 cursor-pointer transition-all`} title={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}></div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-[13px] text-gray-600"><span>Mon</span><span>Sun</span></div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
