import type {
  ATSSubScore,
  ResumeEducation,
  ResumeExperience,
  ResumeCertification,
  ResumeProject,
  SkillEvidence,
  ResumeAnalysisData,
} from "./resume-types";

// ---------------------------------------------------------------------------
// Input / Output contracts
// ---------------------------------------------------------------------------

/** What we send to the ML model. */
export interface MLAnalysisInput {
  targetRole: string;
  file: File | null;
  jobDescription?: string;
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function isValidNumber(v: unknown): v is number {
  return typeof v === "number" && !isNaN(v) && isFinite(v);
}

function isValidString(v: unknown): v is string {
  return typeof v === "string";
}

function parseSubScore(raw: unknown): ATSSubScore {
  // Use bracket notation throughout for noPropertyAccessFromIndexSignature compliance
  const s = raw as Record<string, unknown>;
  const rawScore = isValidNumber(s["rawScore"]) ? s["rawScore"] : isValidNumber(s["value"]) ? s["value"] : 0;
  const weight = isValidNumber(s["weight"]) ? s["weight"] : 0;
  return {
    label: isValidString(s["label"]) ? s["label"] : "Unknown",
    value: Math.round(Math.max(0, Math.min(100, rawScore))),
    weight,
    rawScore: Math.round(Math.max(0, Math.min(100, rawScore))),
    weightedScore: isValidNumber(s["weightedScore"]) ? s["weightedScore"] : rawScore * weight,
    explanation: isValidString(s["explanation"]) ? s["explanation"] : "",
    matched: Array.isArray(s["matched"]) ? (s["matched"] as string[]) : [],
    missing: Array.isArray(s["missing"]) ? (s["missing"] as string[]) : [],
  };
}

// ---------------------------------------------------------------------------
// Main service function
// ---------------------------------------------------------------------------

/**
 * Send the resume file + target role to the local FastAPI ML model and return analysis results.
 */
export async function callMLService(input: MLAnalysisInput): Promise<ResumeAnalysisData> {
  const ML_SERVICE_URL = import.meta.env["VITE_ML_SERVICE_URL"] ?? "http://localhost:8000/analyze-resume";

  if (!input.file) {
    throw new Error("No file provided for analysis.");
  }

  const formData = new FormData();
  formData.append("file", input.file);
  formData.append("target_role", input.targetRole);
  if (input.jobDescription) {
    formData.append("job_description", input.jobDescription);
  }

  console.info(`[ML Service] Sending analysis request to ${ML_SERVICE_URL} for role:`, input.targetRole);

  try {
    const response = await fetch(ML_SERVICE_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let errorMsg = `ML service error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) errorMsg = errorData.detail;
      } catch (e) {
        // ignore json parse error
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error("Analysis failed on the server.");
    }

    // Parse and validate sub-scores
    const rawSubScores = Array.isArray(data.atsSubScores) ? data.atsSubScores : [];
    const atsSubScores: ATSSubScore[] = rawSubScores.map(parseSubScore);

    // Parse evidence (bracket notation for noPropertyAccessFromIndexSignature)
    const evidence: SkillEvidence[] = Array.isArray(data.evidence)
      ? (data.evidence as Array<Record<string, unknown>>).map((e) => ({
          skill: isValidString(e["skill"]) ? e["skill"] : "",
          source: (["skills_section", "experience", "project", "text_mention"].includes(e["source"] as string)
            ? e["source"]
            : "text_mention") as SkillEvidence["source"],
          evidence: isValidString(e["evidence"]) ? e["evidence"] : "",
        }))
      : [];

    // roleAlignment is optional — only set when the backend returns a valid number
    const roleAlignmentRaw = data.roleAlignment;
    const roleAlignment = isValidNumber(roleAlignmentRaw)
      ? Math.round(roleAlignmentRaw)
      : undefined;

    // scoreType is optional — only set when backend returns a known value
    const scoreTypeRaw = data.scoreType;
    const scoreType: "role_based" | "jd_based" | undefined =
      scoreTypeRaw === "jd_based" ? "jd_based"
      : scoreTypeRaw === "role_based" ? "role_based"
      : undefined;

    const result: ResumeAnalysisData = {
      candidate: {
        name: data.candidate?.name ?? "",
        email: data.candidate?.email ?? "",
        phone: data.candidate?.phone ?? "",
        location: data.candidate?.location ?? "",
        linkedin: data.candidate?.linkedin ?? "",
        github: data.candidate?.github ?? "",
        portfolio: data.candidate?.portfolio ?? "",
      },
      targetRole: data.targetRole ?? input.targetRole,
      atsScore: isValidNumber(data.atsScore) ? Math.round(Math.max(0, Math.min(100, data.atsScore))) : 0,
      atsSubScores,
      skills: Array.isArray(data.skills) ? data.skills : [],
      matchedSkills: Array.isArray(data.matchedSkills) ? data.matchedSkills : [],
      missingRequiredSkills: Array.isArray(data.missingRequiredSkills) ? data.missingRequiredSkills : [],
      missingPreferredSkills: Array.isArray(data.missingPreferredSkills) ? data.missingPreferredSkills : [],
      evidence,
      experience: Array.isArray(data.experience) ? data.experience : [],
      education: Array.isArray(data.education) ? data.education : [],
      projects: Array.isArray(data.projects) ? data.projects : [],
      certifications: Array.isArray(data.certifications) ? data.certifications : [],
      suggestedKeywords: Array.isArray(data.suggestedKeywords) ? data.suggestedKeywords : [],
      quickFixes: Array.isArray(data.quickFixes) ? data.quickFixes : [],
      predictedCategory: data.predictedCategory ?? null,
    };

    // Only set optional fields when they have values (exactOptionalPropertyTypes)
    if (scoreType !== undefined) result.scoreType = scoreType;
    if (roleAlignment !== undefined) result.roleAlignment = roleAlignment;

    return result;
  } catch (err) {
    console.error("[ML Service] Request failed:", err);
    throw err;
  }
}
