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

export interface ATSSubScore {
  label: string;
  value: number; // 0-100
}

/**
 * The complete analysis payload produced by the parser + ML model.
 *
 * - suggestedKeywords  — keywords the ML model recommends adding for the target role
 * - quickFixes        — plain-text improvement recommendations (text-only, no checkboxes)
 */
export interface ResumeAnalysisData {
  candidate: CandidateInfo;
  targetRole: string;           // the role the user selected before analysis
  atsScore: number;             // 0-100, from ML model
  atsSubScores: ATSSubScore[];  // breakdown bars
  skills: string[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
  suggestedKeywords: string[];  // renamed from missingKeywords — ML model output
  quickFixes: string[];         // text-only strings — ML model output (no id/completed)
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
