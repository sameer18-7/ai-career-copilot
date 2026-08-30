import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let individual = await db.individual.findUnique({
            where: { userId: session.user.id },
            include: {
                user: { select: { name: true, email: true } },
                experiences: { orderBy: { startDate: 'desc' } },
            },
        });

        if (!individual) {
            individual = await db.individual.create({
                data: {
                    userId: session.user.id,
                    skills: [],
                    isOpenToWork: true,
                },
                include: {
                    user: { select: { name: true, email: true } },
                    experiences: true,
                },
            });
        }

        return NextResponse.json(individual);
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const individual = await db.individual.upsert({
            where: { userId: session.user.id },
            update: {
                headline: body.headline,
                location: body.location,
                phone: body.phone,
                linkedin: body.linkedin,
                github: body.github,
                portfolio: body.portfolio,
                currentRole: body.currentRole,
                currentCompany: body.currentCompany,
                totalExperience: body.totalExperience ? Number(body.totalExperience) : null,
                skills: Array.isArray(body.skills) ? body.skills : [],
                bio: body.bio,
                isOpenToWork: body.isOpenToWork ?? true,
            },
            create: {
                userId: session.user.id,
                headline: body.headline,
                location: body.location,
                phone: body.phone,
                linkedin: body.linkedin,
                github: body.github,
                portfolio: body.portfolio,
                currentRole: body.currentRole,
                currentCompany: body.currentCompany,
                totalExperience: body.totalExperience ? Number(body.totalExperience) : null,
                skills: Array.isArray(body.skills) ? body.skills : [],
                bio: body.bio,
                isOpenToWork: body.isOpenToWork ?? true,
            },
        });

        if (body.name) {
            await db.user.update({
                where: { id: session.user.id },
                data: { name: body.name },
            });
        }

        return NextResponse.json(individual);
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}