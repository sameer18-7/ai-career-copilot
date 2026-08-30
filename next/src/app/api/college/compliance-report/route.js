import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const totalStudents = await db.student.count();
        const placedStudents = await db.student.count({ where: { isPlaced: true } });

        const offers = await db.placementOffer.findMany({
            where: { status: 'accepted' },
            select: { packageLpa: true }
        });

        const packages = offers.map(o => parseFloat(o.packageLpa)).sort((a, b) => a - b);
        const medianPackage = packages.length > 0 ? packages[Math.floor(packages.length / 2)] : 0;
        const highestPackage = packages.length > 0 ? packages[packages.length - 1] : 0;

        const companies = await db.company.findMany({
            select: { name: true, _count: { select: { placementOffers: { where: { status: 'accepted' } } } } }
        });

        const branchStats = await db.student.groupBy({
            by: ['branch'],
            _count: { _all: true },
            where: { isPlaced: true }
        });

        const reportData = {
            academicYear: '2025-26',
            totalStudents,
            placedStudents,
            placementRate: totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(2) : 0,
            medianPackage: medianPackage + ' LPA',
            highestPackage: highestPackage + ' LPA',
            participatingCompanies: companies.length,
            branchDistribution: branchStats.map(b => ({
                branch: b.branch || 'Unknown',
                count: b._count._all
            })),
            topRecruiters: companies
                .filter(c => c._count.placementOffers > 0)
                .sort((a, b) => b._count.placementOffers - a.placementOffers)
                .slice(0, 5)
                .map(c => ({ name: c.name, count: c._count.placementOffers }))
        };

        return NextResponse.json(reportData);

    } catch (err) {
        console.error('Compliance Report API Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
