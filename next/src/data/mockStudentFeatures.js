// ═══════════════════════════════════════════════════
// MOCK DATA FOR ADVANCED STUDENT FEATURES
// ═══════════════════════════════════════════════════

// ── PLACEMENT READINESS SCORE ──
export const mockReadinessData = {
    overallScore: 72,
    breakdown: {
        skills: 78,
        resume: 65,
        practice: 70,
        projects: 75,
    },
    suggestions: [
        { area: 'Resume', suggestion: 'Add quantifiable achievements to your work experience section', priority: 'high' },
        { area: 'Skills', suggestion: 'Learn System Design fundamentals — required by 80% of target companies', priority: 'high' },
        { area: 'Practice', suggestion: 'Solve 5 more medium-level DSA problems this week', priority: 'medium' },
        { area: 'Projects', suggestion: 'Deploy your portfolio project and add a live demo link', priority: 'medium' },
        { area: 'Resume', suggestion: 'Include relevant coursework and certifications', priority: 'low' },
        { area: 'Skills', suggestion: 'Get hands-on with Docker and CI/CD pipelines', priority: 'low' },
    ],
};

// ── COURSE RECOMMENDATIONS ──
export const mockCourseLibrary = [
    { id: 'c1', title: 'System Design Interview', platform: 'Udemy', instructor: 'Alex Xu', rating: 4.8, ratingsCount: 12400, duration: '16 hours', price: '₹449', difficulty: 'intermediate', category: 'System Design', url: 'https://udemy.com', skillGap: 'System Design' },
    { id: 'c2', title: 'Data Structures & Algorithms Masterclass', platform: 'Coursera', instructor: 'Stanford Online', rating: 4.9, ratingsCount: 45000, duration: '40 hours', price: 'Free', difficulty: 'intermediate', category: 'DSA', url: 'https://coursera.org', skillGap: 'DSA' },
    { id: 'c3', title: 'Advanced React & Next.js', platform: 'Udemy', instructor: 'Maximilian Schwarzmüller', rating: 4.7, ratingsCount: 32000, duration: '25 hours', price: '₹499', difficulty: 'advanced', category: 'Frontend', url: 'https://udemy.com', skillGap: 'React' },
    { id: 'c4', title: 'AWS Cloud Practitioner', platform: 'Coursera', instructor: 'AWS', rating: 4.6, ratingsCount: 18000, duration: '20 hours', price: 'Free', difficulty: 'beginner', category: 'Cloud', url: 'https://coursera.org', skillGap: 'Cloud Computing' },
    { id: 'c5', title: 'Docker & Kubernetes: The Practical Guide', platform: 'Udemy', instructor: 'Maximilian Schwarzmüller', rating: 4.8, ratingsCount: 28000, duration: '24 hours', price: '₹399', difficulty: 'intermediate', category: 'DevOps', url: 'https://udemy.com', skillGap: 'DevOps' },
    { id: 'c6', title: 'Machine Learning Specialization', platform: 'Coursera', instructor: 'Andrew Ng', rating: 4.9, ratingsCount: 120000, duration: '60 hours', price: 'Free', difficulty: 'beginner', category: 'ML/AI', url: 'https://coursera.org', skillGap: 'Machine Learning' },
    { id: 'c7', title: 'SQL for Data Science', platform: 'Udemy', instructor: 'Jose Portilla', rating: 4.5, ratingsCount: 22000, duration: '12 hours', price: '₹349', difficulty: 'beginner', category: 'Database', url: 'https://udemy.com', skillGap: 'SQL' },
    { id: 'c8', title: 'Node.js - The Complete Guide', platform: 'Udemy', instructor: 'Maximilian Schwarzmüller', rating: 4.7, ratingsCount: 41000, duration: '36 hours', price: '₹499', difficulty: 'intermediate', category: 'Backend', url: 'https://udemy.com', skillGap: 'Node.js' },
    { id: 'c9', title: 'Communication Skills for Engineers', platform: 'LinkedIn Learning', instructor: 'Brenda Bailey-Hughes', rating: 4.4, ratingsCount: 8500, duration: '4 hours', price: '₹999/mo', difficulty: 'beginner', category: 'Soft Skills', url: 'https://linkedin.com/learning', skillGap: 'Communication' },
    { id: 'c10', title: 'Git & GitHub Masterclass', platform: 'Udemy', instructor: 'Jason Taylor', rating: 4.6, ratingsCount: 15000, duration: '8 hours', price: '₹299', difficulty: 'beginner', category: 'Tools', url: 'https://udemy.com', skillGap: 'Git' },
];

