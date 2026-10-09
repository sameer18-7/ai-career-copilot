import type {
  ATSSubScore,
  ResumeEducation,
  ResumeExperience,
  ResumeCertification,
  ResumeProject,
  ResumeAnalysisData,
} from "./resume-types";

// ---------------------------------------------------------------------------
// Input / Output contracts
// ---------------------------------------------------------------------------

/** What we send to the ML model. */
export interface MLAnalysisInput {
  targetRole: string;
  file: File | null;
}

// ---------------------------------------------------------------------------
// Main service function
// ---------------------------------------------------------------------------

/**
 * Send the resume file + target role to the local FastAPI ML model and return analysis results.
 */
export async function callMLService(input: MLAnalysisInput): Promise<ResumeAnalysisData> {
  const ML_SERVICE_URL = import.meta.env.VITE_ML_SERVICE_URL || "http://localhost:8000/analyze-resume";

  if (!input.file) {
    throw new Error("No file provided for analysis.");
  }

  const formData = new FormData();
  formData.append("file", input.file);
  formData.append("target_role", input.targetRole);

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

    return {
      candidate: data.candidate,
      targetRole: data.targetRole,
      atsScore: data.atsScore,
      atsSubScores: data.atsSubScores,
      skills: data.skills || [],
      experience: data.experience || [],
      education: data.education || [],
      projects: data.projects || [],
      certifications: data.certifications || [],
      suggestedKeywords: data.suggestedKeywords || [],
      quickFixes: data.quickFixes || [],
    };
  } catch (err) {
    console.error("[ML Service] Request failed:", err);
    throw err;
  }
}
