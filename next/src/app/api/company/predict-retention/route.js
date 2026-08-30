import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const SYSTEM_PROMPT = `You are an HR Data Analyst specializing in campus recruitment. 
Your goal is to predict the "Retention Risk" of a student who has received a job offer. 
Retention Risk means the likelihood that the student will REJECT the offer or not join after accepting.

Categories:
- High: Very likely to reject or not join (e.g., has many other offers, applying to many top-tier firms, significantly overqualified).
- Medium: Modest risk (e.g., has 1-2 other offers, active in similar roles).
- Low: Likely to join (e.g., few other offers, job is a great match for their profile and branch).

Provide output in strict JSON format:
{
  "retentionRisk": "High" | "Medium" | "Low",
  "riskJustification": "Concise justification citing specific data points like offer count, application count, and profile match."
}`;

export async function POST(request) {
    try {
        const { offerId } = await request.json();

        if (!offerId) {
            return NextResponse.json({ error: 'Missing offerId' }, { status: 400 });
        }

        const offer = await db.placementOffer.findUnique({
            where: { id: offerId },
            include: {
                student: {
                    include: {
                        applications: true,
                        placementOffers: true,
                        skills: { include: { skill: true } }
                    }
                },
                job: true,
                company: true
            }
        });

        if (!offer) {
            return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
        }

        // Sanitize for JSON stringify (handle Decimal)
        const sanitizedOffer = {
            ...offer,
            packageLpa: offer.packageLpa ? parseFloat(offer.packageLpa) : null,
            student: {
                ...offer.student,
                cgpa: offer.student.cgpa ? parseFloat(offer.student.cgpa) : null
            }
        };

        const student = offer.student;
        const otherOffersCount = student.placementOffers.length - 1;
        const applicationsCount = student.applications.length;
        const skills = student.skills.map(s => s.skill.name).join(', ');

        const studentData = {
            name: student.user?.name || 'Student',
            branch: student.branch,
            cgpa: student.cgpa,
            skills,
            activeApplications: applicationsCount,
            otherOffers: otherOffersCount,
        };

        const jobData = {
            title: offer.job.title,
            company: offer.company.name,
            package: offer.packageLpa
        };

        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) {
            return NextResponse.json({
                retentionRisk: 'Medium',
                riskJustification: 'AI analysis unavailable (API key missing). Defaulting to Medium risk based on general trends.'
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json',
            },
        });

        const prompt = `
        Student Profile:
        - Branch: ${studentData.branch}
        - CGPA: ${studentData.cgpa}
        - Skills: ${studentData.skills}
        - Total Job Applications: ${studentData.activeApplications}
        - Other Job Offers: ${studentData.otherOffers}

        Offered Job:
        - Role: ${jobData.title}
        - Company: ${jobData.company}
        - Package: ${jobData.package} LPA

        Analyze the risk of this student NOT joining ${jobData.company}.
        `;

        const result = await model.generateContent(SYSTEM_PROMPT + '\n\n' + prompt);
        const responseText = result.response.text();

        let analysis;
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            analysis = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
        } catch (e) {
            console.error('JSON parse error in AI prediction:', responseText);
            throw new Error('AI response was not valid JSON');
        }

        // Update the offer with the prediction
        await db.placementOffer.update({
            where: { id: offerId },
            data: {
                retentionRisk: analysis.retentionRisk,
                riskJustification: analysis.riskJustification
            }
        });

        return NextResponse.json(analysis);

    } catch (err) {
        console.error('Predict Retention Error:', err);
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}
