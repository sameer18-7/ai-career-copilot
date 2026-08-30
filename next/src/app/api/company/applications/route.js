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
        const whereClause = companyId ? { job: { companyId } } : {};

        const applications = await db.jobApplication.findMany({
            where: whereClause,
            include: {
                job: true,
                individual: {
                    include: {
                        user: {
                            select: { name: true, email: true, image: true },
                        },
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