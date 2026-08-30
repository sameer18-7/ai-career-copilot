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
  Share2,
  Info,
  X,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  Rocket
} from "lucide-react";

const JOBS = [
  {
    id: 1,
    title: "Frontend Engineer",
    company: "NovaTech Systems",
    location: "Bengaluru, Karnataka",
    salary: "₹8,00,000 - ₹12,00,000 a year",
    salaryShort: "₹8–12 LPA",
    match: 94,
    type: "Full-time",
    workplace: "Hybrid",
    level: "Mid-level (2+ yrs)",
    posted: "2 days ago",
    reason: "Matches your React + TypeScript skills",
    fitReasons: [
      "Strong overlap with your resume's React, Redux, and Tailwind CSS experience",
      "Your recent project 'AI Career Copilot' aligns directly with their frontend tech stack",
      "Salary offer fits within your target compensation band",
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
    workplace: "Remote",
    level: "Mid-level (3+ yrs)",
    posted: "1 day ago",
    reason: "Matches your Node.js + Express experience",
    fitReasons: [
      "Demonstrated backend development experience using Node.js and PostgreSQL",
      "Remote-first work culture aligns with your location preferences",
      "Cloud deployment skills match their AWS infrastructure coursework",
    ],
    matchedSkills: ["Node.js", "Express", "PostgreSQL", "Git"],
    missingSkills: ["Docker", "AWS"],
  },
  {
    id: 3,
    title: "AI / ML Intern",
    company: "Sprintify Labs",
    location: "Hyderabad, Telangana",
    salary: "₹25,000 - ₹35,000 a month",
    salaryShort: "₹3–4.2 LPA",
    match: 81,
    type: "Internship",
    workplace: "Onsite",
    level: "Entry-level (Student)",
    posted: "3 days ago",
    reason: "Matches your ML coursework & Python projects",
    fitReasons: [
      "Aligned with your Data Structures, Algorithms, and ML coursework background",
      "Internship timeline fits within your upcoming semester break window",
      "Team builds recommendation models, close to your AI platform project",
    ],
    matchedSkills: ["Python", "PyTorch", "SQL", "Scikit-Learn"],
    missingSkills: ["MLOps", "Docker"],
  },
  {
    id: 4,
    title: "Full Stack Developer",
    company: "Flipkart",
    location: "Bengaluru, Karnataka",
    salary: "₹10,00,000 - ₹16,00,000 a year",
    salaryShort: "₹10–16 LPA",
    match: 79,
    type: "Full-time",
    workplace: "Hybrid",
    level: "Mid-level (2-4 yrs)",
    posted: "4 days ago",
    reason: "Matches your MERN stack expertise",
    fitReasons: [
      "Comprehensive React and Node.js project experience on your profile",
      "E-commerce workflow knowledge matches company product domain",
      "Proven competency in REST API building and database design",
    ],
    matchedSkills: ["React", "Node.js", "MongoDB", "JavaScript"],
    missingSkills: ["Redis", "Kubernetes"],
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
    workplace: "Remote",
    level: "Associate (1-3 yrs)",
    posted: "5 days ago",
    reason: "Matches your CI/CD & Linux fundamentals",
    fitReasons: [
      "Solid command over Git version control and script automation",
      "Demonstrated interest in Cloud Native architecture and pipelines",
      "Competitive salary package exceeding regional benchmarks",
    ],
    matchedSkills: ["Linux", "Git", "Python", "Shell Scripting"],
    missingSkills: ["Docker", "Terraform", "AWS"],
  },
];

const FILTERS = ["Date posted", "Match score (80%+)", "Job type", "Remote only"];

export default function JobRecommendationsPage() {
  const [selectedId, setSelectedId] = useState(JOBS[0].id);
  const [activeFilters, setActiveFilters] = useState([]);
  const [searchTitle, setSearchTitle] = useState("jobs hiring");
  const [searchLocation, setSearchLocation] = useState("");
  const [savedJobs, setSavedJobs] = useState([1]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [showTip, setShowTip] = useState(true);
  const [showToast, setShowToast] = useState(false);

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
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    }
  };

  // Filter logic
  const filteredJobs = JOBS.filter((job) => {
    const titleQuery = searchTitle.toLowerCase().trim();
    const locQuery = searchLocation.toLowerCase().trim();

    const matchesTitle =
      !titleQuery ||
      titleQuery === "jobs hiring" ||
      job.title.toLowerCase().includes(titleQuery) ||
      job.company.toLowerCase().includes(titleQuery) ||
      job.matchedSkills.some((s) => s.toLowerCase().includes(titleQuery));

    const matchesLoc =
      !locQuery || job.location.toLowerCase().includes(locQuery);

    if (!matchesTitle || !matchesLoc) return false;

    if (activeFilters.includes("Remote only") && job.workplace !== "Remote") return false;
    if (activeFilters.includes("Job type") && job.type !== "Full-time") return false;
    if (activeFilters.includes("Match score (80%+)") && job.match < 80) return false;

    return true;
  });

  const selected = JOBS.find((j) => j.id === selectedId) || filteredJobs[0] || JOBS[0];
  const isSelectedSaved = savedJobs.includes(selected.id);
  const isSelectedApplied = appliedJobs.includes(selected.id);

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-[#12142B] font-sans antialiased">
      {/* Toast Notification */}
      {showToast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 bg-[#12142B] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10"
        >
          <div className="w-8 h-8 rounded-full bg-[#00BFA5]/20 flex items-center justify-center text-[#00BFA5]">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-sm font-bold">Applied with Copilot!</p>
            <p className="text-xs text-gray-300">Your AI-tailored resume was submitted to {selected.company}.</p>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E7E9F5] shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight text-[#12142B] no-underline">
            <div className="w-8 h-8 rounded-lg bg-[#3D5AFE] flex items-center justify-center text-white font-bold text-sm shadow-sm">
              <Rocket size={18} />
            </div>
            <span>AI Career <span className="text-[#3D5AFE]">Copilot</span></span>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5B5F79]">
            <Link to="/dashboard" className="hover:text-[#12142B] transition-colors no-underline">Dashboard</Link>
            <Link to="/jobs" className="text-[#3D5AFE] font-bold border-b-2 border-[#3D5AFE] py-5 no-underline">Job Matches</Link>
            <Link to="/resume" className="hover:text-[#12142B] transition-colors no-underline">Resume</Link>
            <Link to="/interview" className="hover:text-[#12142B] transition-colors no-underline">Interview Prep</Link>
            <Link to="/skills" className="hover:text-[#12142B] transition-colors no-underline">Skill Path</Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-[#3D5AFE] hover:text-[#2D3FBF] no-underline">
              Sign in
            </Link>
            <Link
              to="/signup"
              className="bg-[#3D5AFE] hover:bg-[#2D3FBF] text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-full transition-all no-underline shadow-sm hover:shadow"
            >
              For Recruiters
            </Link>
          </div>
        </div>
      </header>

      {/* Hero / Search Section */}
      <section className="bg-white border-b border-[#E7E9F5] py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Combined Search Card */}
          <div
            role="search"
            className="bg-white rounded-2xl border-2 border-[#E7E9F5] hover:border-[#3D5AFE]/40 focus-within:border-[#3D5AFE] shadow-lg shadow-[#3D5AFE]/5 p-2 flex flex-col md:flex-row items-center gap-2 transition-all"
          >
            {/* Title / Keywords Input */}
            <div className="flex items-center gap-3 flex-1 px-3 py-2 w-full">
              <Search size={20} className="text-[#5B5F79] shrink-0" />
              <input
                role="combobox"
                aria-label="Search jobs by title, skills, or company"
                aria-autocomplete="list"
                aria-expanded="false"
                aria-controls={titleSuggestionsId}
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                placeholder='Job title, skills, or "jobs hiring"'
                className="w-full outline-none text-sm text-[#12142B] font-semibold placeholder:text-gray-400 bg-transparent"
              />
              {searchTitle && (
                <button
                  onClick={() => setSearchTitle("")}
                  className="text-gray-400 hover:text-gray-600 p-1 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Vertical Divider (Desktop) */}
            <div className="hidden md:block w-px h-8 bg-[#E7E9F5]" />

            {/* Location Input */}
            <div className="flex items-center gap-3 flex-1 px-3 py-2 w-full border-t md:border-t-0 border-[#E7E9F5]">
              <MapPin size={20} className="text-[#5B5F79] shrink-0" />
              <input
                role="combobox"
                aria-label="Job location"
                aria-autocomplete="list"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder='City, state, zip code, or "remote"'
                className="w-full outline-none text-sm text-[#12142B] font-semibold placeholder:text-gray-400 bg-transparent"
              />
              {searchLocation && (
                <button
                  onClick={() => setSearchLocation("")}
                  className="text-gray-400 hover:text-gray-600 p-1 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Search Button */}
            <button
              onClick={() => {}}
              className="w-full md:w-auto bg-[#3D5AFE] hover:bg-[#2D3FBF] text-white font-bold text-sm px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-98 shrink-0 cursor-pointer"
            >
              Find matches
            </button>
          </div>

          {/* Tip Banner (Indeed Style) */}
          {showTip && (
            <div className="bg-[#ECF3FE] border border-[#D2E3FC] text-[#1a73e8] rounded-2xl px-4 py-3 mt-4 flex items-center justify-between gap-3 text-xs sm:text-sm font-medium">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#1a73e8] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  i
                </div>
                <span>
                  <strong>Tip:</strong> Enter your target role or missing skills in the search box to get personalized AI compatibility scores.
                </span>
              </div>
              <button
                onClick={() => setShowTip(false)}
                className="text-[#1a73e8] hover:bg-[#D2E3FC] p-1.5 rounded-lg transition-colors shrink-0"
                aria-label="Dismiss tip"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Filter Pills */}
          <div role="group" aria-label="Filter jobs" className="flex flex-wrap items-center gap-2 mt-4">
            {FILTERS.map((f) => {
              const active = activeFilters.includes(f);
              return (
                <button
                  key={f}
                  aria-pressed={active}
                  onClick={() => toggleFilter(f)}
                  className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border transition-all cursor-pointer ${
                    active
                      ? "bg-[#3D5AFE] border-[#3D5AFE] text-white shadow-sm"
                      : "bg-white border-[#E7E9F5] text-[#5B5F79] hover:border-[#3D5AFE] hover:text-[#3D5AFE]"
                  }`}
                >
                  {f} {active && "✓"}
                </button>
              );
            })}

            {(activeFilters.length > 0 || searchLocation || (searchTitle && searchTitle !== "jobs hiring")) && (
              <button
                onClick={() => {
                  setActiveFilters([]);
                  setSearchTitle("jobs hiring");
                  setSearchLocation("");
                }}
                className="text-xs font-bold text-[#3D5AFE] hover:underline ml-2"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Results Split View */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Count & Sort Subheader */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E7E9F5]">
          <div className="text-xs sm:text-sm text-[#5B5F79] font-medium">
            <span className="font-bold text-[#12142B]">{filteredJobs.length}</span> jobs matching your profile
          </div>
          <div className="text-xs sm:text-sm text-[#5B5F79] flex items-center gap-1 font-medium">
            <span>Sort by:</span>
            <span className="font-bold text-[#3D5AFE]">relevance</span>
            <span>-</span>
            <span className="hover:text-[#12142B] cursor-pointer">date</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div aria-live="polite" className="sr-only">
            {`Showing ${filteredJobs.length} job matches`}
          </div>

          {/* Left Column: Job Cards List (5 / 12 cols = 41% width) */}
          <div className="lg:col-span-5 flex flex-col gap-4 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-[#E7E9F5] text-center">
                <p className="text-base font-bold text-[#12142B]">No jobs match your search criteria</p>
                <p className="text-xs text-[#5B5F79] mt-1">Try clearing filters or adjusting your location.</p>
                <button
                  onClick={() => {
                    setActiveFilters([]);
                    setSearchTitle("jobs hiring");
                    setSearchLocation("");
                  }}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-[#3D5AFE] text-white text-xs font-bold"
                >
                  Reset Search
                </button>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isSelected = job.id === selected.id;
                const isBookmarked = savedJobs.includes(job.id);
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedId(job.id)}
                    className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer relative ${
                      isSelected
                        ? "border-2 border-[#3D5AFE] shadow-md bg-[#F5F8FF]"
                        : "border-[#E7E9F5] hover:border-[#3D5AFE]/50 hover:shadow-sm"
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-white px-3 py-1 rounded-full bg-gradient-to-r from-[#3D5AFE] to-[#00BFA5] shadow-xs">
                        {job.match}% Match
                      </span>
                      <button
                        type="button"
                        aria-label={isBookmarked ? "Remove saved job" : "Save job"}
                        onClick={(e) => toggleBookmark(e, job.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isBookmarked
                            ? "text-[#3D5AFE] bg-[#3D5AFE]/10"
                            : "text-gray-400 hover:text-[#3D5AFE] hover:bg-gray-100"
                        }`}
                      >
                        <Bookmark size={18} fill={isBookmarked ? "#3D5AFE" : "none"} />
                      </button>
                    </div>

                    {/* Job Title & Company */}
                    <h3 className="font-extrabold text-lg leading-tight text-[#12142B] group-hover:text-[#3D5AFE]">
                      {job.title}
                    </h3>
                    <p className="text-[#3D5AFE] font-semibold text-sm mt-1 hover:underline">
                      {job.company}
                    </p>
                    <p className="text-[#5B5F79] text-xs mt-0.5">{job.location}</p>

                    {/* Salary Badge */}
                    <div className="mt-2.5">
                      <span className="inline-block bg-[#F3F4F6] text-[#12142B] text-xs font-bold px-2.5 py-1 rounded-md">
                        {job.salary}
                      </span>
                    </div>

                    {/* AI Reason Chip */}
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1 bg-[#EEF2FF] text-[#2D3FBF] border border-[#C7D2FE] text-xs font-semibold px-3 py-1 rounded-full">
                        ✦ {job.reason}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Sticky Detail Panel (7 / 12 cols = 59% width) */}
          <div className="lg:col-span-7">
            {selected ? (
              <div className="bg-white rounded-2xl border border-[#E7E9F5] shadow-sm p-6 sm:p-8 sticky top-20 max-h-[calc(100vh-110px)] overflow-y-auto">
                {/* Title & Metadata */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#12142B] leading-tight">
                      {selected.title}
                    </h1>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="inline-flex items-center gap-1 text-[#3D5AFE] font-bold text-base mt-1.5 hover:underline"
                    >
                      {selected.company} <ExternalLink size={15} />
                    </a>
                    <p className="text-[#5B5F79] text-sm mt-1">
                      {selected.location} • <span className="font-medium">{selected.posted}</span>
                    </p>
                    <p className="font-extrabold text-lg text-[#12142B] mt-1.5">
                      {selected.salary}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold text-white px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#3D5AFE] to-[#00BFA5] shadow-sm shrink-0">
                    {selected.match}% AI Match
                  </span>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3 mt-6">
                  <button
                    onClick={() => handleApply(selected.id)}
                    disabled={isSelectedApplied}
                    className={`font-bold px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                      isSelectedApplied
                        ? "bg-[#00BFA5] text-white cursor-default"
                        : "bg-[#3D5AFE] hover:bg-[#2D3FBF] text-white hover:shadow-lg active:scale-98"
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
                    className={`flex items-center gap-2 border font-semibold px-4 py-3 rounded-xl transition-all cursor-pointer ${
                      isSelectedSaved
                        ? "bg-[#3D5AFE]/10 border-[#3D5AFE] text-[#3D5AFE]"
                        : "border-[#E7E9F5] text-[#12142B] hover:border-[#3D5AFE] hover:text-[#3D5AFE]"
                    }`}
                  >
                    <Bookmark size={18} fill={isSelectedSaved ? "#3D5AFE" : "none"} />
                    {isSelectedSaved ? "Saved" : "Save"}
                  </button>

                  <button
                    onClick={() => {}}
                    className="p-3 border border-[#E7E9F5] rounded-xl text-gray-500 hover:text-[#3D5AFE] hover:border-[#3D5AFE] transition-colors"
                    aria-label="Share job"
                  >
                    <Share2 size={18} />
                  </button>
                </div>

                <hr className="my-6 border-[#E7E9F5]" />

                {/* Job Details Section */}
                <h2 className="font-extrabold text-lg text-[#12142B] mb-4">Job details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  <div className="bg-[#F7F8FC] p-3.5 rounded-xl border border-[#E7E9F5] flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#3D5AFE]/10 text-[#3D5AFE]">
                      <DollarSign size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#5B5F79] font-bold uppercase tracking-wider">Pay</p>
                      <p className="text-xs sm:text-sm font-bold text-[#12142B] mt-0.5">{selected.salary}</p>
                    </div>
                  </div>

                  <div className="bg-[#F7F8FC] p-3.5 rounded-xl border border-[#E7E9F5] flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#3D5AFE]/10 text-[#3D5AFE]">
                      <Briefcase size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#5B5F79] font-bold uppercase tracking-wider">Job type</p>
                      <p className="text-xs sm:text-sm font-bold text-[#12142B] mt-0.5">{selected.type} ({selected.workplace})</p>
                    </div>
                  </div>

                  <div className="bg-[#F7F8FC] p-3.5 rounded-xl border border-[#E7E9F5] flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#3D5AFE]/10 text-[#3D5AFE]">
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#5B5F79] font-bold uppercase tracking-wider">Experience</p>
                      <p className="text-xs sm:text-sm font-bold text-[#12142B] mt-0.5">{selected.level}</p>
                    </div>
                  </div>
                </div>

                {/* Skills Analysis */}
                <div className="mb-6">
                  <h3 className="font-extrabold text-sm text-[#12142B] mb-2.5">Skills Compatibility</h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.matchedSkills.map((s, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
                        <Check size={13} className="text-emerald-600" /> {s}
                      </span>
                    ))}
                    {selected.missingSkills.map((s, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 text-gray-500 font-medium text-xs border border-gray-200">
                        • Missing: {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Why you're a fit AI section */}
                <div className="bg-[#F0F4FF] border border-[#3D5AFE]/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-[#3D5AFE] flex items-center justify-center text-white">
                      <Sparkles size={16} />
                    </div>
                    <h3 className="font-extrabold text-base text-[#12142B]">Why you're a fit</h3>
                  </div>
                  <ul className="space-y-2 mt-3" style={{ listStyle: "none" }}>
                    {selected.fitReasons.map((r, i) => (
                      <li key={i} className="text-xs sm:text-sm text-[#3D4160] font-medium flex items-start gap-2.5">
                        <span className="text-[#3D5AFE] font-bold text-base leading-none mt-0.5">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
