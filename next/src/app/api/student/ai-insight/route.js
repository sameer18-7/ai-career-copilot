import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are an AI Career Coach and Placement Mentor for a student portal called 'Placify'.
Your goal is to analyze a student's profile, resume, and career goals to provide highly personalized insights.
Input will include:
- Target Role
- Target Company
- Student Profile (CGPA, Branch, Skills)
- Resume Text (if provided)

Output MUST be a JSON object with the following structure:
{
  "matchPercent": number,
  "aiSummary": "A 2-3 sentence overview of the student's current standing for the target goal",
  "gaps": [
    { "skill": "Skill Name", "severity": "high" | "medium" | "low", "description": "Why it's a gap and how to fix it" }
  ],
  "roadmap": [
    { "phase": "Timeframe", "title": "Phase Title", "description": "Specific actions to take", "type": "learn" | "project" | "practice" | "milestone" }
  ],
  "readinessBreakdown": {
    "skills": number,
    "resume": number,
    "practice": number,
    "projects": number
  },
  "courseRecommendations": [
    { "title": "Course Title", "platform": "Platform Name", "instructor": "Instructor Name", "rating": number, "duration": "Time", "price": "Price", "url": "URL", "skillGap": "Related Skill" }
  ]
}

Be realistic and data-driven. Google/Microsoft/Amazon have high bars. If a student's CGPA is low or skills are missing, mark them as 'high severity' gaps.`;

export async function POST(request) {
  try {
    const { role, company, studentId, resumeText } = await request.json();

    // 1. Fetch student data from DB
    const student = await db.student.findUnique({
      where: { id: studentId || 'default' },
      include: { user: true, skills: { include: { skill: true } } }
    });

    console.log('AI Request for Student:', student?.id || 'demo-mode');

    const studentProfile = student ? {
      name: student.user.name,
      branch: student.branch,
      cgpa: student.cgpa ? parseFloat(student.cgpa.toString()) : null,
      skills: student.skills.map(s => s.skill.name),
      isPlaced: student.isPlaced
    } : {
      name: "Alex Student",
      branch: "Computer Science",
      cgpa: 8.5,
      skills: ["JavaScript", "React", "Node.js", "SQL"],
      isPlaced: false
    };

    console.log('Target Role:', role, 'Company:', company);

    // 2. Prepare AI Prompt
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      }
    });
    const prompt = `${SYSTEM_PROMPT}\n\nTARGET ROLE: ${role}\nTARGET COMPANY: ${company}\nSTUDENT PROFILE: ${JSON.stringify(studentProfile)}\nRESUME TEXT: ${resumeText || 'No resume provided'}`;

    console.log('Calling Gemini AI...');

    // 3. Generate Content
    console.log('Calling Gemini AI...');
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log('Gemini Response received, length:', responseText.length);

    // Clean up the response (remove markdown code blocks if any)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('AI non-JSON response:', responseText);
      throw new Error('AI returned invalid format');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    console.log('Analysis parsed successfully');

    return NextResponse.json(analysis);

  } catch (err) {
    console.error('Student AI Insight Detail Error:', err.message);
    return NextResponse.json({ error: err.message || 'Failed to generate career insights' }, { status: 500 });
  }
}
