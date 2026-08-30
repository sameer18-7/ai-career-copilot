const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const db = new PrismaClient()

async function main() {
    console.log('Seeding Business + Individuals database...')

    const hashedPassword = await bcrypt.hash('password123', 10)

    // 1. COMPANIES + BUSINESS USERS
    const companiesData = [
        { name: 'TechCorp India', industry: 'Technology', location: 'Bangalore', size: '201-1000', website: 'https://techcorp.in' },
        { name: 'FinEdge Solutions', industry: 'Fintech', location: 'Mumbai', size: '51-200', website: 'https://finedge.io' },
        { name: 'CloudNine Systems', industry: 'Cloud & SaaS', location: 'Hyderabad', size: '51-200', website: 'https://cloudnine.io' },
        { name: 'GrowthHive', industry: 'Growth & Marketing', location: 'Delhi', size: '1-50', website: 'https://growthhive.co' },
        { name: 'DataBridge Analytics', industry: 'Data & AI', location: 'Pune', size: '51-200', website: 'https://databridge.ai' },
    ]

    const companies = []
    for (const c of companiesData) {
        const company = await db.company.upsert({
            where: { name: c.name },
            update: {},
            create: c,
        })
        companies.push(company)

        // Create a business user for each company
        const email = `admin@${c.name.toLowerCase().replace(/\s+/g, '')}.com`
        const user = await db.user.upsert({
            where: { email },
            update: {},
            create: {
                name: `${c.name} Admin`,
                email,
                password: hashedPassword,
                role: 'BUSINESS',
                companyId: company.id,
            },
        })
    }
    console.log(`Seeded ${companies.length} companies`)

    // 2. JOB POSTINGS
    const jobsData = [
        { companyId: companies[0].id, title: 'Senior Software Engineer', location: 'Bangalore', jobType: 'full_time', experienceMin: 3, experienceMax: 7, salaryMin: 1800000, salaryMax: 3000000, skills: ['React', 'Node.js', 'TypeScript', 'AWS'] },
        { companyId: companies[0].id, title: 'DevOps Engineer', location: 'Remote', jobType: 'full_time', experienceMin: 2, experienceMax: 5, salaryMin: 1500000, salaryMax: 2500000, skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'] },
        { companyId: companies[1].id, title: 'Full Stack Developer', location: 'Mumbai', jobType: 'full_time', experienceMin: 2, experienceMax: 6, salaryMin: 1200000, salaryMax: 2200000, skills: ['React', 'Python', 'PostgreSQL'] },
        { companyId: companies[1].id, title: 'Data Analyst', location: 'Mumbai', jobType: 'full_time', experienceMin: 1, experienceMax: 4, salaryMin: 800000, salaryMax: 1400000, skills: ['Python', 'SQL', 'Tableau', 'Excel'] },
        { companyId: companies[2].id, title: 'Cloud Solutions Architect', location: 'Hyderabad', jobType: 'full_time', experienceMin: 5, experienceMax: 10, salaryMin: 2500000, salaryMax: 4500000, skills: ['AWS', 'Azure', 'Terraform', 'Kubernetes'] },
        { companyId: companies[3].id, title: 'Growth Marketing Manager', location: 'Delhi', jobType: 'full_time', experienceMin: 3, experienceMax: 7, salaryMin: 1200000, salaryMax: 2000000, skills: ['SEO', 'Google Ads', 'Analytics', 'Content Strategy'] },
        { companyId: companies[4].id, title: 'ML Engineer', location: 'Pune', jobType: 'full_time', experienceMin: 2, experienceMax: 5, salaryMin: 1500000, salaryMax: 2800000, skills: ['Python', 'TensorFlow', 'MLOps', 'SQL'] },
        { companyId: companies[4].id, title: 'Data Engineer', location: 'Remote', jobType: 'remote', experienceMin: 2, experienceMax: 6, salaryMin: 1400000, salaryMax: 2400000, skills: ['Python', 'Spark', 'Airflow', 'SQL'] },
    ]

    const jobs = []
    for (const j of jobsData) {
        const job = await db.jobPosting.create({ data: j })
        jobs.push(job)
    }
    console.log(`Seeded ${jobs.length} job postings`)

    // 3. INDIVIDUALS (Working Professionals)
    const individualsData = [
        { name: 'Arjun Mehta', email: 'arjun.mehta@email.com', currentRole: 'Software Engineer', currentCompany: 'Wipro', totalExperience: 4, skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'], location: 'Bangalore', headline: 'Full Stack Dev | 4yr exp | Open to opportunities' },
        { name: 'Priya Sharma', email: 'priya.sharma@email.com', currentRole: 'Data Scientist', currentCompany: 'Infosys', totalExperience: 3, skills: ['Python', 'TensorFlow', 'SQL', 'Tableau'], location: 'Pune', headline: 'Data Scientist | ML & Analytics | Looking for AI-first roles' },
        { name: 'Rahul Verma', email: 'rahul.verma@email.com', currentRole: 'DevOps Engineer', currentCompany: 'HCL', totalExperience: 5, skills: ['Docker', 'Kubernetes', 'AWS', 'Jenkins'], location: 'Hyderabad', headline: 'DevOps | 5yr exp | Cloud & Infrastructure' },
        { name: 'Sneha Nair', email: 'sneha.nair@email.com', currentRole: 'Product Manager', currentCompany: 'Freshworks', totalExperience: 6, skills: ['Roadmapping', 'Agile', 'SQL', 'Figma'], location: 'Chennai', headline: 'PM with SaaS background | 6yr exp' },
        { name: 'Vikram Patel', email: 'vikram.patel@email.com', currentRole: 'Cloud Architect', currentCompany: 'TCS', totalExperience: 8, skills: ['AWS', 'Azure', 'Terraform', 'Kubernetes'], location: 'Mumbai', headline: 'Cloud Architect | AWS Certified | Open to senior roles' },
        { name: 'Anjali Reddy', email: 'anjali.reddy@email.com', currentRole: 'Frontend Developer', currentCompany: 'Zoho', totalExperience: 3, skills: ['React', 'TypeScript', 'CSS', 'GraphQL'], location: 'Bangalore', headline: 'Frontend Engineer | React Expert | 3yr exp' },
        { name: 'Deepak Singh', email: 'deepak.singh@email.com', currentRole: 'ML Engineer', currentCompany: 'NVIDIA', totalExperience: 4, skills: ['Python', 'TensorFlow', 'MLOps', 'CUDA'], location: 'Pune', headline: 'ML Engineer | Deep Learning | Open to Work' },
        { name: 'Megha Joshi', email: 'megha.joshi@email.com', currentRole: 'Marketing Manager', currentCompany: 'Razorpay', totalExperience: 5, skills: ['Google Ads', 'SEO', 'Content Strategy', 'Analytics'], location: 'Delhi', headline: 'Growth Marketer | Fintech Background | 5yr exp' },
        { name: 'Karan Gupta', email: 'karan.gupta@email.com', currentRole: 'Backend Engineer', currentCompany: 'PhonePe', totalExperience: 4, skills: ['Python', 'Spark', 'Airflow', 'PostgreSQL'], location: 'Bangalore', headline: 'Backend & Data Eng | Fintech | 4yr exp' },
        { name: 'Sonal Iyer', email: 'sonal.iyer@email.com', currentRole: 'UX Designer', currentCompany: 'Adobe', totalExperience: 5, skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'], location: 'Mumbai', headline: 'UX Designer | Product Design | 5yr exp' },
    ]

    const individuals = []
    for (const ind of individualsData) {
        const user = await db.user.upsert({
            where: { email: ind.email },
            update: {},
            create: {
                name: ind.name,
                email: ind.email,
                password: hashedPassword,
                role: 'INDIVIDUAL',
            },
        })

        const individual = await db.individual.upsert({
            where: { userId: user.id },
            update: {},
            create: {
                userId: user.id,
                currentRole: ind.currentRole,
                currentCompany: ind.currentCompany,
                totalExperience: ind.totalExperience,
                skills: ind.skills,
                location: ind.location,
                headline: ind.headline,
                isOpenToWork: true,
            },
        })
        individuals.push(individual)
    }
    console.log(`Seeded ${individuals.length} individuals`)

    // 4. SAMPLE APPLICATIONS
    const applicationPairs = [
        { jobIdx: 0, indIdx: 0, status: 'shortlisted', matchScore: 89 },
        { jobIdx: 0, indIdx: 5, status: 'reviewing', matchScore: 76 },
        { jobIdx: 1, indIdx: 2, status: 'interviewing', matchScore: 92 },
        { jobIdx: 2, indIdx: 0, status: 'applied', matchScore: 71 },
        { jobIdx: 3, indIdx: 1, status: 'shortlisted', matchScore: 85 },
        { jobIdx: 4, indIdx: 4, status: 'offered', matchScore: 95 },
        { jobIdx: 6, indIdx: 6, status: 'reviewing', matchScore: 88 },
        { jobIdx: 7, indIdx: 8, status: 'applied', matchScore: 82 },
        { jobIdx: 5, indIdx: 7, status: 'shortlisted', matchScore: 90 },
    ]

    for (const pair of applicationPairs) {
        await db.jobApplication.upsert({
            where: { jobId_individualId: { jobId: jobs[pair.jobIdx].id, individualId: individuals[pair.indIdx].id } },
            update: { status: pair.status },
            create: {
                jobId: jobs[pair.jobIdx].id,
                individualId: individuals[pair.indIdx].id,
                status: pair.status,
                matchScore: pair.matchScore,
            },
        })
    }
    console.log(`Seeded ${applicationPairs.length} applications`)

    console.log('\nDatabase fully populated!')
    console.log('\nTest Accounts:')
    console.log('  Business: admin@techcorpindia.com / password123')
    console.log('  Individual: arjun.mehta@email.com / password123')
}

main()
    .catch(e => { console.error('Seed failed:', e); process.exit(1) })
    .finally(async () => { await db.$disconnect() })