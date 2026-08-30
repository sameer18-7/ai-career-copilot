import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `System Role:
You are an elite, highly critical Technical Recruiter and HR Data Analyst. Your job is to evaluate a candidate's resume strictly against a specific Job Description (JD).

Instructions:

1. You will be provided with a complete Job Description (title, description, and required competencies) and a Candidate Resume.

2. You MUST deeply analyze the candidate's specific PROJECTS, INTERNSHIP/WORK EXPERIENCE, and LISTED SKILLS and compare them directly against the JD requirements.

3. DO NOT give generic or vague responses. Every point you make MUST reference a specific item from the resume (e.g., "Built a real-time chat app using Socket.io" or "Interned at Google working on data pipelines") and explain how it maps (or doesn't map) to the JD requirements.

4. For critical_missing_skills: ONLY list skills/technologies that are EXPLICITLY written in the JD's Required Competencies or job description text. Do NOT invent, infer, or add any skills that are not directly mentioned in the JD. If the JD says "Python, React" then the ONLY possible missing skills are Python and React — nothing else.

5. For relevant_projects and relevant_experience: pick ONLY items from the resume that are directly relevant to the JD. Include a brief reason explaining why each is relevant. If nothing is relevant, return empty arrays.

6. The justification MUST be 3-4 sentences, citing specific resume items (project names, company names, technologies used) and mapping them to JD requirements. Never say things like "strong candidate" or "good fit" without citing evidence.

Output Format (Strict JSON):
You must output your analysis in the following strict JSON format. Do not include markdown formatting or outside text.
{
  "match_score_out_of_100": <integer based strictly on JD skill/experience overlap>,
  "key_strengths": ["<Specific matching skill from resume that JD requires>", "..."],
  "critical_missing_skills": ["<Required skill/tech in JD NOT found in resume>", "..."],
  "relevant_projects": ["<Project name from resume — brief reason it's relevant to JD>", "..."],
  "relevant_experience": ["<Internship/role from resume — brief reason it's relevant to JD>", "..."],
  "justification": "<3-4 sentences citing specific projects, internships, and skills from the resume, explaining exactly how they align or don't align with this JD's requirements.>"
}`;

