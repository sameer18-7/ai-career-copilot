export const mockGapAnalysis = {
    'Frontend Dev': {
        'Google': {
            gaps: [
                { skill: 'React Performance Optimization', severity: 'high', description: 'Need expertise in React.memo, useMemo, code splitting, and bundle optimization' },
                { skill: 'System Design for Scale', severity: 'high', description: 'Google requires designing systems serving millions of users' },
                { skill: 'Web Vitals & Core Metrics', severity: 'medium', description: 'Deep understanding of LCP, FID, CLS optimization needed' },
                { skill: 'TypeScript Advanced Patterns', severity: 'medium', description: 'Generics, conditional types, and type-safe API patterns' },
                { skill: 'Testing (Unit + E2E)', severity: 'low', description: 'Jest, React Testing Library, and Cypress proficiency expected' },
            ],
            roadmap: [
                { phase: 'Week 1-2', title: 'TypeScript Mastery', description: 'Complete TypeScript advanced patterns course. Practice generics and utility types.', type: 'learn' },
                { phase: 'Week 3-4', title: 'React Deep Dive', description: 'Master React internals: reconciliation, fiber architecture, hooks lifecycle.', type: 'learn' },
                { phase: 'Month 2', title: 'System Design', description: 'Study frontend system design patterns. Build a mini-project at scale.', type: 'project' },
                { phase: 'Month 2-3', title: 'Performance Engineering', description: 'Learn profiling tools, optimize real projects, achieve 90+ Lighthouse scores.', type: 'practice' },
                { phase: 'Month 3', title: 'Testing & CI/CD', description: 'Write comprehensive test suites. Set up automated testing pipelines.', type: 'practice' },
                { phase: 'Month 4', title: 'Mock Interviews', description: 'Practice system design and coding interviews. Build portfolio project.', type: 'milestone' },
            ],
            courses: [
                { title: 'Advanced React Patterns', platform: 'Udemy', instructor: 'Kent C. Dodds', rating: 4.8, url: 'https://udemy.com', duration: '24 hours', price: '₹649' },
                { title: 'TypeScript: The Complete Guide', platform: 'Coursera', instructor: 'Google', rating: 4.7, url: 'https://coursera.org', duration: '40 hours', price: 'Free' },
                { title: 'Frontend System Design', platform: 'Educative', instructor: 'Design Gurus', rating: 4.9, url: 'https://educative.io', duration: '30 hours', price: '₹999' },
                { title: 'Web Performance Fundamentals', platform: 'Frontend Masters', instructor: 'Todd Gardner', rating: 4.6, url: 'https://frontendmasters.com', duration: '6 hours', price: '₹1,500/mo' },
            ],
        },
        'Microsoft': {
            gaps: [
                { skill: 'TypeScript & .NET Integration', severity: 'high', description: 'Microsoft stack requires strong TypeScript and potentially C# knowledge' },
                { skill: 'Accessibility (a11y)', severity: 'high', description: 'Microsoft products require WCAG 2.1 AA compliance' },
                { skill: 'Azure Cloud Services', severity: 'medium', description: 'Familiarity with Azure DevOps and deployment pipelines' },
                { skill: 'Component Library Design', severity: 'medium', description: 'Understanding Fluent UI design system and component architecture' },
            ],
            roadmap: [
                { phase: 'Week 1-2', title: 'TypeScript + C# Basics', description: 'Strengthen TypeScript. Learn C# fundamentals for cross-team collaboration.', type: 'learn' },
                { phase: 'Week 3-4', title: 'Accessibility Deep Dive', description: 'Master ARIA, screen readers, keyboard navigation, and WCAG guidelines.', type: 'learn' },
                { phase: 'Month 2', title: 'Azure & DevOps', description: 'Get Azure fundamentals certification. Learn CI/CD with Azure DevOps.', type: 'project' },
                { phase: 'Month 3', title: 'Portfolio & Interview', description: 'Build an accessible web app. Practice behavioral and technical interviews.', type: 'milestone' },
            ],
            courses: [
                { title: 'Accessibility in JavaScript Apps', platform: 'Egghead', instructor: 'Marcy Sutton', rating: 4.8, url: 'https://egghead.io', duration: '8 hours', price: 'Free' },
                { title: 'Azure Fundamentals AZ-900', platform: 'Microsoft Learn', instructor: 'Microsoft', rating: 4.9, url: 'https://learn.microsoft.com', duration: '20 hours', price: 'Free' },
                { title: 'C# Fundamentals', platform: 'Pluralsight', instructor: 'Scott Allen', rating: 4.7, url: 'https://pluralsight.com', duration: '15 hours', price: '₹1,200/mo' },
            ],
        },
    },
    'Backend Dev': {
        'Google': {
            gaps: [
                { skill: 'Distributed Systems', severity: 'high', description: 'Must understand consensus algorithms, CAP theorem, and distributed databases' },
                { skill: 'Go / C++ Proficiency', severity: 'high', description: 'Google backend services primarily use Go and C++' },
                { skill: 'gRPC & Protocol Buffers', severity: 'medium', description: 'Communication between microservices at Google uses gRPC' },
                { skill: 'Data Structures & Algorithms', severity: 'medium', description: 'Google interviews are heavily DSA-focused at L3-L5 levels' },
            ],
            roadmap: [
                { phase: 'Week 1-2', title: 'Go Language Mastery', description: 'Complete Go tour and build 3 CLI tools. Focus on concurrency patterns.', type: 'learn' },
                { phase: 'Month 1', title: 'DSA Deep Practice', description: 'Solve 200+ problems on LeetCode. Focus on graphs, DP, and trees.', type: 'practice' },
                { phase: 'Month 2', title: 'Distributed Systems', description: 'Study MIT 6.824. Implement Raft consensus algorithm.', type: 'project' },
                { phase: 'Month 3', title: 'System Design + Mock', description: 'Design 10 real systems. Do mock interviews weekly.', type: 'milestone' },
            ],
            courses: [
                { title: 'Go: The Complete Guide', platform: 'Udemy', instructor: 'Stephen Grider', rating: 4.7, url: 'https://udemy.com', duration: '30 hours', price: '₹649' },
                { title: 'Distributed Systems (MIT 6.824)', platform: 'MIT OCW', instructor: 'Robert Morris', rating: 4.9, url: 'https://ocw.mit.edu', duration: '60 hours', price: 'Free' },
                { title: 'Grokking System Design', platform: 'Educative', instructor: 'Design Gurus', rating: 4.8, url: 'https://educative.io', duration: '40 hours', price: '₹999' },
            ],
        },
    },
    'Data Scientist': {
        'Google': {
            gaps: [
                { skill: 'Large-Scale ML Systems', severity: 'high', description: 'Experience with TensorFlow at scale, MLOps, and model serving' },
                { skill: 'Statistical Rigor', severity: 'high', description: 'A/B testing, causal inference, and experimental design expertise' },
                { skill: 'SQL at Scale', severity: 'medium', description: 'Complex analytical queries on petabyte-scale datasets using BigQuery' },
            ],
            roadmap: [
                { phase: 'Week 1-2', title: 'Statistics Refresher', description: 'Review hypothesis testing, bayesian methods, and experimental design.', type: 'learn' },
                { phase: 'Month 1', title: 'TensorFlow & MLOps', description: 'Build end-to-end ML pipeline with TF Extended. Deploy with Vertex AI.', type: 'project' },
                { phase: 'Month 2', title: 'BigQuery & Analytics', description: 'Master BigQuery ML. Build dashboards with real datasets.', type: 'practice' },
                { phase: 'Month 3', title: 'Portfolio & Interviews', description: 'Publish 2 Kaggle notebooks. Practice ML system design interviews.', type: 'milestone' },
            ],
            courses: [
                { title: 'Machine Learning Specialization', platform: 'Coursera', instructor: 'Andrew Ng', rating: 4.9, url: 'https://coursera.org', duration: '80 hours', price: 'Free' },
                { title: 'TensorFlow Developer Certificate', platform: 'Google', instructor: 'Laurence Moroney', rating: 4.8, url: 'https://tensorflow.org', duration: '40 hours', price: 'Free' },
            ],
        },
    },
};

