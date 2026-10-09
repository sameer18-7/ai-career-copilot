import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Panel } from "@/components/career/shared";
import { Skeleton } from "@/components/ui/skeleton";
import type { ResumeAnalysisStatus } from "@/lib/resume-types";

interface ResumeProcessingProps {
  status: ResumeAnalysisStatus;
  fileName: string;
  targetRole: string;
}

// Steps mapped to the new status values
const STEPS = [
  { key: "uploading",    label: "Uploading resume" },
  { key: "parsing",      label: "Parsing resume content" },
  { key: "ml_analyzing", label: "" }, // label built dynamically with targetRole
] as const;

type StepKey = (typeof STEPS)[number]["key"];

const ORDER: Record<StepKey, number> = { uploading: 0, parsing: 1, ml_analyzing: 2 };

function stepState(
  stepKey: StepKey,
  currentStatus: ResumeAnalysisStatus,
): "done" | "active" | "pending" {
  const current = ORDER[currentStatus as StepKey] ?? -1;
  const target = ORDER[stepKey];
  if (current > target) return "done";
  if (current === target) return "active";
  return "pending";
}

export function ResumeProcessing({ status, fileName, targetRole }: ResumeProcessingProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 450);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-5">
      {/* Progress panel */}
      <Panel>
        <h2 className="text-lg font-extrabold">Analyzing your resume</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Processing{" "}
          <span className="font-semibold text-foreground">{fileName}</span>
          {targetRole && (
            <>
              {" "}for{" "}
              <span className="font-semibold text-primary">{targetRole}</span>
            </>
          )}
        </p>

        <div className="mt-6 space-y-4">
          {STEPS.map(({ key }) => {
            const s = stepState(key, status);
            const label =
              key === "ml_analyzing"
                ? `Analyzing for "${targetRole}"`
                : key === "uploading"
                ? "Uploading resume"
                : "Parsing resume content";

            return (
              <div key={key} className="flex items-center gap-3">
                {s === "done" ? (
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-success/15">
                    <Check className="size-3.5 text-success" />
                  </span>
                ) : s === "active" ? (
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/15">
                    <Loader2 className="size-3.5 animate-spin text-primary" />
                  </span>
                ) : (
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted">
                    <span className="size-2 rounded-full bg-muted-foreground/40" />
                  </span>
                )}

                <span
                  className={
                    "text-sm font-semibold " +
                    (s === "done"
                      ? "text-success"
                      : s === "active"
                        ? "text-foreground"
                        : "text-muted-foreground")
                  }
                >
                  {label}
                  {s === "active" && dots}
                </span>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Skeleton placeholders */}
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="space-y-5">
          <Panel>
            <Skeleton className="mb-4 h-5 w-28" />
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <Skeleton className="size-40 shrink-0 rounded-full" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-3/5" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          </Panel>
          <Panel>
            <Skeleton className="mb-4 h-5 w-44" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </Panel>
        </div>
        <div className="space-y-5">
          <Panel>
            <Skeleton className="mb-4 h-5 w-40" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full" />
              ))}
            </div>
          </Panel>
          <Panel>
            <Skeleton className="mb-4 h-5 w-24" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