function buildPrompt(jobDescription, resumeText, competencies) {
    return `Inputs:

=== JOB DESCRIPTION ===
${jobDescription}
=== END JOB DESCRIPTION ===

=== REQUIRED COMPETENCIES (EXACT LIST) ===
${competencies && competencies.length > 0 ? competencies.join(', ') : 'See job description text above'}
=== END REQUIRED COMPETENCIES ===

=== CANDIDATE RESUME ===
${resumeText}
=== END CANDIDATE RESUME ===

IMPORTANT: The REQUIRED COMPETENCIES listed above are the ONLY skills you should check against. For critical_missing_skills, ONLY include items from this exact list that are NOT found in the resume. Do NOT add any other skills.
Analyze this candidate's resume against the job description above. Focus on their specific projects, work experience, and skills. Be detailed and cite specific items from the resume.`;
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Intelligent fallback: analyze resume text against ONLY the user-provided competencies
function localAnalysis(jobDescription, resumeText, candidateId, competencies = []) {
    const resumeLower = resumeText.toLowerCase();

    // Use ONLY the competencies the user explicitly listed — never invent skills
    const requiredSkills = competencies.map(c => c.toLowerCase());

    const matched = requiredSkills.filter(s => resumeLower.includes(s));
    const missing = requiredSkills.filter(s => !resumeLower.includes(s));

    // Score based on skill overlap against ONLY user-provided competencies
    let score = 0;
    if (requiredSkills.length > 0) {
        score = Math.round((matched.length / requiredSkills.length) * 85) + 10;
    } else {
        score = 50; // No competencies provided, neutral score
    }

    // Add some variance based on experience mentions
    const hasInternship = resumeLower.includes('intern');
    const hasProject = resumeLower.includes('project');
    const hasContributions = resumeLower.includes('open source') || resumeLower.includes('contribution');
    if (hasInternship) score = Math.min(score + 5, 98);
    if (hasProject) score = Math.min(score + 3, 98);
    if (hasContributions) score = Math.min(score + 3, 98);

    // Clamp
    score = Math.max(20, Math.min(score, 98));

    // Extract project and experience mentions from resume
    const projectMatches = resumeText.match(/(?:PROJECTS?|PROJECT WORK)[\s\S]*?(?=SKILLS|ACHIEVEMENTS|EDUCATION|$)/i);
    const experienceMatches = resumeText.match(/(?:EXPERIENCE|WORK EXPERIENCE|INTERNSHIP)[\s\S]*?(?=PROJECTS?|SKILLS|ACHIEVEMENTS|$)/i);
    const projectLines = projectMatches ? projectMatches[0].split('\n').filter(l => l.trim() && !l.match(/^(PROJECTS?|PROJECT WORK)/i)).slice(0, 3).map(l => l.trim().replace(/^[•\-*]\s*/, '')) : [];
    const experienceLines = experienceMatches ? experienceMatches[0].split('\n').filter(l => l.trim() && !l.match(/^(EXPERIENCE|WORK)/i) && l.match(/intern|engineer|developer|analyst|researcher|assistant/i)).slice(0, 2).map(l => l.trim().replace(/^[•\-*]\s*/, '')) : [];

    const justification = matched.length > 0
        ? `Resume shows direct skill overlap in ${matched.slice(0, 3).join(', ')} which are listed as required competencies. ${experienceLines.length > 0 ? `Their experience (${experienceLines[0]}) provides hands-on exposure relevant to this role. ` : ''}${missing.length > 0 ? `However, the resume lacks ${missing.slice(0, 2).join(' and ')} which are explicitly required competencies.` : `${projectLines.length > 0 ? `Projects like ${projectLines[0]} demonstrate practical application of required skills.` : 'Covers all listed competencies.'}`}`
        : `Candidate's resume does not mention any of the required competencies (${requiredSkills.slice(0, 4).join(', ')}). ${missing.length > 0 ? `Missing: ${missing.slice(0, 3).join(', ')}.` : ''}`;

    return {
        id: candidateId,
        matchScore: score,
        keyStrengths: matched.length > 0 ? matched.slice(0, 5) : [],
        criticalMissingSkills: missing.slice(0, 4),
        relevantProjects: projectLines.slice(0, 3),
        relevantExperience: experienceLines.slice(0, 2),
        justification,
        shortlisted: false,
    };
}

async function analyzeWithRetry(model, jobDescription, resume, index, competencies = [], maxRetries = 2) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const prompt = buildPrompt(jobDescription, resume.text, competencies);
            const result = await model.generateContent(SYSTEM_PROMPT + '\n\n' + prompt);
            const responseText = result.response.text();

            let analysis;
            try {
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                analysis = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
            } catch (parseErr) {
                console.error(`Parse error resume ${index}, attempt ${attempt}:`, responseText.slice(0, 200));
                if (attempt === maxRetries) throw new Error('JSON parse failed');
                await delay(2000);
                continue;
            }

            return {
                id: resume.id,
                fileName: resume.fileName,
                matchScore: analysis.match_score_out_of_100 || 0,
                keyStrengths: analysis.key_strengths || [],
                criticalMissingSkills: analysis.critical_missing_skills || [],
                relevantProjects: analysis.relevant_projects || [],
                relevantExperience: analysis.relevant_experience || [],
                justification: analysis.justification || 'No justification provided.',
                shortlisted: false,
                source: 'gemini',
            };
        } catch (err) {
            console.error(`Attempt ${attempt + 1} failed for resume ${index}:`, err.message?.slice(0, 100));
            if (attempt < maxRetries) {
                const backoff = (attempt + 1) * 3000;
                console.log(`Retrying in ${backoff}ms...`);
                await delay(backoff);
            }
        }
    }

    // All retries failed — use intelligent local fallback
    console.log(`Using local analysis fallback for resume ${index}`);
    return {
        ...localAnalysis(jobDescription, resume.text, resume.id, competencies),
        fileName: resume.fileName,
        source: 'local-fallback',
    };
}

export async function POST(request) {
    try {
        const { jobDescription, resumes, competencies = [] } = await request.json();

        if (!jobDescription || !resumes || resumes.length === 0) {
            return NextResponse.json(
                { error: 'Missing jobDescription or resumes' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            // No API key — use local analysis for all resumes
            console.log('No Gemini API key configured, using local analysis');
            const results = resumes.map((resume, i) => ({
                ...localAnalysis(jobDescription, resume.text, resume.id, competencies),
                fileName: resume.fileName,
                source: 'local-no-key',
            }));
            results.sort((a, b) => b.matchScore - a.matchScore);
            return NextResponse.json({ candidates: results });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                temperature: 0.3,
                topP: 0.8,
                maxOutputTokens: 1024,
                responseMimeType: 'application/json',
            },
        });

        // Process resumes SEQUENTIALLY with delays to respect rate limits
        const results = [];
        for (let i = 0; i < resumes.length; i++) {
            console.log(`Analyzing resume ${i + 1}/${resumes.length}: ${resumes[i].fileName}`);
            const result = await analyzeWithRetry(model, jobDescription, resumes[i], i, competencies);
            results.push(result);

            // 2s delay between requests for free tier safety
            if (i < resumes.length - 1) {
                await delay(2000);
            }
        }

        // Sort by match score descending
        results.sort((a, b) => b.matchScore - a.matchScore);

        const geminiCount = results.filter((r) => r.source === 'gemini').length;
        const fallbackCount = results.filter((r) => r.source !== 'gemini').length;
        console.log(`Analysis complete: ${geminiCount} via Gemini, ${fallbackCount} via fallback`);

        return NextResponse.json({ candidates: results });
    } catch (err) {
        console.error('Analyze API error:', err);
        return NextResponse.json(
            { error: err.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
