import { NextResponse } from 'next/server';
import { mockApplications } from '@/data/mockStudentFeatures';

// GET /api/student/applications — Fetch all applications
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let filtered = [...mockApplications];
        if (status && status !== 'all') {
            filtered = filtered.filter(a => a.status === status);
        }

        return NextResponse.json({ applications: filtered, total: filtered.length }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }
}

// POST /api/student/applications — Add note or update interview status
export async function POST(request) {
    try {
        const body = await request.json();
        const { applicationId, note, interviewUpdate } = body;

        // In production: update the database
        // For now, return success
        return NextResponse.json({ success: true, applicationId }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
    }
}
