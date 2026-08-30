import { useState, useId } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Bookmark,
  ExternalLink,
  Sparkles,
  Briefcase,
  DollarSign,
  GraduationCap,
  Check,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter
} from "lucide-react";

const JOBS = [
  {
    id: 1,
    title: "Frontend Engineer",
    company: "NovaTech Systems",
    location: "Bengaluru, India",
    salary: "₹8,00,000 - ₹12,00,000 a year",
    salaryShort: "₹8–12 LPA",
    match: 94,
    type: "Full-time",
    level: "Mid-level",
    workplace: "Hybrid",
    posted: "2 days ago",
    reason: "Matches your React + TypeScript skills",
    fitReasons: [
      "Strong overlap with your resume's React, Redux, and Tailwind experience",
      "Your recent project 'AI Career Copilot' aligns with their product stack",
      "Salary range fits your target compensation band",
    ],
    matchedSkills: ["React", "TypeScript", "Tailwind CSS", "REST APIs"],
    missingSkills: ["GraphQL"],
  },
  {
    id: 2,
    title: "Backend Developer (Node.js)",
    company: "Vertex Cloud Labs",
    location: "Remote, India",
    salary: "₹9,50,000 - ₹14,00,000 a year",
    salaryShort: "₹9.5–14 LPA",
    match: 88,
    type: "Full-time",
    level: "Mid-level",
    workplace: "Remote",
    posted: "1 day ago",
    reason: "Matches your Node.js + FastAPI experience",
    fitReasons: [
      "You've shipped microservices in Node.js and Python",
      "Remote-first role matches your stated preference",
      "Company uses AWS, which matches your recent cloud coursework",
    ],
    matchedSkills: ["Node.js", "Express", "SQL", "Git"],
    missingSkills: ["Docker", "AWS"],
  },
  {
    id: 3,
    title: "AI/ML Intern",
    company: "Sprintify Labs",
    location: "Hyderabad, India",
    salary: "₹25,000 - ₹35,000 a month",
    salaryShort: "₹3-4.2 LPA",
    match: 81,
    type: "Internship",
    level: "Entry-level",
    workplace: "Onsite",
    posted: "3 days ago",
    reason: "Matches your ML coursework and project work",
    fitReasons: [
      "Aligned with your algorithms and data science background",
      "Internship duration fits a semester break window",
      "Team works on recommendation systems, close to your AI/ML layer",
    ],
    matchedSkills: ["Python", "PyTorch", "SQL"],
    missingSkills: ["MLOps"],
  },
  {
    id: 4,
    title: "Full Stack Developer",
    company: "Flipkart",
    location: "Bengaluru, India",
    salary: "₹10,00,000 - ₹16,00,000 a year",
    salaryShort: "₹10–16 LPA",
    match: 79,
    type: "Full-time",
    level: "Mid-level",
    workplace: "Hybrid",
    posted: "4 days ago",
    reason: "Matches your MERN stack expertise",
    fitReasons: [
      "Extensive React and Node.js project experience on your profile",
      "E-commerce workflow knowledge matches company focus area",
      "Demonstrated competency in API performance optimization",
    ],
    matchedSkills: ["React", "Node.js", "MongoDB", "JavaScript"],
    missingSkills: ["Kubernetes"],
  },
  {
    id: 5,
    title: "DevOps Engineer",
    company: "Razorpay",
    location: "Remote, India",
    salary: "₹12,00,000 - ₹18,00,000 a year",
    salaryShort: "₹12–18 LPA",
    match: 75,
    type: "Full-time",
    level: "Mid-level",
    workplace: "Remote",
    posted: "5 days ago",
    reason: "Matches your CI/CD and Linux fundamentals",
    fitReasons: [
      "Solid command over Git workflows and script automation",
      "Demonstrated interest in Cloud Native architecture",
      "Competitive salary package matching market rates",
    ],
    matchedSkills: ["Linux", "Git", "Python"],
    missingSkills: ["Docker", "Terraform", "AWS"],
  },
];

const FILTERS = ["Date posted", "Match score", "Job type", "Remote"];

