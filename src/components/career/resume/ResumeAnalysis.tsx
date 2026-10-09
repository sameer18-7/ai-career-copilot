import { Button } from "@/components/ui/button";
import { Panel } from "@/components/career/shared";
import type { ResumeAnalysisData, ResumeFile } from "@/lib/resume-types";

// ---------------------------------------------------------------------------
// Helper sub-components
// ---------------------------------------------------------------------------

function Gauge({ value }: { value: number }) {
  const rating =
    value >= 80 ? "Excellent" : value >= 60 ? "Good" : value >= 40 ? "Fair" : "Needs Work";
  const color =
    value >= 80
      ? "var(--success)"
      : value >= 60
        ? "var(--primary)"
        : value >= 40
          ? "var(--warning)"
          : "var(--destructive)";

  return (
    <div
      className="relative grid size-40 shrink-0 place-items-center rounded-full"
      style={{ background: `conic-gradient(${color} ${value * 3.6}deg, var(--muted) 0)` }}
    >
      <div className="grid size-28 place-items-center rounded-full bg-card text-center">
        <div>
          <b className="text-3xl">{value}</b>
          <span className="text-muted-foreground">/100</span>
          <p className="text-xs font-bold" style={{ color }}>
            {rating}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span>{label}</span>
        <b>{value}%</b>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold text-primary">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ATS Score Panel
// ---------------------------------------------------------------------------

function ATSScorePanel({
  score,
  subScores,
  targetRole,
}: {
  score: number;
  subScores: ResumeAnalysisData["atsSubScores"];
  targetRole: string;
}) {
  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="font-bold">ATS Score</h2>
        {targetRole && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            for {targetRole}
          </span>
        )}
      </div>
      <div className="mt-5 flex flex-col items-center gap-7 sm:flex-row">
        <Gauge value={score} />
        <div className="flex-1 space-y-4">
          {subScores.map((s) => (
            <ProgressBar key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      </div>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Extracted Information Panel
// ---------------------------------------------------------------------------

function ExtractedInfoPanel({ data }: { data: ResumeAnalysisData }) {
  return (
    <Panel>
      <h2 className="font-bold">Extracted Information</h2>
      <div className="mt-5 space-y-5">
        {data.skills.length > 0 && (
          <Info title="Skills" value={data.skills.join(" · ")} />
        )}
        {data.education.length > 0 && (
          <Info
            title="Education"
            value={data.education.map((e) => `${e.degree} — ${e.institution}`).join("; ")}
          />
        )}
        {data.experience.length > 0 && (
          <Info
            title="Experience"
            value={data.experience.map((e) => `${e.title}, ${e.company} · ${e.duration}`).join("; ")}
          />
        )}
        {data.certifications.length > 0 && (
          <Info
            title="Certifications"
            value={data.certifications.map((c) => c.name).join(", ")}
          />
        )}
        {/* Fallback when parser hasn't produced structured data yet */}
        {data.skills.length === 0 &&
          data.education.length === 0 &&
          data.experience.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Extracted information will appear here once the resume parser is connected.
            </p>
          )}
      </div>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Suggested Keywords Panel (replaces "Missing Keywords")
// ---------------------------------------------------------------------------

function SuggestedKeywordsPanel({ keywords }: { keywords: string[] }) {
  if (keywords.length === 0) return null;
  return (
    <Panel>
      <h2 className="font-bold">Suggested Keywords</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Keywords suggested by our ML model based on your target role and resume.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {keywords.map((kw) => (
          <span
            key={kw}
            className="rounded-full bg-secondary px-3 py-2 text-xs font-bold text-primary"
          >
            + {kw}
          </span>
        ))}
      </div>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Target Role Panel — read-only display of the user-selected role
// ---------------------------------------------------------------------------

function TargetRolePanel({
  targetRole,
  onChangeRole,
}: {
  targetRole: string;
  onChangeRole: () => void;
}) {
  return (
    <Panel>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold">Target Role</p>
        <button
          onClick={onChangeRole}
          className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
        >
          Change
        </button>
      </div>
      <p className="mt-2 text-sm font-semibold text-foreground">{targetRole}</p>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Quick Fixes Panel — text-only, no checkboxes
// ---------------------------------------------------------------------------

function QuickFixesPanel({ fixes }: { fixes: string[] }) {
  if (fixes.length === 0) return null;
  return (
    <Panel>
      <h2 className="font-bold">Quick Fixes</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Recommendations from our ML model to strengthen your resume.
      </p>
      <div className="mt-4 space-y-3">
        {fixes.map((fix, i) => (
          <div
            key={i}
            className="rounded-xl bg-muted p-3 text-sm leading-relaxed text-foreground"
          >
            {fix}
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Main Analysis Layout
// ---------------------------------------------------------------------------

interface ResumeAnalysisProps {
  data: ResumeAnalysisData;
  file: ResumeFile;
  formatFileSize: (bytes: number) => string;
  onReanalyze: () => void;
  onUploadNew: () => void;
  onChangeRole: () => void;
}

export function ResumeAnalysis({
  data,
  file,
  formatFileSize,
  onReanalyze,
  onUploadNew,
  onChangeRole,
}: ResumeAnalysisProps) {
  return (
    <div className="space-y-5">
      {/* File + role info bar */}
      <Panel className="flex flex-wrap items-center gap-4 border-success/20 bg-success/5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-success/15">
          <svg
            className="size-5 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{file.fileName}</p>
          <p className="text-xs text-muted-foreground">
            Analysis complete · {formatFileSize(file.fileSize)} · Evaluated for{" "}
            <span className="font-semibold text-foreground">{data.targetRole}</span>
          </p>
        </div>
      </Panel>

      {/* Two-column analysis grid */}
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="space-y-5">
          <ATSScorePanel
            score={data.atsScore}
            subScores={data.atsSubScores}
            targetRole={data.targetRole}
          />
          <ExtractedInfoPanel data={data} />
        </div>
        <div className="space-y-5">
          <SuggestedKeywordsPanel keywords={data.suggestedKeywords} />
          <TargetRolePanel targetRole={data.targetRole} onChangeRole={onChangeRole} />
          <QuickFixesPanel fixes={data.quickFixes} />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="outline" onClick={onReanalyze}>
          Re-analyze
        </Button>
        <Button variant="outline" onClick={onUploadNew}>
          Upload New Resume
        </Button>
        <Button>Download Optimized Resume</Button>
      </div>
    </div>
  );
}
