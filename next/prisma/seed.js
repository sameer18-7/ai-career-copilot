const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const db = new PrismaClient()

async function main() {
    console.log('🌱 Starting comprehensive seed (Sequential Mode)...')

    // 1. COLLEGES
    const collegesData = [
        { id: 'college-iitd', name: 'IIT Delhi', city: 'New Delhi', state: 'Delhi', website: 'https://iitd.ac.in' },
        { id: 'college-nitt', name: 'NIT Trichy', city: 'Tiruchirappalli', state: 'Tamil Nadu', website: 'https://nitt.edu' },
        { id: 'college-bits', name: 'BITS Pilani', city: 'Pilani', state: 'Rajasthan', website: 'https://bits-pilani.ac.in' },
        { id: 'college-iiith', name: 'IIIT Hyderabad', city: 'Hyderabad', state: 'Telangana', website: 'https://iiit.ac.in' },
    ]

    const colleges = []
    for (const c of collegesData) {
        const created = await db.college.upsert({
            where: { id: c.id },
            update: {},
            create: c
        })
        colleges.push(created)
    }
    console.log(`✅ Seeded ${colleges.length} colleges`)

    // 2. COMPANIES
    const companiesData = [
        { id: 'company-google', name: 'Google', website: 'https://google.com', industry: 'Technology' },
        { id: 'company-microsoft', name: 'Microsoft', website: 'https://microsoft.com', industry: 'Technology' },
        { id: 'company-amazon', name: 'Amazon', website: 'https://amazon.com', industry: 'E-Commerce / Cloud' },
        { id: 'company-flipkart', name: 'Flipkart', website: 'https://flipkart.com', industry: 'E-Commerce' },
        { id: 'company-razorpay', name: 'Razorpay', website: 'https://razorpay.com', industry: 'Fintech' },
    ]

    const companies = []
    for (const c of companiesData) {
        const created = await db.company.upsert({
            where: { name: c.name },
            update: {},
            create: c
        })
        companies.push(created)
    }
    console.log(`✅ Seeded ${companies.length} companies`)

    // 3. SKILLS
    const skillNames = ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'Java', 'DSA', 'SQL', 'Docker', 'AWS']
    const skillIds = []
    for (const name of skillNames) {
        const skill = await db.skill.upsert({
            where: { name },
            update: {},
            create: { name }
        })
        skillIds.push(skill.id)
    }
    console.log(`✅ Seeded ${skillIds.length} skills`)

    // 4. PLACEMENT DRIVES & JOBS
    const driveDate = new Date()
    driveDate.setDate(driveDate.getDate() + 10)

    const jobsInput = [
        { id: 'job-google', companyId: 'company-google', title: 'SDE-1', package: 32, skills: ['Go', 'DSA', 'Python'] },
        { id: 'job-ms', companyId: 'company-microsoft', title: 'Frontend Engineer', package: 28, skills: ['React', 'TypeScript'] },
        { id: 'job-amazon', companyId: 'company-amazon', title: 'SDE-1', package: 30, skills: ['Java', 'AWS', 'DSA'] },
        { id: 'job-flipkart', companyId: 'company-flipkart', title: 'Backend Dev', package: 24, skills: ['Java', 'SQL', 'Node.js'] },
        { id: 'job-razorpay', companyId: 'company-razorpay', title: 'Fullstack Dev', package: 22, skills: ['React', 'Node.js', 'SQL'] },
    ]

    const jobIds = []
    for (const job of jobsInput) {
        // Upsert Drive
        const driveId = `drive-${job.id}`
        const drive = await db.placementDrive.upsert({
            where: { id: driveId },
            update: { status: 'upcoming' },
            create: {
                id: driveId,
                collegeId: colleges[Math.floor(Math.random() * colleges.length)].id,
                companyId: job.companyId,
                status: 'upcoming',
                driveDate: driveDate
            }
        })

        const createdJob = await db.jobPosting.upsert({
            where: { id: job.id },
            update: { status: 'active' },
            create: {
                id: job.id,
                companyId: job.companyId,
                driveId: drive.id,
                title: job.title,
                packageLpa: job.package,
                roleType: 'full_time',
                status: 'active'
            }
        })
        jobIds.push(createdJob.id)
    }
    console.log(`✅ Seeded ${jobIds.length} Job Postings`)

    // 5. SAMPLE STUDENTS
    // Check if students already exist to avoid spamming the DB on every run
    const existingStudents = await db.student.count()
    if (existingStudents > 10) {
        console.log('⏩ Students already seeded, skipping student generation.')
    } else {
        const hashedPassword = await bcrypt.hash('password123', 10)
        const firstNames = ['Amit', 'Priya', 'Rahul', 'Sonal', 'Vikram', 'Anjali', 'Deepak', 'Megha', 'Arjun', 'Sneha']
        const lastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Reddy', 'Nair', 'Patel', 'Joshi', 'Das', 'Iyer']

        console.log('⏳ Creating 30 sample students...')
        for (let i = 0; i < 30; i++) {
            const fName = firstNames[i % 10]
            const lName = lastNames[Math.floor(i / 3) % 10]
            const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@university.edu`

            // Upsert User
            const user = await db.user.upsert({
                where: { email },
                update: {},
                create: {
                    name: `${fName} ${lName}`,
                    email,
                    password: hashedPassword,
                    role: 'STUDENT'
                }
            })

            // Upsert Student
            const student = await db.student.upsert({
                where: { userId: user.id },
                update: { isPlaced: i < 12 },
                create: {
                    userId: user.id,
                    collegeId: colleges[i % colleges.length].id,
                    cgpa: (Math.random() * 3 + 7).toFixed(2),
                    isPlaced: i < 12,
                    batchYear: 2025
                }
            })

            // Skills (only if none exist for this student)
            const skillsExist = await db.studentSkill.count({ where: { studentId: student.id } })
            if (skillsExist === 0) {
                const randomSkills = [...skillIds].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 3)
                await db.studentSkill.createMany({
                    data: randomSkills.map(sId => ({ studentId: student.id, skillId: sId }))
                })
            }

            // Offers for placed students
            if (student.isPlaced) {
                const jobId = jobIds[i % jobIds.length]
                const jobInfo = jobsInput.find(j => j.id === jobId)

                const app = await db.application.upsert({
                    where: { jobId_studentId: { jobId, studentId: student.id } },
                    update: { status: 'offered' },
                    create: {
                        studentId: student.id,
                        jobId: jobId,
                        status: 'offered',
                        matchScore: Math.floor(Math.random() * 20) + 75
                    }
                })

                await db.placementOffer.upsert({
                    where: { applicationId: app.id },
                    update: { status: 'accepted' },
                    create: {
                        studentId: student.id,
                        jobId: jobId,
                        applicationId: app.id,
                        companyId: jobInfo.companyId,
                        packageLpa: jobInfo.package,
                        status: 'accepted',
                        offerDate: new Date()
                    }
                })
            }
        }
        console.log('✅ Created 30 Students with Skills, Apps, and Offers')
    }

    console.log('\n🎉 Dashboard is now fully populated!')
}

main()
    .catch(e => { console.error('❌ Seed failed:', e); process.exit(1) })
    .finally(async () => { await db.$disconnect() })
