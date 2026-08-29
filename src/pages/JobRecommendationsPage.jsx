import { useState } from 'react';
import {
  Search, MapPin, Briefcase, DollarSign, Bookmark, ExternalLink,
  Filter, Grid3X3, List, ChevronDown, Clock, X, SlidersHorizontal
} from 'lucide-react';
import AppShell from '../components/AppShell';

const allJobs = [
  {
    id: 1, role: 'Backend Engineer', company: 'Google', location: 'Bangalore, India',
    match: 92, salary: '₹12–18 LPA', type: 'Hybrid', posted: '2 days ago',
    color: '#4285F4', logo: 'G',
    matchedSkills: ['Python', 'SQL', 'REST APIs', 'Git'],
    missingSkills: ['Docker', 'Kubernetes'],
  },
  {
    id: 2, role: 'Data Analyst', company: 'Amazon', location: 'Hyderabad, India',
    match: 87, salary: '₹8–12 LPA', type: 'Onsite', posted: '1 day ago',
    color: '#FF9900', logo: 'A',
    matchedSkills: ['Python', 'SQL', 'Git'],
    missingSkills: ['Tableau', 'AWS'],
  },
  {
    id: 3, role: 'ML Engineer', company: 'Microsoft', location: 'Noida, India',
    match: 84, salary: '₹15–22 LPA', type: 'Remote', posted: '3 days ago',
    color: '#00A4EF', logo: 'M',
    matchedSkills: ['Python', 'SQL', 'Git'],
    missingSkills: ['TensorFlow', 'Docker', 'AWS'],
  },
  {
    id: 4, role: 'Full Stack Developer', company: 'Flipkart', location: 'Bangalore, India',
    match: 81, salary: '₹10–15 LPA', type: 'Hybrid', posted: '5 days ago',
    color: '#2874F0', logo: 'F',
    matchedSkills: ['React', 'Node.js', 'JavaScript', 'MongoDB'],
    missingSkills: ['Docker'],
  },
  {
    id: 5, role: 'DevOps Engineer', company: 'Razorpay', location: 'Remote',
    match: 78, salary: '₹12–16 LPA', type: 'Remote', posted: '1 week ago',
    color: '#3395FF', logo: 'R',
    matchedSkills: ['Python', 'Git'],
    missingSkills: ['Docker', 'Kubernetes', 'AWS', 'Terraform'],
  },
  {
    id: 6, role: 'Frontend Developer', company: 'Swiggy', location: 'Bangalore, India',
    match: 75, salary: '₹8–14 LPA', type: 'Onsite', posted: '4 days ago',
    color: '#FC8019', logo: 'S',
    matchedSkills: ['React', 'JavaScript', 'HTML/CSS', 'TypeScript'],
    missingSkills: ['Next.js'],
  },
];

const roleFilters = ['All', 'Backend', 'Frontend', 'Data', 'ML', 'DevOps', 'Full Stack'];
const locationFilters = ['All Locations', 'Bangalore', 'Hyderabad', 'Noida', 'Remote'];
const typeFilters = ['All', 'Remote', 'Hybrid', 'Onsite'];

