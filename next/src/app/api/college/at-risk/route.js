import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        // Students with 0 applications
        const neverApplied = await db.student.findMany({
            where: {
                applications: {
                    none: {}
                }
            },
            include: {
                user: true
            }
        });

        // Students with > 3 rejections
        const frequentRejections = await db.student.findMany({
            where: {
                applications: {
                    some: {
                        status: 'rejected'
                    }
                }
            },
            include: {
                user: true,
                _count: {
                    select: {
                        applications: {
                            where: { status: 'rejected' }
                        }
                    }
                }
            }
        }).then(students => students.filter(s => s._count.applications > 3));

        const atRiskStudents = [
            ...neverApplied.map(s => ({
                id: s.id,
                userId: s.user.name || s.user.email, // Use name/email for UI display
                branch: s.branch,
                riskReason: 'No applications yet'
            })),
            ...frequentRejections.map(s => ({
                id: s.id,
                userId: s.user.name || s.user.email,
                branch: s.branch,
                riskReason: 'More than 3 rejections'
            }))
        ];

        return NextResponse.json({
            count: atRiskStudents.length,
            students: atRiskStudents
        });

    } catch (err) {
        console.error('At-Risk API Error:', err);
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}
