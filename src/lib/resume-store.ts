/**
 * Resume Analysis Store
 * =====================
 * Persists the last resume analysis result in sessionStorage (not localStorage)
 * so analysis data is scoped to the current browser session and automatically
 * cleared when the tab is closed.
 *
 * Security model:
 *  - Uses sessionStorage instead of localStorage to limit cross-session leakage.
 *  - The key is prefixed with the authenticated user's ID so two accounts in
 *    the same browser session cannot see each other's results.
 *  - Call clearResumeAnalysis() on logout to ensure no residual data remains.
 *  - The authoritative record lives in the backend; this store is a client-side
 *    cache only and must not substitute for server-side ownership checks.
 *
 * Note: The full resume analysis data (skills, ATS scores, etc.) is not
 * considered PII in isolation, but it is user-private and should only be
 * accessible to the authenticated owner.
 */

import type { ResumeAnalysisData } from "./resume-types";

/** Build a user-scoped storage key. Falls back to an anonymous key if no userId is available. */
function buildStorageKey(userId?: string): string {
  // Prefix with userId to prevent cross-account data leakage in shared sessions.
  const scope = userId ? `u_${userId}` : "anonymous";
  return `cc_resume_analysis_v2_${scope}`;
}

export interface StoredResumeAnalysis {
  /** ISO timestamp when the analysis was saved */
  savedAt: string;
  /** The user ID this analysis belongs to (absent for anonymous/unauthenticated) */
  userId?: string | undefined;
  data: ResumeAnalysisData;
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

export function saveResumeAnalysis(data: ResumeAnalysisData, userId?: string): void {
  try {
    const key = buildStorageKey(userId);
    const payload: StoredResumeAnalysis = {
      savedAt: new Date().toISOString(),
      ...(userId !== undefined ? { userId } : {}),
      data,
    };
    // sessionStorage: cleared when tab closes; not persisted across sessions.
    sessionStorage.setItem(key, JSON.stringify(payload));
    // Also clear any legacy localStorage entry from the old store version.
    _clearLegacyEntries();
    // Dispatch a custom event so other in-page listeners can react immediately.
    window.dispatchEvent(new CustomEvent("cc:resume-analysis-saved", { detail: payload }));
  } catch {
    // Storage quota exceeded or unavailable — fail silently.
  }
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export function loadResumeAnalysis(userId?: string): StoredResumeAnalysis | null {
  try {
    const key = buildStorageKey(userId);
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredResumeAnalysis;
    // Verify ownership: if userId is provided, ensure it matches the stored value.
    if (userId && parsed.userId && parsed.userId !== userId) {
      // Mismatch — another user's data; refuse to return it.
      sessionStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Clear
// ---------------------------------------------------------------------------

/** Clear the analysis for a specific user (call on logout). */
export function clearResumeAnalysis(userId?: string): void {
  try {
    const key = buildStorageKey(userId);
    sessionStorage.removeItem(key);
    // Also clear anonymous key in case it exists.
    sessionStorage.removeItem(buildStorageKey());
    _clearLegacyEntries();
    window.dispatchEvent(new CustomEvent("cc:resume-analysis-cleared"));
  } catch {
    // ignore
  }
}

/** Remove stale data from the old localStorage-based store (v1). */
function _clearLegacyEntries(): void {
  try {
    localStorage.removeItem("cc_resume_analysis_v1");
  } catch {
    // ignore — localStorage may be unavailable
  }
}
