// ---------------------------------------------------------------------------
// Resume Analyzer — Type Definitions
// ---------------------------------------------------------------------------
// Clean data contracts for the resume analysis pipeline.
// ---------------------------------------------------------------------------

/**
 * Full state machine for the resume analysis flow.
 *
 *  idle
 *    → file_selected      (file chosen, waiting for target role)
 *    → role_submitted     (role confirmed, ready to analyze)
 *    → uploading          (file sent to server / ML service)
 *    → parsing            (extracting text from the document)
 *    → ml_analyzing       (ML model evaluating resume vs role)
 *    → ready              (analysis complete — show results)
 *    → error              (something went wrong — show error banner)
 */
export type ResumeAnalysisStatus =
  | "idle"
  | "file_selected"
  | "role_submitted"
  | "uploading"
  | "parsing"
  | "ml_analyzing"
  | "ready"
  | "error";

/** Where the file came from. */
export type FileSource = "local" | "google_drive";

/** Metadata about the uploaded file (not the content itself). */
export interface ResumeFile {
  fileName: string;
  fileType: string;   // MIME or extension
  fileSize: number;   // bytes
  source: FileSource;
  file?: File;        // only present for local uploads
}

// ---------------------------------------------------------------------------
// Parsed resume data — mirrors what the parser will return
// ---------------------------------------------------------------------------

export interface CandidateInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio?: string;
}

export interface ResumeExperience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface ResumeEducation {
  degree: string;
  institution: string;
  year: string;
}

export interface ResumeProject {
  name: string;
  description: string;
  technologies: string[];
}

export interface ResumeCertification {
  name: string;
  issuer: string;
  year: string;
}

/**
 * Evidence item returned for a matched skill.
 * source indicates where the skill was found in the resume.
 */
export interface SkillEvidence {
  skill: string;
  /** Where the skill was matched: "skills_section" | "experience" | "project" | "text_mention" */
  source: "skills_section" | "experience" | "project" | "text_mention";
  evidence: string;
}

/**
 * Per-component score breakdown with evidence and explanation.
 * Each sub-score carries its weight, raw 0-100 score, weighted contribution,
 * human-readable explanation, and matched/missing skill lists.
 */
export interface ATSSubScore {
  label: string;
  value: number;            // 0-100 raw score for display (legacy compat)
  weight: number;           // 0-1 component weight
  rawScore: number;         // 0-100 raw component score
  weightedScore: number;    // rawScore * weight (0-100)
  explanation: string;      // human-readable explanation
  matched: string[];        // skills/sections matched in this component
  missing: string[];        // skills/sections missing in this component
}

/**
 * The complete analysis payload produced by the parser + ML model.
 *
 * - suggestedKeywords  — keywords recommended based on the target role
 * - quickFixes        — plain-text improvement recommendations (text-only)
 * - scoreType         — "role_based" (no JD) | "jd_based" (JD provided)
 * - roleAlignment     — 0-100 TF-IDF similarity to role skill profile
 * - matchedSkills     — required skills confirmed in resume
 * - missingRequiredSkills — required skills not evidenced
 * - missingPreferredSkills — preferred skills not evidenced
 * - evidence          — structured evidence items for matched skills
 *
 * Note: atsScore is a resume-to-role MATCH ESTIMATE, not an official ATS score
 * or a validated predictor of hiring success.
 */
export interface ResumeAnalysisData {
  candidate: CandidateInfo;
  targetRole: string;              // the role the user selected before analysis
  atsScore: number;                // 0-100 weighted composite score
  /** "role_based" when scored against role profile; "jd_based" when a JD was provided. */
  scoreType?: "role_based" | "jd_based";
  /** 0-100 TF-IDF text similarity to role skill profile. Consistent with atsSubScores. */
  roleAlignment?: number;
  atsSubScores: ATSSubScore[];     // breakdown bars with evidence
  skills: string[];                // flat skill list from resume
  matchedSkills?: string[];        // required skills confirmed present
  missingRequiredSkills?: string[]; // required skills not evidenced
  missingPreferredSkills?: string[]; // preferred skills not evidenced
  evidence?: SkillEvidence[];      // structured evidence for matched skills
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
  suggestedKeywords: string[];     // renamed from missingKeywords
  quickFixes: string[];            // text-only strings (no id/completed)
  /** Resume category predicted by TF-IDF + LinearSVC (separate from ATS scoring). */
  predictedCategory?: string | null;
}

// ---------------------------------------------------------------------------
// Combined state used by the useResume hook
// ---------------------------------------------------------------------------

export interface ResumeState {
  status: ResumeAnalysisStatus;
  file: ResumeFile | null;
  targetRole: string;           // persisted across re-analyses
  analysisData: ResumeAnalysisData | null;
  error: string | null;
}

/** The initial / reset state. */
export const INITIAL_RESUME_STATE: ResumeState = {
  status: "idle",
  file: null,
  targetRole: "",
  analysisData: null,
  error: null,
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/** Common target roles shown as dropdown suggestions in the role input. */
export const SUGGESTED_ROLES = [
  "Software Engineer",
  "Backend Developer",
  "Frontend Developer",
  "Full-Stack Developer",
  "Data Scientist",
  "Data Analyst",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Cloud Engineer",
  "Product Manager",
];
