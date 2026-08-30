import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await db.user.findUnique({
            where: { id: session.user.id },
            include: { company: true },
        });

        const companyId = user?.companyId;
        const whereClause = companyId ? { companyId } : {};

        const jobs = await db.jobPosting.findMany({
            where: whereClause,
            include: {
                company: true,
                _count: {
                    select: { applications: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(jobs);
    } catch (error) {
        console.error('Error fetching jobs:', error);
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
        let user = await db.user.findUnique({
            where: { id: session.user.id },
            include: { company: true },
        });

        let companyId = user?.companyId;
        if (!companyId) {
            const company = await db.company.create({
                data: {
                    name: `${user.name || 'Company'} Corp`,
                },
            });
            await db.user.update({
                where: { id: user.id },
                data: { companyId: company.id },
            });
            companyId = company.id;
        }

        const job = await db.jobPosting.create({
            data: {
                companyId,
                title: body.title,
                description: body.description || null,
                location: body.location || null,
                jobType: body.jobType || 'full_time',
                experienceMin: body.experienceMin || null,
                experienceMax: body.experienceMax || null,
                salaryMin: body.salaryMin || null,
                salaryMax: body.salaryMax || null,
                skills: body.skills || [],
                status: 'active',
            },
        });

        return NextResponse.json(job, { status: 201 });
    } catch (error) {
        console.error('Error creating job:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}