export default function JobRecommendationsPage() {
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('match');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedType, setSelectedType] = useState('All');
  const [salaryRange, setSalaryRange] = useState([0, 30]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = allJobs
    .filter(job => {
      if (selectedRole !== 'All' && !job.role.toLowerCase().includes(selectedRole.toLowerCase())) return false;
      if (selectedLocation !== 'All Locations' && !job.location.includes(selectedLocation)) return false;
      if (selectedType !== 'All' && job.type !== selectedType) return false;
      if (searchQuery && !job.role.toLowerCase().includes(searchQuery.toLowerCase()) && !job.company.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'match') return b.match - a.match;
      if (sortBy === 'date') return 0; // keeping original order for demo
      return 0;
    });

  return (
    <AppShell>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy mb-1">Your Job Matches</h1>
          <p className="text-sm text-text-secondary">AI-curated job recommendations based on your skills and preferences.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search roles or companies..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-royal-blue/20 focus:border-royal-blue transition-all"
          />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filter Sidebar — Desktop */}
        <aside className={`hidden lg:block w-[260px] flex-shrink-0`}>
          <div className="card p-5 sticky top-24">
            <h3 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
              <SlidersHorizontal size={16} /> Filters
            </h3>

            {/* Role Type */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">Role Type</label>
              <div className="flex flex-wrap gap-1.5">
                {roleFilters.map(role => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedRole === role ? 'bg-royal-blue text-white' : 'bg-bg-light text-text-secondary hover:bg-gray-200'
                    }`}
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">Location</label>
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={e => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-bg-light border-none text-sm text-navy font-medium appearance-none focus:outline-none cursor-pointer"
                >
                  {locationFilters.map(loc => <option key={loc}>{loc}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
              </div>
            </div>

            {/* Work Type */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">Work Type</label>
              <div className="flex flex-wrap gap-1.5">
                {typeFilters.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedType === type ? 'bg-royal-blue text-white' : 'bg-bg-light text-text-secondary hover:bg-gray-200'
                    }`}
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Salary Range */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">Salary Range (LPA)</label>
              <input
                type="range"
                min={0}
                max={30}
                value={salaryRange[1]}
                onChange={e => setSalaryRange([0, parseInt(e.target.value)])}
                className="w-full accent-royal-blue"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>₹0 LPA</span>
                <span>₹{salaryRange[1]} LPA</span>
              </div>
            </div>

            <button className="btn btn-primary w-full btn-sm">Apply Filters</button>
          </div>
        </aside>

        {/* Mobile Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden fixed bottom-6 right-6 z-30 btn btn-primary shadow-lg"
          style={{ borderRadius: '50%', width: '56px', height: '56px', padding: 0 }}
        >
          <Filter size={22} />
        </button>

        {/* Mobile Filter Drawer */}
        {showFilters && (
          <>
            <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setShowFilters(false)} />
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 max-h-[70vh] overflow-y-auto lg:hidden animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-navy">Filters</h3>
                <button onClick={() => setShowFilters(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} className="text-text-secondary" />
                </button>
              </div>
              {/* Same filter content as desktop */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-2 block">Role Type</label>
                  <div className="flex flex-wrap gap-1.5">
                    {roleFilters.map(role => (
                      <button key={role} onClick={() => setSelectedRole(role)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${selectedRole === role ? 'bg-royal-blue text-white' : 'bg-bg-light text-text-secondary'}`}
                        style={{ border: 'none', cursor: 'pointer' }}>{role}</button>
                    ))}
                  </div>
                </div>
                <button className="btn btn-primary w-full" onClick={() => setShowFilters(false)}>Apply Filters</button>
              </div>
            </div>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Sort Bar */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-text-secondary">
              <span className="font-semibold text-navy">{filteredJobs.length}</span> jobs found
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary hidden sm:block">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="pl-3 pr-8 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-navy font-medium appearance-none focus:outline-none cursor-pointer"
                  >
                    <option value="match">Match %</option>
                    <option value="date">Date Posted</option>
                    <option value="salary">Salary</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                </div>
              </div>
              <div className="flex gap-1 bg-bg-light rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  <List size={16} className={viewMode === 'list' ? 'text-navy' : 'text-text-muted'} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  <Grid3X3 size={16} className={viewMode === 'grid' ? 'text-navy' : 'text-text-muted'} />
                </button>
              </div>
            </div>
          </div>

          {/* Job Cards */}
          <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 gap-4' : 'space-y-4'}>
            {filteredJobs.map(job => (
              <div key={job.id} className="card p-5 hover:shadow-float transition-all cursor-pointer">
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ background: job.color }}
                  >
                    {job.logo}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-base font-bold text-navy">{job.role}</h3>
                        <p className="text-sm text-text-secondary">{job.company}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold flex-shrink-0 ${
                        job.match >= 85 ? 'bg-green-100 text-green-700' :
                        job.match >= 75 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-orange-100 text-accent-orange'
                      }`}>
                        {job.match}% Match
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-text-secondary">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                      <span className="flex items-center gap-1"><DollarSign size={12} /> {job.salary}</span>
                      <span className="flex items-center gap-1"><Briefcase size={12} /> {job.type}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {job.posted}</span>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {job.matchedSkills.map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-green-50 text-green-700 text-[11px] font-medium">
                          {skill}
                        </span>
                      ))}
                      {job.missingSkills.map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-400 text-[11px] font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button className="btn btn-sm btn-primary" style={{ padding: '6px 16px', fontSize: '12px' }}>
                        View Details <ExternalLink size={12} />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-bg-light transition-colors text-text-muted hover:text-royal-blue"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                        aria-label="Save job"
                      >
                        <Bookmark size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <button className="btn btn-outline">
              Load More Jobs
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