// ── APPLICATION TRACKER ──
export const mockApplications = [
    {
        id: 'app1',
        company: 'Google',
        role: 'Software Engineer Intern',
        status: 'shortlisted',
        appliedDate: '2026-02-15',
        package: '₹18 LPA',
        location: 'Bangalore',
        matchScore: 82,
        interviewRounds: [
            { round: 1, type: 'Online Assessment', date: '2026-02-20', status: 'passed', feedback: 'Solved 3/4 problems' },
            { round: 2, type: 'Technical Interview', date: '2026-03-01', status: 'scheduled', feedback: '' },
        ],
        notes: 'Strong focus on system design. Prepare distributed systems concepts.',
    },
    {
        id: 'app2',
        company: 'Microsoft',
        role: 'Full Stack Developer',
        status: 'applied',
        appliedDate: '2026-02-20',
        package: '₹22 LPA',
        location: 'Hyderabad',
        matchScore: 74,
        interviewRounds: [],
        notes: 'Applied through campus placement portal.',
    },
    {
        id: 'app3',
        company: 'Flipkart',
        role: 'Backend Engineer',
        status: 'interview',
        appliedDate: '2026-02-10',
        package: '₹16 LPA',
        location: 'Bangalore',
        matchScore: 68,
        interviewRounds: [
            { round: 1, type: 'Online Assessment', date: '2026-02-14', status: 'passed', feedback: 'Good performance in DSA round' },
            { round: 2, type: 'Technical Interview 1', date: '2026-02-22', status: 'passed', feedback: 'Strong coding fundamentals' },
            { round: 3, type: 'Technical Interview 2', date: '2026-03-05', status: 'upcoming', feedback: '' },
        ],
        notes: 'Focus on Java and microservices. Expect system design questions in round 3.',
    },
    {
        id: 'app4',
        company: 'Razorpay',
        role: 'Frontend Developer',
        status: 'rejected',
        appliedDate: '2026-01-25',
        package: '₹14 LPA',
        location: 'Remote',
        matchScore: 55,
        interviewRounds: [
            { round: 1, type: 'Online Assessment', date: '2026-01-30', status: 'passed', feedback: '' },
            { round: 2, type: 'Technical Interview', date: '2026-02-05', status: 'failed', feedback: 'Need stronger React internals knowledge' },
        ],
        notes: 'Feedback: Improve understanding of React reconciliation and hooks.',
    },
    {
        id: 'app5',
        company: 'Amazon',
        role: 'SDE-1',
        status: 'offered',
        appliedDate: '2026-01-10',
        package: '₹28 LPA',
        location: 'Bangalore',
        matchScore: 88,
        interviewRounds: [
            { round: 1, type: 'Online Assessment', date: '2026-01-15', status: 'passed', feedback: 'All test cases passed' },
            { round: 2, type: 'Technical Interview 1', date: '2026-01-22', status: 'passed', feedback: 'Excellent problem solving' },
            { round: 3, type: 'Technical Interview 2', date: '2026-01-28', status: 'passed', feedback: 'Strong system design' },
            { round: 4, type: 'Bar Raiser', date: '2026-02-02', status: 'passed', feedback: 'Great leadership principles alignment' },
        ],
        notes: 'Offer received! Deadline to accept: March 15, 2026.',
    },
];

// ── REPORT DATA BUILDER ──
export function buildStudentReport(readiness, applications) {
    const totalApps = applications.length;
    const offered = applications.filter(a => a.status === 'offered').length;
    const shortlisted = applications.filter(a => a.status === 'shortlisted').length;
    const rejected = applications.filter(a => a.status === 'rejected').length;

    return {
        generatedAt: new Date().toISOString(),
        studentName: 'Alex Student',
        email: 'alex@university.edu',
        readinessScore: readiness.overallScore,
        readinessBreakdown: readiness.breakdown,
        improvementSuggestions: readiness.suggestions,
        applicationSummary: {
            total: totalApps,
            offered,
            shortlisted,
            rejected,
            inProgress: totalApps - offered - rejected,
        },
        topSkillGaps: readiness.suggestions.filter(s => s.priority === 'high').map(s => s.suggestion),
    };
}
