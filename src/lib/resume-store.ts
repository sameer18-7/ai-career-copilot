/**
 * Resume Analysis Store
 * =====================
 * Persists the last resume analysis result in localStorage so it can be
 * consumed across pages (e.g., Interview Coach reads skills / target role
 * from the resume analysis without requiring re-upload).
 *
 * Schema version bump (STORE_VERSION) will wipe stale data automatically.
 */

import type { ResumeAnalysisData } from "./resume-types";

const STORAGE_KEY = "cc_resume_analysis_v1";

export interface StoredResumeAnalysis {
  /** ISO timestamp when the analysis was saved */
  savedAt: string;
  data: ResumeAnalysisData;
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

export function saveResumeAnalysis(data: ResumeAnalysisData): void {
  try {
    const payload: StoredResumeAnalysis = {
      savedAt: new Date().toISOString(),
      data,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    // Dispatch a custom event so other in-page listeners can react immediately
    window.dispatchEvent(new CustomEvent("cc:resume-analysis-saved", { detail: payload }));
  } catch {
    // Storage quota exceeded or unavailable — fail silently
  }
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export function loadResumeAnalysis(): StoredResumeAnalysis | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredResumeAnalysis;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Clear
// ---------------------------------------------------------------------------

export function clearResumeAnalysis(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("cc:resume-analysis-cleared"));
  } catch {
    // ignore
  }
}
