import { useState } from 'react';
import {
  Upload, FileText, CheckCircle, Plus, Download, RefreshCw,
  AlertTriangle, ChevronDown, X, File, Award, GraduationCap, Briefcase
} from 'lucide-react';
import AppShell from '../components/AppShell';
import CircularGauge from '../components/CircularGauge';

const extractedSkills = ['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'REST APIs', 'MongoDB', 'HTML/CSS', 'TypeScript'];
const education = [
  { degree: 'B.Tech in Computer Science', school: 'IIT Delhi', year: '2021–2025', gpa: '8.7/10' },
];
const experience = [
  { title: 'Software Engineering Intern', company: 'Google', duration: 'May 2024 – Aug 2024', bullets: ['Built microservices with Go and gRPC', 'Improved API latency by 30%'] },
  { title: 'Full Stack Developer', company: 'College Project', duration: 'Jan 2024 – Apr 2024', bullets: ['Built e-commerce platform using React + Node.js'] },
];
const certifications = ['AWS Cloud Practitioner', 'Google Data Analytics'];
const missingKeywords = ['Docker', 'Kubernetes', 'CI/CD', 'System Design', 'AWS Lambda', 'Redis', 'GraphQL', 'Terraform'];
const quickFixes = [
  { text: 'Add a professional summary section', done: false },
  { text: 'Quantify achievements with numbers and metrics', done: false },
  { text: 'Include relevant keywords for the target role', done: true },
  { text: 'Use action verbs to start bullet points', done: true },
  { text: 'Remove outdated or irrelevant experience', done: false },
];

const breakdownBars = [
  { label: 'Formatting', value: 92, color: '#10B981' },
  { label: 'Keyword Density', value: 78, color: '#3D5AFE' },
  { label: 'Readability', value: 95, color: '#10B981' },
  { label: 'Missing Sections', value: 65, color: '#F59E0B' },
];

export default function ResumeAnalyzerPage() {
  const [activeTab, setActiveTab] = useState('skills');
  const [uploaded, setUploaded] = useState(true); // show analyzed state by default

  return (
    <AppShell>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-navy mb-1">Resume Analyzer</h1>
        <p className="text-sm text-text-secondary">Upload your resume to get an instant AI-powered breakdown and ATS score.</p>
      </div>

      {/* Upload Zone */}
      <div className="card p-6 mb-8">
        {!uploaded ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-royal-blue hover:bg-blue-light/20 transition-all"
            onClick={() => setUploaded(true)}
          >
            <Upload size={48} className="text-text-muted mx-auto mb-4" />
            <p className="text-base font-semibold text-navy mb-1">Drag & drop your resume (PDF) or click to browse</p>
            <p className="text-xs text-text-secondary">Supported formats: PDF, DOCX — Max 5MB</p>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-blue-light/30 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="icon-badge icon-badge-blue">
                <File size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-navy">Saksham_Resume_2025.pdf</p>
                <p className="text-xs text-text-secondary">2.4 MB · Uploaded 2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1">
                <CheckCircle size={12} /> Analyzed
              </span>
              <button
                onClick={() => setUploaded(false)}
                className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={16} className="text-text-secondary" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {uploaded && (
        <>
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* ATS Score */}
              <div className="card p-6">
                <h3 className="text-base font-bold text-navy mb-6">ATS Compatibility Score</h3>
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <CircularGauge value={87} max={100} size={160} strokeWidth={14} label="ATS Score" />
                  <div className="flex-1 space-y-3 w-full">
                    {breakdownBars.map((bar, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-text-secondary font-medium">{bar.label}</span>
                          <span className="font-bold text-navy">{bar.value}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${bar.value}%`, background: bar.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Extracted Information */}
              <div className="card p-6">
                <h3 className="text-base font-bold text-navy mb-4">Extracted Information</h3>

                {/* Tabs */}
                <div className="flex gap-1 mb-5 bg-bg-light rounded-xl p-1">
                  {[
                    { key: 'skills', label: 'Skills', icon: Award },
                    { key: 'education', label: 'Education', icon: GraduationCap },
                    { key: 'experience', label: 'Experience', icon: Briefcase },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                        activeTab === tab.key
                          ? 'bg-white text-navy shadow-sm font-semibold'
                          : 'text-text-secondary hover:text-navy'
                      }`}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      <tab.icon size={14} />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'skills' && (
                  <div className="flex flex-wrap gap-2">
                    {extractedSkills.map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-blue-light text-royal-blue text-xs font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {activeTab === 'education' && (
                  <div className="space-y-3">
                    {education.map((edu, i) => (
                      <div key={i} className="p-3 rounded-xl bg-bg-light">
                        <p className="text-sm font-bold text-navy">{edu.degree}</p>
                        <p className="text-xs text-text-secondary">{edu.school} · {edu.year}</p>
                        <p className="text-xs text-royal-blue font-semibold mt-1">GPA: {edu.gpa}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'experience' && (
                  <div className="space-y-3">
                    {experience.map((exp, i) => (
                      <div key={i} className="p-3 rounded-xl bg-bg-light">
                        <p className="text-sm font-bold text-navy">{exp.title}</p>
                        <p className="text-xs text-text-secondary">{exp.company} · {exp.duration}</p>
                        <ul className="mt-2 space-y-1" style={{ listStyle: 'none' }}>
                          {exp.bullets.map((b, j) => (
                            <li key={j} className="text-xs text-gray-600 flex items-start gap-1.5">
                              <span className="text-royal-blue mt-0.5">•</span> {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {certifications.length > 0 && (
                      <div className="p-3 rounded-xl bg-bg-light">
                        <p className="text-sm font-bold text-navy mb-2">Certifications</p>
                        <div className="flex flex-wrap gap-2">
                          {certifications.map((cert, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-medium">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Missing Keywords */}
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={18} className="text-warning" />
                  <h3 className="text-base font-bold text-navy">Missing Keywords</h3>
                </div>
                <p className="text-xs text-text-secondary mb-4">
                  Adding these keywords could improve your ATS score significantly.
                </p>
                <div className="flex flex-wrap gap-2">
                  {missingKeywords.map((kw, i) => (
                    <button
                      key={i}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-xs font-medium text-text-secondary hover:border-royal-blue hover:text-royal-blue hover:bg-blue-light/20 transition-all"
                      style={{ background: 'transparent', cursor: 'pointer' }}
                    >
                      <Plus size={12} /> {kw}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Role */}
              <div className="card p-6">
                <h3 className="text-base font-bold text-navy mb-3">Target Role</h3>
                <p className="text-xs text-text-secondary mb-3">Select a target role to re-score your resume against specific requirements.</p>
                <div className="relative">
                  <select className="w-full px-4 py-3 rounded-xl bg-bg-light border border-gray-200 text-sm text-navy font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-royal-blue/20 focus:border-royal-blue transition-all cursor-pointer">
                    <option>Backend Developer</option>
                    <option>Data Analyst</option>
                    <option>Full Stack Developer</option>
                    <option>ML Engineer</option>
                    <option>DevOps Engineer</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                </div>
              </div>

              {/* Quick Fixes */}
              <div className="card p-6">
                <h3 className="text-base font-bold text-navy mb-4">Quick Fixes</h3>
                <div className="space-y-3">
                  {quickFixes.map((fix, i) => (
                    <label key={i} className="flex items-start gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-md flex-shrink-0 mt-0.5 flex items-center justify-center border-2 transition-all ${
                        fix.done
                          ? 'bg-royal-blue border-royal-blue'
                          : 'border-gray-300 group-hover:border-royal-blue'
                      }`}>
                        {fix.done && <CheckCircle size={12} className="text-white" />}
                      </div>
                      <span className={`text-sm ${fix.done ? 'text-text-secondary line-through' : 'text-navy'}`}>
                        {fix.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8">
            <button className="btn btn-outline">
              <RefreshCw size={16} /> Re-analyze Resume
            </button>
            <button className="btn btn-primary">
              <Download size={16} /> Download Optimized Resume
            </button>
          </div>
        </>
      )}
    </AppShell>
  );
}
