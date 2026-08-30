import { NextResponse } from 'next/server';
import { mockReadinessData, mockApplications, buildStudentReport } from '@/data/mockStudentFeatures';

// GET /api/student/report — Generate student report
export async function GET() {
    try {
        const report = buildStudentReport(mockReadinessData, mockApplications);
        return NextResponse.json(report, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
}
