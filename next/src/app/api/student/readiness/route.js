import { NextResponse } from 'next/server';
import { mockReadinessData } from '@/data/mockStudentFeatures';

// GET /api/student/readiness — Fetch placement readiness score
export async function GET() {
    try {
        // In production, this would fetch from the database based on session user
        return NextResponse.json(mockReadinessData, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch readiness data' }, { status: 500 });
    }
}

// POST /api/student/readiness — Recalculate readiness score
export async function POST(request) {
    try {
        const body = await request.json();
        // In production: recalculate based on updated student data
        // For now, return mock with slight randomization
        const updated = {
            ...mockReadinessData,
            overallScore: Math.min(100, mockReadinessData.overallScore + Math.floor(Math.random() * 5)),
        };
        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to recalculate score' }, { status: 500 });
    }
}
