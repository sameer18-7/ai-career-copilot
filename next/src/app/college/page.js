'use client';

import { useState, useEffect } from 'react';
import BatchAnalytics from '@/components/college/BatchAnalytics';
import CompanyMapping from '@/components/college/CompanyMapping';
import PlacementCharts from '@/components/college/PlacementCharts';
import { batchStats } from '@/data/mockCollegeData';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function CollegePortal() {
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [rightPanelOpen, setRightPanelOpen] = useState(false);
    const [atRiskData, setAtRiskData] = useState({ count: 0, students: [] });
    const [generatingReport, setGeneratingReport] = useState(false);
    const [recentPlacements, setRecentPlacements] = useState([
        { id: 1, student: 'STU-2847', company: 'Google', role: 'SDE Intern', package: '₹18 LPA', date: '2026-02-28' },
        { id: 2, student: 'STU-1923', company: 'Amazon', role: 'SDE-1', package: '₹28 LPA', date: '2026-02-25' },
        { id: 3, student: 'STU-3461', company: 'Microsoft', role: 'Full Stack', package: '₹22 LPA', date: '2026-02-20' },
        { id: 4, student: 'STU-5102', company: 'Flipkart', role: 'Backend Eng', package: '₹16 LPA', date: '2026-02-18' },
    ]);

    useEffect(() => {
        fetchAtRisk();
    }, []);

    const fetchAtRisk = async () => {
        try {
            const res = await fetch('/api/college/at-risk');
            const data = await res.json();
            setAtRiskData(data);
        } catch (err) {
            console.error('Failed to fetch at-risk students:', err);
        }
    };

    const generateComplianceReport = async () => {
        setGeneratingReport(true);
        try {
            const res = await fetch('/api/college/compliance-report');
            const data = await res.json();

            const doc = new jsPDF();

            // Header
            doc.setFontSize(22);
            doc.setTextColor(40, 44, 52);
            doc.text('NIRF/NAAC Institutional Placement Report', 105, 20, { align: 'center' });

            doc.setFontSize(12);
            doc.text(`Academic Year: ${data.academicYear}`, 105, 30, { align: 'center' });
            doc.line(20, 35, 190, 35);

            // Summary Stats
            doc.setFontSize(14);
            doc.text('1. Executive Summary', 20, 50);

            const summaryData = [
                ['Metric', 'Value'],
                ['Total Graduating Students', data.totalStudents.toString()],
                ['Total Students Placed', data.placedStudents.toString()],
                ['Placement Percentage', `${data.placementRate}%`],
                ['Median Salary', data.medianPackage],
                ['Highest Salary', data.highestPackage],
                ['Number of Recruiting Companies', data.participatingCompanies.toString()]
            ];

            doc.autoTable({
                startY: 55,
                head: [summaryData[0]],
                body: summaryData.slice(1),
                theme: 'grid',
                headStyles: { fillStyle: '#1a1a1a', textColor: 255 }
            });

            // Branch Distribution
            doc.text('2. Branch-wise Placement Distribution', 20, doc.lastAutoTable.finalY + 15);
            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 20,
                head: [['Branch', 'Number of Students Placed']],
                body: data.branchDistribution.map(b => [b.branch, b.count.toString()]),
                theme: 'striped'
            });

            // Top Recruiters
            doc.text('3. Top Recruiting Partners', 20, doc.lastAutoTable.finalY + 15);
            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 20,
                head: [['Company Name', 'Offers Made']],
                body: data.topRecruiters.map(c => [c.name, c.count.toString()]),
                theme: 'grid'
            });

            // Footer
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(`Generated on ${new Date().toLocaleDateString()} • Powered by Placify AI Compliance Module`, 105, 285, { align: 'center' });

            doc.save(`Placement_Report_${data.academicYear}.pdf`);
        } catch (err) {
            console.error('Report generation failed:', err);
        } finally {
            setGeneratingReport(false);
        }
    };

    // Check for cross-portal data (jobs posted by companies)
    const [companyJobs, setCompanyJobs] = useState([]);
    useEffect(() => {
        if (typeof window !== 'undefined' && window.__placifyJobs) {
            setCompanyJobs(window.__placifyJobs.getJobs());
        }
    }, [activeTab]);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: 'dashboard' },
        { id: 'analytics', label: 'Analytics', icon: 'analytics' },
        { id: 'companies', label: 'Companies', icon: 'apartment' },
        { id: 'students', label: 'Students', icon: 'groups' },
        { id: 'compliance', label: 'Compliance', icon: 'description' },
    ];

    return (
        <div className="min-h-screen flex flex-col font-sans text-gray-900" style={{
            backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.25), rgba(240,242,245,0.35)), url(/backgrounds/portal-bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            backgroundRepeat: 'no-repeat',
        }}>
            {/* HEADER */}
            <header className="h-[64px] bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between px-4 sm:px-10 shrink-0 z-20">
                <div className="flex items-center gap-4 sm:gap-8">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                        <span className="material-symbols-outlined text-[24px]">menu</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg"><span className="material-symbols-outlined text-white text-2xl">grid_view</span></div>
                        <span className="text-[24px] font-bold tracking-tight text-white">Placify</span>
                    </div>
                    <nav className="flex items-center gap-2 h-[64px]">
                        <a href="/student" className="text-[14px] font-medium text-white/70 px-4 h-full flex items-center hover:text-white border-b-2 border-transparent transition-colors">Student</a>
                        <a href="/company" className="text-[14px] font-medium text-white/70 px-4 h-full flex items-center hover:text-white border-b-2 border-transparent transition-colors">Company</a>
                        <a href="/college" className="text-[14px] font-medium text-white px-4 h-full flex items-center border-b-2 border-white">College</a>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full border border-green-500/30">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[13px] font-medium text-green-400">AI Online</span>
                    </div>
                    <div className="flex items-center gap-3 pl-4 border-l border-white/20">
                        <div className="h-10 w-10 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold text-sm border-2 border-white/20">PC</div>
                    </div>
                </div>
            </header>

            {/* LEFT SIDEBAR OVERLAY */}
            {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setSidebarOpen(false)} />}
            <aside className={`fixed top-0 left-0 h-full w-[300px] z-40 flex flex-col overflow-y-auto py-[32px] px-[24px] shadow-2xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ backgroundImage: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)' }}>
                <div className="flex justify-between items-center mb-6">
                    <span className="text-[18px] font-bold text-gray-900">Navigation</span>
                    <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-white/40 rounded-lg transition-colors"><span className="material-symbols-outlined text-gray-600">close</span></button>
                </div>
                <nav className="flex-1 space-y-2">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }} className={`w-full flex items-center px-4 py-2 text-[14px] font-medium rounded-lg transition-colors ${activeTab === tab.id ? 'sidebar-item-active' : 'text-gray-700 hover:bg-white/30 hover:text-gray-900'}`}>
                            <span className="material-symbols-outlined mr-3 text-[20px]">{tab.icon}</span>{tab.label}
                        </button>
                    ))}
                </nav>
                <div className="mt-auto pt-6 border-t border-white/40">
                    <p className="text-[13px] text-gray-500 mb-2">Current Batch</p>
                    <p className="text-[16px] font-bold text-gray-900">2025-26</p>
                    <p className="text-[12px] text-gray-400 mt-1">{batchStats.totalStudents.toLocaleString()} students enrolled</p>
                </div>
            </aside>

            {/* BODY */}
            <div className="flex flex-1 overflow-hidden">

                {/* MAIN */}
                <main className="flex-grow p-[24px] sm:p-[32px] overflow-y-auto">
                    <div className="max-w-5xl mx-auto">

                        {/* ===== OVERVIEW TAB ===== */}
                        {activeTab === 'overview' && (
                            <>
                                <div className="flex justify-between items-end mb-6">
                                    <div>
                                        <h1 className="text-[28px] font-bold text-gray-900">College Placement Cell</h1>
                                        <p className="text-[15px] text-gray-500 mt-1">Macro-level batch analytics and recruitment insights</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">At-Risk Students</span>
                                        <div className="flex items-center gap-3">
                                            {atRiskData.students.length > 0 && (
                                                <div className="flex -space-x-3">
                                                    {atRiskData.students.slice(0, 3).map((s, i) => (
                                                        <div key={i} className="h-10 w-10 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-white font-bold text-[10px] shadow-sm">
                                                            {s.userId?.slice(-2) || '??'}
                                                        </div>
                                                    ))}
                                                    {atRiskData.count > 3 && <div className="h-10 w-10 rounded-full bg-gray-900 border-2 border-white flex items-center justify-center text-white font-bold text-[10px]">+{atRiskData.count - 3}</div>}
                                                </div>
                                            )}
                                            <div className="bg-red-50 px-4 py-2 rounded-2xl border border-red-200 flex items-center gap-2 shadow-sm">
                                                <span className="material-symbols-outlined text-red-500 text-[20px] animate-pulse">error</span>
                                                <span className="text-[14px] font-bold text-red-700">{atRiskData.count} flagged for mentoring</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <BatchAnalytics />
                                {/* Recent Placements from cross-portal */}
                                <div className="mt-8 rounded-[16px] p-6 shadow-sm" style={{ backgroundColor: '#DCD9D4', backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.50) 0%, rgba(0,0,0,0.50) 100%), radial-gradient(at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.50) 50%)', backgroundBlendMode: 'soft-light, screen' }}>
                                    <h3 className="text-[16px] font-bold text-gray-900 mb-4">Recent Placements</h3>
                                    <div className="space-y-3">
                                        {recentPlacements.map(p => (
                                            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/20 border border-white/30">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-green-100 p-2 rounded-lg"><span className="material-symbols-outlined text-green-600 text-[18px]">how_to_reg</span></div>
                                                    <div><p className="text-[14px] font-medium text-gray-900">{p.student}</p><p className="text-[12px] text-gray-500">{p.company} • {p.role}</p></div>
                                                </div>
                                                <div className="text-right"><p className="text-[14px] font-bold text-green-600">{p.package}</p><p className="text-[12px] text-gray-400">{p.date}</p></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* AT-RISK WIDGET */}
                                <div className="mt-8 rounded-[24px] p-6 shadow-xl border border-red-100" style={{ backgroundImage: 'linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)' }}>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-red-100 p-2.5 rounded-xl">
                                                <span className="material-symbols-outlined text-red-600">notification_important</span>
                                            </div>
                                            <div>
                                                <h3 className="text-[16px] font-bold text-gray-900">Students At-Risk Warning System</h3>
                                                <p className="text-[12px] text-gray-500 mt-0.5">Automated detection of students needing urgent mentoring</p>
                                            </div>
                                        </div>
                                        <button className="text-[13px] font-bold text-red-600 hover:underline">View Priority List</button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {atRiskData.students.slice(0, 4).map((s, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 rounded-[18px] bg-white border border-red-50 shadow-sm hover:border-red-200 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-gray-100 p-2 rounded-lg text-gray-500 font-bold text-[11px]">{s.userId?.slice(-4) || '??'}</div>
                                                    <div>
                                                        <p className="text-[14px] font-bold text-gray-900">{s.branch} Student</p>
                                                        <p className="text-[11px] text-red-500 font-medium">{s.riskReason}</p>
                                                    </div>
                                                </div>
                                                <button className="h-8 w-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors">
                                                    <span className="material-symbols-outlined text-[18px]">chat</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ===== ANALYTICS TAB ===== */}
                        {activeTab === 'analytics' && (
                            <>
                                <div className="mb-6">
                                    <h1 className="text-[28px] font-bold text-gray-900">Placement Analytics</h1>
                                    <p className="text-[15px] text-gray-500 mt-1">Trends, distributions, and batch-level insights</p>
                                </div>
                                <PlacementCharts />
                            </>
                        )}

                        {/* ===== COMPANIES TAB ===== */}
                        {activeTab === 'companies' && (
                            <>
                                <div className="mb-6">
                                    <h1 className="text-[28px] font-bold text-gray-900">Company-Student Mapping</h1>
                                    <p className="text-[15px] text-gray-500 mt-1">AI-matched students for visiting companies</p>
                                </div>
                                <CompanyMapping />
                                {companyJobs.length > 0 && (
                                    <div className="mt-8 rounded-[16px] p-6 shadow-sm" style={{ backgroundColor: '#DCD9D4', backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.50) 0%, rgba(0,0,0,0.50) 100%), radial-gradient(at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.50) 50%)', backgroundBlendMode: 'soft-light, screen' }}>
                                        <h3 className="text-[16px] font-bold text-gray-900 mb-4">Jobs Posted via Company Portal</h3>
                                        <div className="space-y-3">
                                            {companyJobs.map(job => (
                                                <div key={job.id} className="flex items-center justify-between p-3 rounded-xl bg-white/20 border border-white/30">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-blue-100 p-2 rounded-lg"><span className="material-symbols-outlined text-blue-600 text-[18px]">work</span></div>
                                                        <div><p className="text-[14px] font-medium text-gray-900">{job.title}</p><p className="text-[12px] text-gray-500">{job.resumeCount} resumes • {job.candidatesShortlisted} shortlisted</p></div>
                                                    </div>
                                                    <span className="px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-green-100 text-green-700">{job.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* ===== STUDENTS TAB ===== */}
                        {activeTab === 'students' && (
                            <>
                                <div className="mb-6">
                                    <h1 className="text-[28px] font-bold text-gray-900">Student Directory</h1>
                                    <p className="text-[15px] text-gray-500 mt-1">All enrolled students and their placement status</p>
                                </div>
                                <div className="rounded-[16px] p-6 shadow-sm" style={{ backgroundColor: '#DCD9D4', backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.50) 0%, rgba(0,0,0,0.50) 100%), radial-gradient(at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.50) 50%)', backgroundBlendMode: 'soft-light, screen' }}>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-white/30">
                                                    <th className="pb-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-500">Student ID</th>
                                                    <th className="pb-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-500">Branch</th>
                                                    <th className="pb-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-500">CGPA</th>
                                                    <th className="pb-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-500">Status</th>
                                                    <th className="pb-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-500">Company</th>
                                                    <th className="pb-3 text-right text-[12px] font-semibold uppercase tracking-wider text-gray-500">Package</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/20">
                                                {[
                                                    { id: 'STU-2847', branch: 'CSE', cgpa: 8.9, status: 'placed', company: 'Google', pkg: '₹18 LPA' },
                                                    { id: 'STU-1923', branch: 'CSE', cgpa: 9.2, status: 'placed', company: 'Amazon', pkg: '₹28 LPA' },
                                                    { id: 'STU-3461', branch: 'IT', cgpa: 8.4, status: 'placed', company: 'Microsoft', pkg: '₹22 LPA' },
                                                    { id: 'STU-5102', branch: 'ECE', cgpa: 7.8, status: 'placed', company: 'Flipkart', pkg: '₹16 LPA' },
                                                    { id: 'STU-4291', branch: 'CSE', cgpa: 8.1, status: 'interviewing', company: 'Razorpay', pkg: '—' },
                                                    { id: 'STU-6738', branch: 'IT', cgpa: 7.5, status: 'applied', company: '—', pkg: '—' },
                                                    { id: 'STU-8204', branch: 'CSE', cgpa: 9.0, status: 'placed', company: 'Meta', pkg: '₹32 LPA' },
                                                    { id: 'STU-3917', branch: 'ECE', cgpa: 7.2, status: 'unplaced', company: '—', pkg: '—' },
                                                ].map(s => (
                                                    <tr key={s.id} className="hover:bg-white/10 transition-colors">
                                                        <td className="py-3.5 text-[14px] font-semibold text-gray-900">{s.id}</td>
                                                        <td className="py-3.5 text-[14px] text-gray-600">{s.branch}</td>
                                                        <td className="py-3.5 text-[14px] text-gray-600">{s.cgpa}</td>
                                                        <td className="py-3.5">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-bold ${s.status === 'placed' ? 'bg-green-100 text-green-700' : s.status === 'interviewing' ? 'bg-purple-100 text-purple-700' : s.status === 'applied' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{s.status}</span>
                                                        </td>
                                                        <td className="py-3.5 text-[14px] text-gray-600">{s.company}</td>
                                                        <td className="py-3.5 text-[14px] font-bold text-right text-gray-900">{s.pkg}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ===== COMPLIANCE TAB ===== */}
                        {activeTab === 'compliance' && (
                            <div className="animate-fade-in">
                                <div className="mb-6">
                                    <h1 className="text-[28px] font-bold text-gray-900">Compliance & Accreditation</h1>
                                    <p className="text-[15px] text-gray-500 mt-1">Automated NIRF, NAAC, and Regulatory Placement Reports</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                                    <div className="bg-white p-8 rounded-[32px] shadow-2xl shadow-indigo-900/10 border border-indigo-50 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-12 bg-indigo-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-500"></div>
                                        <div className="relative">
                                            <div className="bg-indigo-600 p-4 rounded-3xl w-fit mb-6 shadow-lg shadow-indigo-200">
                                                <span className="material-symbols-outlined text-white text-[32px]">article</span>
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-3">NIRF/NAAC Report</h3>
                                            <p className="text-gray-500 leading-relaxed mb-8">
                                                Generate a professionally formatted 50-page PDF containing all mandatory placement statistics, company distributions, and student records required for accreditation.
                                            </p>
                                            <button
                                                onClick={generateComplianceReport}
                                                disabled={generatingReport}
                                                className="w-full py-4 bg-indigo-600 text-white rounded-[20px] font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-100"
                                            >
                                                {generatingReport ? (
                                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                ) : (
                                                    <span className="material-symbols-outlined">download</span>
                                                )}
                                                Generate Compliance PDF
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-[#1a1a1a] p-8 rounded-[32px] shadow-2xl text-white">
                                        <div className="bg-white/10 p-4 rounded-3xl w-fit mb-6">
                                            <span className="material-symbols-outlined text-white text-[32px]">bar_chart</span>
                                        </div>
                                        <h3 className="text-2xl font-bold mb-3">Real-time Compliance</h3>
                                        <div className="space-y-6 mt-8">
                                            {[
                                                { label: 'NIRF Data Quality', val: '98%', color: 'bg-green-500' },
                                                { label: 'Regulatory Filings', val: '12', color: 'bg-blue-500' },
                                                { label: 'Audit Ready', val: 'YES', color: 'bg-indigo-500 text-xs' }
                                            ].map(s => (
                                                <div key={s.label} className="flex justify-between items-center border-b border-white/10 pb-4">
                                                    <span className="text-white/60 font-medium">{s.label}</span>
                                                    <span className={`px-4 py-1 rounded-full font-bold ${s.color}`}>{s.val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* RIGHT PANEL TOGGLE BUTTON */}
                <button onClick={() => setRightPanelOpen(!rightPanelOpen)} className="fixed bottom-6 right-6 z-20 bg-violet-600 hover:bg-violet-700 text-white p-3 rounded-full shadow-lg shadow-violet-900/30 transition-all hover:scale-105">
                    <span className="material-symbols-outlined text-[24px]">{rightPanelOpen ? 'close' : 'info'}</span>
                </button>
            </div>

            {/* RIGHT PANEL OVERLAY */}
            {rightPanelOpen && <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setRightPanelOpen(false)} />}
            <aside className={`fixed top-0 right-0 h-full w-[320px] z-40 overflow-y-auto shadow-2xl transition-transform duration-300 ${rightPanelOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ backgroundImage: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)' }}>
                <div className="p-[28px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[15px] font-bold text-gray-900">Quick Stats</h3>
                        <button onClick={() => setRightPanelOpen(false)} className="p-1 hover:bg-white/40 rounded-lg transition-colors"><span className="material-symbols-outlined text-gray-600">close</span></button>
                    </div>
                    <div className="space-y-5">
                        <div className="text-center">
                            <div className="relative w-[100px] h-[100px] mx-auto mb-3">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path className="fill-none stroke-white/50 stroke-[3.8]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path className="fill-none stroke-green-500 stroke-[3.8] stroke-linecap-round" strokeDasharray={`${batchStats.placementRate}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-[20px] font-bold text-gray-900">{batchStats.placementRate}%</span>
                                </div>
                            </div>
                            <p className="text-[13px] font-medium text-gray-600">Placement Rate</p>
                        </div>
                        <div className="border-t border-white/40 pt-4 space-y-3">
                            {[
                                { label: 'Avg Package', value: batchStats.avgPackage, color: 'text-blue-600' },
                                { label: 'Highest Package', value: batchStats.highestPackage, color: 'text-green-600' },
                                { label: 'Companies', value: batchStats.companiesVisited, color: 'text-purple-600' },
                                { label: 'Ongoing Drives', value: batchStats.ongoingDrives, color: 'text-orange-600' },
                            ].map((stat) => (
                                <div key={stat.label} className="flex justify-between items-center">
                                    <span className="text-[13px] text-gray-500">{stat.label}</span>
                                    <span className={`text-[14px] font-bold ${stat.color}`}>{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
