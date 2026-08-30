export const batchStats = {
    totalStudents: 1247,
    placedStudents: 843,
    placementRate: 67.6,
    avgPackage: '₹12.4 LPA',
    highestPackage: '₹42 LPA',
    companiesVisited: 86,
    offersExtended: 1024,
    ongoingDrives: 12,
};

export const topSkills = [
    { skill: 'JavaScript / TypeScript', count: 834, percentage: 67 },
    { skill: 'Python', count: 756, percentage: 61 },
    { skill: 'React / Next.js', count: 623, percentage: 50 },
    { skill: 'Java', count: 589, percentage: 47 },
    { skill: 'Machine Learning', count: 412, percentage: 33 },
    { skill: 'SQL / Databases', count: 698, percentage: 56 },
    { skill: 'Cloud (AWS/GCP/Azure)', count: 345, percentage: 28 },
    { skill: 'Docker / DevOps', count: 278, percentage: 22 },
];

export const skillGaps = [
    { skill: 'System Design', gap: 72, description: '72% students lack system design knowledge' },
    { skill: 'Cloud Architecture', gap: 68, description: '68% unfamiliar with cloud deployment' },
    { skill: 'Testing & QA', gap: 65, description: '65% have minimal testing experience' },
    { skill: 'CI/CD Pipelines', gap: 61, description: '61% haven\'t set up CI/CD workflows' },
    { skill: 'Soft Skills', gap: 55, description: '55% need communication training' },
];

export const placementTrend = [
    { month: 'Aug', placed: 23, offers: 31 },
    { month: 'Sep', placed: 67, offers: 89 },
    { month: 'Oct', placed: 145, offers: 198 },
    { month: 'Nov', placed: 234, offers: 312 },
    { month: 'Dec', placed: 389, offers: 467 },
    { month: 'Jan', placed: 567, offers: 645 },
    { month: 'Feb', placed: 743, offers: 878 },
    { month: 'Mar', placed: 843, offers: 1024 },
];

export const visitingCompanies = [
    {
        id: 'google',
        name: 'Google',
        role: 'SDE-1',
        requirements: ['DSA', 'System Design', 'React', 'Go/Python', 'Problem Solving'],
        package: '₹32 LPA',
    },
    {
        id: 'microsoft',
        name: 'Microsoft',
        role: 'SDE Intern',
        requirements: ['C++/Java', 'Data Structures', 'Azure', 'TypeScript', 'Teamwork'],
        package: '₹25 LPA',
    },
    {
        id: 'amazon',
        name: 'Amazon',
        role: 'SDE-1',
        requirements: ['Java', 'AWS', 'Distributed Systems', 'Leadership Principles', 'DSA'],
        package: '₹28 LPA',
    },
    {
        id: 'flipkart',
        name: 'Flipkart',
        role: 'Backend Engineer',
        requirements: ['Java/Scala', 'Microservices', 'Kafka', 'System Design', 'SQL'],
        package: '₹22 LPA',
    },
    {
        id: 'razorpay',
        name: 'Razorpay',
        role: 'Full Stack Dev',
        requirements: ['React', 'Go', 'PostgreSQL', 'Docker', 'Fintech Domain'],
        package: '₹18 LPA',
    },
];