export const defaultGapData = {
    gaps: [
        { skill: 'Domain-Specific Knowledge', severity: 'high', description: 'Research the target company\'s tech stack and build projects using their tools' },
        { skill: 'Communication Skills', severity: 'medium', description: 'Practice articulating technical concepts clearly for interviews' },
        { skill: 'Open Source Contributions', severity: 'low', description: 'Contributing to open source demonstrates collaboration skills' },
    ],
    roadmap: [
        { phase: 'Week 1-2', title: 'Research & Plan', description: 'Study target company culture, interview patterns, and tech requirements.', type: 'learn' },
        { phase: 'Month 1', title: 'Skill Building', description: 'Take relevant courses and build a project using target tech stack.', type: 'project' },
        { phase: 'Month 2', title: 'Practice & Apply', description: 'Do mock interviews and submit applications. Build portfolio.', type: 'milestone' },
    ],
    courses: [
        { title: 'Cracking the Coding Interview', platform: 'Udemy', instructor: 'Various', rating: 4.6, url: 'https://udemy.com', duration: '20 hours', price: '₹499' },
        { title: 'Interview Preparation', platform: 'Coursera', instructor: 'Various', rating: 4.5, url: 'https://coursera.org', duration: '15 hours', price: 'Free' },
    ],
};
