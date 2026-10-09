import { useRef } from "react";
import {
  Upload,
  FileText,
  Target,
  Search,
  Sparkles,
  CheckCircle2,
  CloudUpload,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/career/shared";

interface ResumeUploadProps {
  onFileSelect: (file: File) => void;
}

const VALUE_ITEMS = [
  { icon: Target, label: "ATS Score" },
  { icon: Search, label: "Missing Keywords" },
  { icon: FileText, label: "Target Role Analysis" },
  { icon: CheckCircle2, label: "Resume Information Extraction" },
  { icon: Zap, label: "Quick Fixes" },
  { icon: Sparkles, label: "Personalized Recommendations" },
];

export function ResumeUpload({ onFileSelect }: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  return (
    <div className="space-y-5">
      {/* Upload hero panel */}
      <Panel className="border-dashed border-primary/40 bg-secondary/50 text-center">
        <div className="mx-auto max-w-lg py-6">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10">
            <Upload className="size-7 text-primary" />
          </div>

          <h2 className="mt-5 text-xl font-extrabold">
            Upload your resume to get personalized insights
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Get an instant ATS score, keyword analysis, extracted information,
            and actionable quick fixes — all powered by AI.
          </p>

          {/* File picker buttons */}
          <div className="mx-auto mt-6 flex max-w-sm flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1 gap-2"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="size-4" />
              Upload from Device
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => {
                // Google Drive integration placeholder
                // When configured, this will open the Google Picker API.
                alert(
                  "Google Drive integration is coming soon.\nPlease upload from your device for now.",
                );
              }}
            >
              <CloudUpload className="size-4" />
              Choose from Google Drive
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Supported formats: PDF, DOC, DOCX · Max 10 MB
          </p>

          {/* Hidden native file input */}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </Panel>

      {/* Value proposition */}
      <Panel>
        <h3 className="font-bold">You will receive</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {VALUE_ITEMS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl bg-muted/60 p-3"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10">
                <Icon className="size-4 text-primary" />
              </span>
              <span className="text-sm font-semibold">{label}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
