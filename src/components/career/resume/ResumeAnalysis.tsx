import { Button } from "@/components/ui/button";
import { Panel } from "@/components/career/shared";
import type { ATSSubScore, ResumeAnalysisData, ResumeFile, SkillEvidence } from "@/lib/resume-types";

// ---------------------------------------------------------------------------
// Helper sub-components
// ---------------------------------------------------------------------------

function Gauge({ value, scoreType }: { value: number; scoreType?: string | undefined }) {
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
    <div className="flex flex-col items-center gap-2">
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
      <p className="text-[10px] text-muted-foreground text-center max-w-[160px]">
        {scoreType === "jd_based"
          ? "Job description-based estimate"
          : "Role profile-based estimate — not an official ATS score"}
      </p>
    </div>
  );
}

function ProgressBar({ subScore }: { subScore: ATSSubScore }) {
  const { label, rawScore, weight, weightedScore, explanation } = subScore;
  const pct = Math.round(rawScore ?? subScore.value ?? 0);
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          <b>{pct}%</b>
          {weight != null && (
            <span className="ml-1 opacity-60">× {Math.round(weight * 100)}% = {weightedScore?.toFixed(1) ?? "—"}pts</span>
          )}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      {explanation && (
        <p className="mt-1 text-[10px] text-muted-foreground leading-snug">{explanation}</p>
      )}
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
  scoreType,
  roleAlignment,
}: {
  score: number;
  subScores: ResumeAnalysisData["atsSubScores"];
  targetRole: string;
  scoreType?: string | undefined;
  roleAlignment?: number | undefined;
}) {
  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-bold">ATS/Readiness Score</h2>
          {roleAlignment != null && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Role alignment: <b>{roleAlignment}%</b>
            </p>
          )}
        </div>
        {targetRole && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            for {targetRole}
          </span>
        )}
      </div>
      <div className="mt-5 flex flex-col items-center gap-7 sm:flex-row">
        <Gauge value={score} scoreType={scoreType} />
        <div className="flex-1 space-y-4">
          {subScores.map((s) => (
            <ProgressBar key={s.label} subScore={s} />
          ))}
        </div>
      </div>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Matched & Missing Skills Panel
// ---------------------------------------------------------------------------

function SkillMatchPanel({
  matched,
  missingRequired,
  missingPreferred,
}: {
  matched: string[];
  missingRequired: string[];
  missingPreferred: string[];
}) {
  if (!matched.length && !missingRequired.length && !missingPreferred.length) return null;

  return (
    <Panel>
      <h2 className="font-bold">Skill Match</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Required skills confirmed in your resume vs. not yet evidenced.
      </p>

      {matched.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-success mb-2">✓ Evidenced</p>
          <div className="flex flex-wrap gap-1.5">
            {matched.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {missingRequired.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-destructive mb-2">✗ Required — not evidenced</p>
          <div className="flex flex-wrap gap-1.5">
            {missingRequired.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive"
              >
                {skill}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            "Not evidenced" means these skills were not found in your resume — it does not mean you lack them.
          </p>
        </div>
      )}

      {missingPreferred.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-warning mb-2">◎ Preferred — not evidenced</p>
          <div className="flex flex-wrap gap-1.5">
            {missingPreferred.slice(0, 8).map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Evidence Panel
// ---------------------------------------------------------------------------

function EvidencePanel({ evidence }: { evidence: SkillEvidence[] }) {
  if (!evidence || evidence.length === 0) return null;

  const sourceLabel: Record<SkillEvidence["source"], string> = {
    skills_section: "Skills section",
    experience: "Work experience",
    project: "Project",
    text_mention: "Resume text",
  };

  const bySource = evidence.reduce<Record<string, SkillEvidence[]>>((acc, e) => {
    const key = e.source;
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  return (
    <Panel>
      <h2 className="font-bold">Skill Evidence</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Where each matched skill was found in your resume.
      </p>
      <div className="mt-4 space-y-3">
        {Object.entries(bySource).map(([src, items]) => (
          <div key={src}>
            <p className="text-xs font-semibold text-primary mb-1.5">
              {sourceLabel[src as SkillEvidence["source"]] ?? src}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {items.map((e) => (
                <span
                  key={e.skill}
                  title={e.evidence}
                  className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary cursor-help"
                >
                  {e.skill}
                </span>
              ))}
            </div>
          </div>
        ))}
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
        {data.predictedCategory && (
          <div>
            <p className="text-xs font-bold text-primary">Predicted Category</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.predictedCategory}
              <span className="ml-1 text-[10px] opacity-60">(TF-IDF classifier)</span>
            </p>
          </div>
        )}
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
// Suggested Keywords Panel
// ---------------------------------------------------------------------------

function SuggestedKeywordsPanel({ keywords }: { keywords: string[] }) {
  if (keywords.length === 0) return null;
  return (
    <Panel>
      <h2 className="font-bold">Suggested Keywords</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Keywords to consider adding for your target role.
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
// Target Role Panel
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
// Quick Fixes Panel
// ---------------------------------------------------------------------------

function QuickFixesPanel({ fixes }: { fixes: string[] }) {
  if (fixes.length === 0) return null;
  return (
    <Panel>
      <h2 className="font-bold">Quick Fixes</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Recommendations to strengthen your resume for this role.
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
  const hasSkillMatch =
    (data.matchedSkills?.length ?? 0) > 0 ||
    (data.missingRequiredSkills?.length ?? 0) > 0 ||
    (data.missingPreferredSkills?.length ?? 0) > 0;

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
            scoreType={data.scoreType}
            roleAlignment={data.roleAlignment}
          />
          {hasSkillMatch && (
            <SkillMatchPanel
              matched={data.matchedSkills ?? []}
              missingRequired={data.missingRequiredSkills ?? []}
              missingPreferred={data.missingPreferredSkills ?? []}
            />
          )}
          <ExtractedInfoPanel data={data} />
        </div>
        <div className="space-y-5">
          {data.evidence && data.evidence.length > 0 && (
            <EvidencePanel evidence={data.evidence} />
          )}
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
