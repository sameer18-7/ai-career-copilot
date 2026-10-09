import { useCallback, useRef, useState } from "react";
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_FILE_TYPES,
  INITIAL_RESUME_STATE,
  MAX_FILE_SIZE_BYTES,
  type ResumeAnalysisData,
  type ResumeFile,
  type ResumeState,
} from "@/lib/resume-types";
import { callMLService } from "@/lib/ml-service";
import { saveResumeAnalysis } from "@/lib/resume-store";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validateFile(file: File): string | null {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  const isValidType =
    ALLOWED_FILE_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(ext);

  if (!isValidType) return "Please upload a PDF, DOC, or DOCX file.";
  if (file.size > MAX_FILE_SIZE_BYTES) return "File size exceeds 10 MB. Please upload a smaller file.";
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}



// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useResume() {
  const [state, setState] = useState<ResumeState>(INITIAL_RESUME_STATE);
  const stateRef = useRef(state);
  stateRef.current = state;
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  // -------------------------------------------------------------------------
  // File selection
  // -------------------------------------------------------------------------

  /** Validate + select a local file. Moves to file_selected (waiting for role). */
  const selectFile = useCallback(
    (file: File) => {
      clearTimers();
      const error = validateFile(file);
      if (error) {
        setState({ status: "error", file: null, targetRole: "", analysisData: null, error });
        return;
      }
      const resumeFile: ResumeFile = {
        fileName: file.name,
        fileType: file.type || "." + file.name.split(".").pop()?.toLowerCase(),
        fileSize: file.size,
        source: "local",
        file,
      };
      setState({
        status: "file_selected",
        file: resumeFile,
        targetRole: "",
        analysisData: null,
        error: null,
      });
    },
    [clearTimers],
  );

  /** Placeholder for Google Drive — stores metadata only. */
  const selectGoogleDriveFile = useCallback(
    (meta: { fileName: string; fileType: string; fileSize: number }) => {
      clearTimers();
      const resumeFile: ResumeFile = { ...meta, source: "google_drive" };
      setState({
        status: "file_selected",
        file: resumeFile,
        targetRole: "",
        analysisData: null,
        error: null,
      });
    },
    [clearTimers],
  );

  // -------------------------------------------------------------------------
  // Role submission
  // -------------------------------------------------------------------------

  /**
   * User has entered and submitted a target role.
   * Validates non-empty. Transitions file_selected → role_submitted.
   * Returns an error string if validation fails (caller shows it inline).
   */
  const submitRole = useCallback((role: string): string | null => {
    const trimmed = role.trim();
    if (!trimmed) return "Please enter a target role before continuing.";
    setState((s) => ({
      ...s,
      targetRole: trimmed,
      status: "role_submitted",
      error: null,
    }));
    return null;
  }, []);

  // -------------------------------------------------------------------------
  // Analysis pipeline
  // -------------------------------------------------------------------------

  /**
   * Runs the full analysis: uploading → parsing → ml_analyzing → ready.
   * Calls the ML service with parsed resume data + target role.
   */
  const startProcessing = useCallback(async () => {
    clearTimers();

    setState((s) => ({ ...s, status: "uploading", error: null }));

    // Small delay so the user sees the "uploading" step
    await new Promise((r) => setTimeout(r, 600));

    setState((s) => ({ ...s, status: "parsing" }));

    // Simulate parsing delay
    await new Promise((r) => setTimeout(r, 900));

    setState((s) => ({ ...s, status: "ml_analyzing" }));

    const currentFile = stateRef.current.file;
    const currentTargetRole = stateRef.current.targetRole;

    try {
      // Call the ML service
      const analysisData = await callMLService({
        targetRole: currentTargetRole,
        file: currentFile?.file || null,
      });

      // Persist results globally so other pages (e.g. Interview Coach) can use them
      saveResumeAnalysis(analysisData);

      setState((s) => ({ ...s, status: "ready", analysisData }));
    } catch (err) {
      console.error("[Resume Analysis] ML service failed:", err);
      setState((s) => ({
        ...s,
        status: "error",
        error: "Analysis failed. Please try again.",
      }));
    }
  }, [clearTimers]);

  // -------------------------------------------------------------------------
  // Reset / retry
  // -------------------------------------------------------------------------

  /** Reset everything back to idle (clears file, role, results). */
  const reset = useCallback(() => {
    clearTimers();
    setState(INITIAL_RESUME_STATE);
  }, [clearTimers]);

  /**
   * Re-analyze: keep the current file + role, clear old results, re-run ML.
   * Called by the "Re-analyze" button in the results dashboard.
   */
  const reanalyze = useCallback(() => {
    clearTimers();
    setState((s) => ({
      ...s,
      status: "role_submitted",
      analysisData: null,
      error: null,
    }));
  }, [clearTimers]);

  /**
   * Change role: keep the current file, reset to file_selected so the
   * role question reappears. Clears old results.
   */
  const changeRole = useCallback(() => {
    clearTimers();
    setState((s) => ({
      ...s,
      status: "file_selected",
      targetRole: "",
      analysisData: null,
      error: null,
    }));
  }, [clearTimers]);

  /** Dismiss the error — go back to the most appropriate state. */
  const dismissError = useCallback(() => {
    setState((s) => {
      if (!s.file) return { ...INITIAL_RESUME_STATE };
      if (!s.targetRole) return { ...s, status: "file_selected", error: null };
      return { ...s, status: "role_submitted", error: null };
    });
  }, []);

  return {
    state,
    selectFile,
    selectGoogleDriveFile,
    submitRole,
    startProcessing,
    reset,
    reanalyze,
    changeRole,
    dismissError,
    formatFileSize,
  };
}