export default function JobRecommendationsPage() {
  const [selectedId, setSelectedId] = useState(JOBS[0].id);
  const [activeFilters, setActiveFilters] = useState([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [savedJobs, setSavedJobs] = useState([1]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [showAppliedToast, setShowAppliedToast] = useState(false);

  const titleSuggestionsId = useId();

  const toggleFilter = (f) =>
    setActiveFilters((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );

  const toggleBookmark = (e, id) => {
    e.stopPropagation();
    setSavedJobs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleApply = (id) => {
    if (!appliedJobs.includes(id)) {
      setAppliedJobs((prev) => [...prev, id]);
      setShowAppliedToast(true);
      setTimeout(() => setShowAppliedToast(false), 3000);
    }
  };

  // Filter jobs based on search & filter pills
  const filteredJobs = JOBS.filter((job) => {
    const matchesTitle =
      !searchTitle ||
      job.title.toLowerCase().includes(searchTitle.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTitle.toLowerCase()) ||
      job.matchedSkills.some((s) => s.toLowerCase().includes(searchTitle.toLowerCase()));

    const matchesLoc =
      !searchLocation ||
      job.location.toLowerCase().includes(searchLocation.toLowerCase());

    if (!matchesTitle || !matchesLoc) return false;

    if (activeFilters.includes("Remote") && job.workplace !== "Remote") return false;
    if (activeFilters.includes("Job type") && job.type !== "Full-time") return false;
    if (activeFilters.includes("Match score") && job.match < 85) return false;

    return true;
  });

  const selected = JOBS.find((j) => j.id === selectedId) || filteredJobs[0] || JOBS[0];
  const isSelectedSaved = savedJobs.includes(selected.id);
  const isSelectedApplied = appliedJobs.includes(selected.id);

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-[#12142B] font-sans">
      {/* Toast Notification */}
      {showAppliedToast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 bg-[#12142B] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in-up border border-white/10"
        >
          <div className="w-7 h-7 rounded-full bg-[#22D3C9]/20 flex items-center justify-center">
            <CheckCircle2 size={18} className="text-[#22D3C9]" />
          </div>
          <div>
            <p className="text-sm font-bold">Application Sent with Copilot!</p>
            <p className="text-xs text-[#9298B5]">Your tailored resume & cover letter were submitted.</p>
          </div>
        </div>
      )}

      {/* Sticky top navbar */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#E7E9F5]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="font-extrabold text-xl tracking-tight text-[#12142B] no-underline flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2A4BFF] flex items-center justify-center text-white font-bold text-sm">
              AI
            </div>
            <span>AI Career <span className="text-[#2A4BFF]">Copilot</span></span>
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-[#5B5F79]">
            <Link to="/dashboard" className="hover:text-[#12142B] no-underline">Dashboard</Link>
            <Link to="/jobs" className="text-[#2A4BFF] font-bold no-underline">Job Matches</Link>
            <Link to="/resume" className="hover:text-[#12142B] no-underline">Resume</Link>
            <Link to="/interview" className="hover:text-[#12142B] no-underline">Interview Prep</Link>
            <Link to="/skills" className="hover:text-[#12142B] no-underline">Skill Path</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-[#2A4BFF] hover:text-[#1E39CC] no-underline">
              Sign in
            </Link>
            <Link to="/signup" className="bg-[#2A4BFF] hover:bg-[#1E39CC] text-white font-bold text-sm px-5 py-2.5 rounded-full transition-colors no-underline shadow-sm hover:shadow-md">
              For Recruiters
            </Link>
          </div>
        </div>
      </header>

      {/* Search band */}
      <section className="bg-[#EDEFFD] py-8 border-b border-[#E7E9F5]/60">
        <div className="max-w-7xl mx-auto px-6">
          <div
            role="search"
            className="bg-white rounded-2xl shadow-lg shadow-[#2A4BFF]/5 p-3 flex flex-col md:flex-row gap-3 items-stretch"
          >
            <div className="flex items-center gap-3 flex-1 px-4 py-3 border border-[#E7E9F5] rounded-xl focus-within:ring-2 focus-within:ring-[#2A4BFF] focus-within:border-transparent transition-all">
              <Search size={18} className="text-[#5B5F79] shrink-0" />
              <input
                role="combobox"
                aria-label="Search jobs by title, skills, or company"
                aria-autocomplete="list"
                aria-expanded="false"
                aria-controls={titleSuggestionsId}
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                placeholder="Job title, skills, or company"
                className="w-full outline-none text-sm placeholder:text-[#9298B5] text-[#12142B] font-medium bg-transparent"
              />
            </div>
            <div className="flex items-center gap-3 flex-1 px-4 py-3 border border-[#E7E9F5] rounded-xl focus-within:ring-2 focus-within:ring-[#2A4BFF] focus-within:border-transparent transition-all">
              <MapPin size={18} className="text-[#5B5F79] shrink-0" />
              <input
                role="combobox"
                aria-label="Job location"
                aria-autocomplete="list"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="City, remote, or state"
                className="w-full outline-none text-sm placeholder:text-[#9298B5] text-[#12142B] font-medium bg-transparent"
              />
            </div>
            <button
              onClick={() => {}}
              className="bg-[#2A4BFF] hover:bg-[#1E39CC] text-white font-bold text-sm px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Find Matches
            </button>
          </div>

          {/* Filter pills */}
          <div role="group" aria-label="Filter jobs" className="flex flex-wrap gap-2 mt-4 items-center">
            <span className="text-xs font-bold text-[#5B5F79] uppercase tracking-wider mr-1">Quick Filters:</span>
            {FILTERS.map((f) => {
              const active = activeFilters.includes(f);
              return (
                <button
                  key={f}
                  aria-pressed={active}
                  onClick={() => toggleFilter(f)}
                  className={`text-sm font-semibold px-4 py-2 rounded-full border transition-all cursor-pointer ${
                    active
                      ? "bg-[#2A4BFF] border-[#2A4BFF] text-white shadow-sm"
                      : "bg-white border-[#E7E9F5] text-[#5B5F79] hover:border-[#2A4BFF] hover:text-[#2A4BFF]"
                  }`}
                >
                  {f} {active && "✓"}
                </button>
              );
            })}
            {(activeFilters.length > 0 || searchTitle || searchLocation) && (
              <button
                onClick={() => {
                  setActiveFilters([]);
                  setSearchTitle("");
                  setSearchLocation("");
                }}
                className="text-xs font-semibold text-[#2A4BFF] hover:underline ml-2"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Results + detail split view */}
      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <div
          aria-live="polite"
          className="sr-only"
        >{`Showing ${filteredJobs.length} job matches`}</div>

        {/* Left: results list (40% width / 2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-4 max-h-[calc(100vh-210px)] overflow-y-auto pr-1">
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-[#E7E9F5] text-center">
              <p className="text-base font-bold text-[#12142B]">No job matches found</p>
              <p className="text-sm text-[#5B5F79] mt-1">Try clearing filters or searching for different keywords.</p>
              <button
                onClick={() => {
                  setActiveFilters([]);
                  setSearchTitle("");
                  setSearchLocation("");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-[#2A4BFF] text-white text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const isSelected = job.id === selected.id;
              const isBookmarked = savedJobs.includes(job.id);
              return (
                <button
                  key={job.id}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedId(job.id)}
                  className={`text-left bg-white rounded-2xl p-5 border transition-all focus:outline-none focus:ring-2 focus:ring-[#2A4BFF] relative cursor-pointer ${
                    isSelected
                      ? "border-l-4 border-l-[#2A4BFF] border-y-[#E7E9F5] border-r-[#E7E9F5] bg-[#F5F7FF] shadow-sm"
                      : "border-[#E7E9F5] hover:border-[#2A4BFF]/40 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold text-white px-3 py-1 rounded-full bg-gradient-to-r from-[#2A4BFF] to-[#22D3C9] shadow-sm">
                      {job.match}% Match
                    </span>
                    <button
                      type="button"
                      aria-label={isBookmarked ? "Remove saved job" : "Save job"}
                      onClick={(e) => toggleBookmark(e, job.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isBookmarked
                          ? "text-[#2A4BFF] bg-[#2A4BFF]/10"
                          : "text-[#9298B5] hover:text-[#2A4BFF] hover:bg-[#F0F2FF]"
                      }`}
                    >
                      <Bookmark size={18} fill={isBookmarked ? "#2A4BFF" : "none"} />
                    </button>
                  </div>
                  <h3 className="font-extrabold text-lg leading-tight text-[#12142B]">{job.title}</h3>
                  <p className="text-[#2A4BFF] font-semibold text-sm mt-1 hover:underline">{job.company}</p>
                  <p className="text-[#5B5F79] text-sm mt-0.5">{job.location}</p>
                  <p className="text-[#5B5F79] text-sm font-semibold mt-1">{job.salary}</p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {job.matchedSkills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="text-[11px] font-semibold text-[#2A4BFF] bg-[#2A4BFF]/10 px-2 py-0.5 rounded-md">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <p className="text-[#12142B] text-xs font-semibold mt-3 bg-[#F0F2FF] inline-block px-3 py-1.5 rounded-full">
                    ✦ {job.reason}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* Right: sticky detail panel (60% width / 3 cols) */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="bg-white rounded-2xl border border-[#E7E9F5] shadow-sm p-8 sticky top-24 max-h-[calc(100vh-140px)] overflow-y-auto">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold leading-tight text-[#12142B]">{selected.title}</h1>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="inline-flex items-center gap-1 text-[#2A4BFF] font-bold text-base mt-2 hover:underline"
                  >
                    {selected.company} <ExternalLink size={16} />
                  </a>
                  <p className="text-[#5B5F79] text-sm mt-1">{selected.location} • <span className="font-medium">{selected.posted}</span></p>
                  <p className="font-extrabold text-xl text-[#12142B] mt-2">{selected.salary}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-extrabold text-white px-4 py-1.5 rounded-full bg-gradient-to-r from-[#2A4BFF] to-[#22D3C9] shadow-md flex-shrink-0">
                  {selected.match}% AI Match
                </span>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={() => handleApply(selected.id)}
                  disabled={isSelectedApplied}
                  className={`font-bold px-7 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                    isSelectedApplied
                      ? "bg-green-600 text-white cursor-default"
                      : "bg-[#2A4BFF] hover:bg-[#1E39CC] text-white hover:shadow-lg active:scale-95"
                  }`}
                >
                  {isSelectedApplied ? (
                    <>
                      <CheckCircle2 size={18} /> Applied with Copilot
                    </>
                  ) : (
                    <>
                      Apply with Copilot <ArrowRight size={16} />
                    </>
                  )}
                </button>
                <button
                  onClick={(e) => toggleBookmark(e, selected.id)}
                  className={`flex items-center gap-2 border font-semibold px-5 py-3 rounded-xl transition-all cursor-pointer ${
                    isSelectedSaved
                      ? "bg-[#2A4BFF]/10 border-[#2A4BFF] text-[#2A4BFF]"
                      : "border-[#E7E9F5] text-[#12142B] hover:border-[#2A4BFF] hover:text-[#2A4BFF]"
                  }`}
                >
                  <Bookmark size={18} fill={isSelectedSaved ? "#2A4BFF" : "none"} />
                  {isSelectedSaved ? "Saved" : "Save"}
                </button>
              </div>

              <hr className="my-8 border-[#E7E9F5]" />

              <h2 className="font-extrabold text-xl text-[#12142B] mb-4">Job details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 bg-[#F7F8FC] p-4 rounded-xl border border-[#E7E9F5]">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#2A4BFF]/10 text-[#2A4BFF]">
                    <DollarSign size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-[#5B5F79] font-bold uppercase tracking-wider">Pay</p>
                    <p className="text-sm font-bold text-[#12142B] mt-0.5">{selected.salary}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#2A4BFF]/10 text-[#2A4BFF]">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-[#5B5F79] font-bold uppercase tracking-wider">Job type</p>
                    <p className="text-sm font-bold text-[#12142B] mt-0.5">{selected.type} ({selected.workplace})</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#2A4BFF]/10 text-[#2A4BFF]">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-[#5B5F79] font-bold uppercase tracking-wider">Experience</p>
                    <p className="text-sm font-bold text-[#12142B] mt-0.5">{selected.level}</p>
                  </div>
                </div>
              </div>

              {/* Skills Match Breakdown */}
              <div className="mb-8">
                <h3 className="font-extrabold text-base text-[#12142B] mb-3">Skills Analysis</h3>
                <div className="flex flex-wrap gap-2">
                  {selected.matchedSkills.map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 font-semibold text-xs border border-green-200">
                      <Check size={14} className="text-green-600" /> {s}
                    </span>
                  ))}
                  {selected.missingSkills.map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 font-medium text-xs border border-gray-200">
                      • Missing: {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Why you're a fit AI card */}
              <div className="bg-[#F0F2FF] rounded-2xl p-6 border border-[#2A4BFF]/15">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#2A4BFF] flex items-center justify-center text-white">
                    <Sparkles size={18} />
                  </div>
                  <h3 className="font-extrabold text-lg text-[#12142B]">Why you're a fit</h3>
                </div>
                <ul className="space-y-2.5 mt-4" style={{ listStyle: "none" }}>
                  {selected.fitReasons.map((r, i) => (
                    <li key={i} className="text-sm text-[#3D4160] font-medium flex items-start gap-2.5">
                      <span className="text-[#2A4BFF] font-bold text-base leading-none mt-0.5">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