export const topStudentsForCompany = {
    google: [
        { rank: 1, id: 'STU-4821', matchScore: 94, strengths: 'DSA (2000+ rating), React expert, Go projects', cgpa: 8.2 },
        { rank: 2, id: 'STU-7234', matchScore: 91, strengths: 'System design expertise, Python/Go, open-source contributor', cgpa: 7.8 },
        { rank: 3, id: 'STU-1567', matchScore: 89, strengths: 'ML + Backend, TensorFlow projects, published paper', cgpa: 9.1 },
        { rank: 4, id: 'STU-9043', matchScore: 87, strengths: 'Full-stack, React/Next.js, competitive programming', cgpa: 8.5 },
        { rank: 5, id: 'STU-3298', matchScore: 85, strengths: 'Cloud architecture, AWS certified, team leader', cgpa: 7.5 },
        { rank: 6, id: 'STU-6712', matchScore: 83, strengths: 'Strong DSA, Java expert, hackathon winner', cgpa: 8.8 },
        { rank: 7, id: 'STU-2145', matchScore: 80, strengths: 'React + Node.js, 5 production apps', cgpa: 7.2 },
        { rank: 8, id: 'STU-8876', matchScore: 78, strengths: 'Research background, NLP projects, Python', cgpa: 9.4 },
    ],
    microsoft: [
        { rank: 1, id: 'STU-3298', matchScore: 96, strengths: 'Azure certified, C++ expert, accessibility projects', cgpa: 7.5 },
        { rank: 2, id: 'STU-6712', matchScore: 93, strengths: 'Java/C#, TypeScript master, team player', cgpa: 8.8 },
        { rank: 3, id: 'STU-9043', matchScore: 90, strengths: 'Full-stack TypeScript, testing culture advocate', cgpa: 8.5 },
        { rank: 4, id: 'STU-4821', matchScore: 88, strengths: 'Strong DSA, React, collaborative projects', cgpa: 8.2 },
        { rank: 5, id: 'STU-1567', matchScore: 85, strengths: 'Research skills, systematic thinker', cgpa: 9.1 },
        { rank: 6, id: 'STU-7234', matchScore: 82, strengths: 'System design, open-source contributions', cgpa: 7.8 },
        { rank: 7, id: 'STU-8876', matchScore: 79, strengths: 'Academic excellence, Python/Java', cgpa: 9.4 },
        { rank: 8, id: 'STU-2145', matchScore: 76, strengths: 'Practical experience, full-stack projects', cgpa: 7.2 },
    ],
    amazon: [
        { rank: 1, id: 'STU-6712', matchScore: 95, strengths: 'Java expert, AWS experience, leadership qualities', cgpa: 8.8 },
        { rank: 2, id: 'STU-7234', matchScore: 92, strengths: 'Distributed systems, system design, ownership mindset', cgpa: 7.8 },
        { rank: 3, id: 'STU-4821', matchScore: 89, strengths: 'Strong DSA, problem solver, bias for action', cgpa: 8.2 },
        { rank: 4, id: 'STU-9043', matchScore: 86, strengths: 'Full-stack, customer-focused projects', cgpa: 8.5 },
        { rank: 5, id: 'STU-3298', matchScore: 84, strengths: 'AWS certified, cloud architecture experience', cgpa: 7.5 },
        { rank: 6, id: 'STU-1567', matchScore: 81, strengths: 'ML skills, inventive projects', cgpa: 9.1 },
        { rank: 7, id: 'STU-8876', matchScore: 78, strengths: 'Academic rigor, data-driven approach', cgpa: 9.4 },
        { rank: 8, id: 'STU-2145', matchScore: 75, strengths: 'Practical builder, multiple launched projects', cgpa: 7.2 },
    ],
    flipkart: [
        { rank: 1, id: 'STU-7234', matchScore: 94, strengths: 'Microservices expert, Kafka experience, Java/Scala', cgpa: 7.8 },
        { rank: 2, id: 'STU-6712', matchScore: 91, strengths: 'Java master, SQL optimization, system thinker', cgpa: 8.8 },
        { rank: 3, id: 'STU-4821', matchScore: 87, strengths: 'Backend + frontend, scalable system design', cgpa: 8.2 },
        { rank: 4, id: 'STU-9043', matchScore: 84, strengths: 'Full-stack, e-commerce project experience', cgpa: 8.5 },
        { rank: 5, id: 'STU-3298', matchScore: 81, strengths: 'Cloud deployment, Docker/K8s', cgpa: 7.5 },
        { rank: 6, id: 'STU-1567', matchScore: 78, strengths: 'Data pipeline experience, analytical skills', cgpa: 9.1 },
        { rank: 7, id: 'STU-2145', matchScore: 75, strengths: 'Node.js, practical e-commerce builds', cgpa: 7.2 },
        { rank: 8, id: 'STU-8876', matchScore: 72, strengths: 'Strong academics, ML for recommendations', cgpa: 9.4 },
    ],
    razorpay: [
        { rank: 1, id: 'STU-9043', matchScore: 93, strengths: 'React + Go, PostgreSQL, fintech interest', cgpa: 8.5 },
        { rank: 2, id: 'STU-4821', matchScore: 90, strengths: 'Full-stack, React expert, payment integrations', cgpa: 8.2 },
        { rank: 3, id: 'STU-2145', matchScore: 87, strengths: 'Node.js, Docker, production deployment experience', cgpa: 7.2 },
        { rank: 4, id: 'STU-7234', matchScore: 84, strengths: 'Go experience, system design, security-minded', cgpa: 7.8 },
        { rank: 5, id: 'STU-3298', matchScore: 81, strengths: 'Cloud architecture, DevOps culture', cgpa: 7.5 },
        { rank: 6, id: 'STU-6712', matchScore: 78, strengths: 'Java backend, SQL, team collaboration', cgpa: 8.8 },
        { rank: 7, id: 'STU-1567', matchScore: 74, strengths: 'Analytical skills, data-driven development', cgpa: 9.1 },
        { rank: 8, id: 'STU-8876', matchScore: 71, strengths: 'Academic excellence, Python scripting', cgpa: 9.4 },
    ],
};

export const skillDistribution = [
    { name: 'JavaScript', value: 834, fill: '#6366f1' },
    { name: 'Python', value: 756, fill: '#8b5cf6' },
    { name: 'React', value: 623, fill: '#a78bfa' },
    { name: 'Java', value: 589, fill: '#c4b5fd' },
    { name: 'SQL', value: 698, fill: '#818cf8' },
    { name: 'Cloud', value: 345, fill: '#7c3aed' },
    { name: 'ML/AI', value: 412, fill: '#5b21b6' },
    { name: 'DevOps', value: 278, fill: '#4c1d95' },
];
