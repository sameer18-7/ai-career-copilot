import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const individual = await db.individual.findUnique({
            where: { userId: session.user.id },
        });

        if (!individual) {
            return NextResponse.json([]);
        }

        const applications = await db.jobApplication.findMany({
            where: { individualId: individual.id },
            include: {
                job: {
                    include: {
                        company: true,
                    },
                },
            },
            orderBy: { appliedAt: 'desc' },
        });

        return NextResponse.json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { jobId, coverLetter } = body;

        let individual = await db.individual.findUnique({
            where: { userId: session.user.id },
        });

        if (!individual) {
            individual = await db.individual.create({
                data: {
                    userId: session.user.id,
                    skills: [],
                    isOpenToWork: true,
                },
            });
        }

        const job = await db.jobPosting.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        // Calculate simple match score based on skill overlap
        let matchScore = 75;
        if (job.skills && job.skills.length > 0 && individual.skills && individual.skills.length > 0) {
            const overlap = job.skills.filter(s =>
                individual.skills.some(is => is.toLowerCase() === s.toLowerCase())
            ).length;
            matchScore = Math.min(98, Math.max(60, Math.round((overlap / job.skills.length) * 100)));
        }

        const application = await db.jobApplication.upsert({
            where: {
                jobId_individualId: {
                    jobId,
                    individualId: individual.id,
                },
            },
            update: {
                coverLetter: coverLetter || null,
                status: 'applied',
            },
            create: {
                jobId,
                individualId: individual.id,
                coverLetter: coverLetter || null,
                matchScore,
                status: 'applied',
            },
        });

        return NextResponse.json(application, { status: 201 });
    } catch (error) {
        console.error('Error submitting application:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}