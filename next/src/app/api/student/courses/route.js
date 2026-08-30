import { NextResponse } from 'next/server';
import { mockCourseLibrary } from '@/data/mockStudentFeatures';

// GET /api/student/courses — Fetch course recommendations with filters
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const skillGap = searchParams.get('skillGap');
        const difficulty = searchParams.get('difficulty');
        const maxDuration = searchParams.get('maxDuration');
        const pricing = searchParams.get('pricing'); // free | paid
        const platform = searchParams.get('platform');

        let filtered = [...mockCourseLibrary];

        if (skillGap) {
            filtered = filtered.filter(c =>
                c.skillGap.toLowerCase().includes(skillGap.toLowerCase()) ||
                c.category.toLowerCase().includes(skillGap.toLowerCase())
            );
        }
        if (difficulty) {
            filtered = filtered.filter(c => c.difficulty === difficulty);
        }
        if (maxDuration) {
            const maxH = parseInt(maxDuration);
            filtered = filtered.filter(c => {
                const hours = parseInt(c.duration);
                return !isNaN(hours) && hours <= maxH;
            });
        }
        if (pricing === 'free') {
            filtered = filtered.filter(c => c.price.toLowerCase() === 'free');
        } else if (pricing === 'paid') {
            filtered = filtered.filter(c => c.price.toLowerCase() !== 'free');
        }
        if (platform) {
            filtered = filtered.filter(c => c.platform.toLowerCase() === platform.toLowerCase());
        }

        return NextResponse.json({ courses: filtered, total: filtered.length }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
    }
}
