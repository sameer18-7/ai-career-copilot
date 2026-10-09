import { useRef, useState } from "react";
import { FileText, File, X, ChevronDown, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/career/shared";
import { SUGGESTED_ROLES, type ResumeFile } from "@/lib/resume-types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function FileIcon({ fileName }: { fileName: string }) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return <FileText className="size-5 text-red-500" />;
  if (ext === "doc" || ext === "docx") return <File className="size-5 text-blue-500" />;
  return <FileText className="size-5 text-primary" />;
}

// ---------------------------------------------------------------------------
// Role combobox — text input with dropdown suggestions
// ---------------------------------------------------------------------------

interface RoleInputProps {
  value: string;
  onChange: (v: string) => void;
  error: string | null;
}

function RoleCombobox({ value, onChange, error }: RoleInputProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = value.trim()
    ? SUGGESTED_ROLES.filter((r) => r.toLowerCase().includes(value.toLowerCase()))
    : SUGGESTED_ROLES;

  const pick = (role: string) => {
    onChange(role);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Briefcase className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="target-role-input"
          placeholder="e.g. Backend Developer"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Delay so click on suggestion registers first
            setTimeout(() => setOpen(false), 150);
          }}
          className={`pl-9 pr-9 ${error ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
          autoComplete="off"
          aria-label="Target role"
          aria-expanded={open}
          aria-haspopup="listbox"
        />
        <button
          type="button"
          aria-label="Show role suggestions"
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          onMouseDown={(e) => {
            e.preventDefault();
            setOpen((o) => !o);
          }}
        >
          <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {error && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}

      {open && filtered.length > 0 && (
        <ul
          role="listbox"
          aria-label="Suggested roles"
          className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border bg-card shadow-panel"
        >
          {filtered.map((role) => (
            <li key={role}>
              <button
                type="button"
                role="option"
                aria-selected={value === role}
                className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted ${value === role ? "font-semibold text-primary" : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(role);
                }}
              >
                <Briefcase className="size-3.5 shrink-0 text-muted-foreground" />
                {role}
              </button>
            </li>
          ))}
          {value.trim() && !SUGGESTED_ROLES.includes(value.trim()) && (
            <li>
              <button
                type="button"
                className="flex w-full items-center gap-2 border-t px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(value.trim());
                }}
              >
                <span className="text-muted-foreground">Use</span>
                <span className="font-semibold text-foreground">"{value.trim()}"</span>
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FileSourceSelector
// Renders two sub-states based on the flow:
//
//  WAITING_FOR_ROLE  (status === "file_selected")
//    → file card + "Which role are you looking for?" + Submit
//
//  READY_TO_ANALYZE  (status === "role_submitted")
//    → file card + target role chip + Analyze Resume + Change File
// ---------------------------------------------------------------------------

interface FileSourceSelectorProps {
  file: ResumeFile;
  targetRole: string;
  isWaitingForRole: boolean;        // true when status === "file_selected"
  formatFileSize: (bytes: number) => string;
  onSubmitRole: (role: string) => string | null;  // returns error string or null
  onAnalyze: () => void;
  onChangeFile: (file: File) => void;
  onReset: () => void;
}

export function FileSourceSelector({
  file,
  targetRole,
  isWaitingForRole,
  formatFileSize,
  onSubmitRole,
  onAnalyze,
  onChangeFile,
  onReset,
}: FileSourceSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [roleInput, setRoleInput] = useState(targetRole);
  const [roleError, setRoleError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onChangeFile(f);
    e.target.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = onSubmitRole(roleInput);
    setRoleError(err);
  };

  return (
    <Panel className="border-primary/30 bg-secondary/30">
      {/* File header row */}
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10">
          <FileIcon fileName={file.fileName} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{file.fileName}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatFileSize(file.fileSize)}
            {file.source === "google_drive" && " · Google Drive"}
          </p>
        </div>

        <button
          aria-label="Remove file"
          className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={onReset}
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Divider */}
      <div className="my-4 border-t" />

      {isWaitingForRole ? (
        /* ----------------------------------------------------------------
           STATE: file_selected — Ask for target role
        ---------------------------------------------------------------- */
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm font-bold">Which role are you looking for?</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Your resume will be evaluated specifically for this role.
            </p>
          </div>

          <RoleCombobox
            value={roleInput}
            onChange={(v) => {
              setRoleInput(v);
              if (roleError) setRoleError(null);
            }}
            error={roleError}
          />

          <div className="flex justify-end">
            <Button type="submit" className="min-w-[100px]">
              Submit
            </Button>
          </div>
        </form>
      ) : (
        /* ----------------------------------------------------------------
           STATE: role_submitted — Show role badge + action buttons
        ---------------------------------------------------------------- */
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Target Role:</span>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {targetRole}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={onAnalyze}>
              Analyze Resume
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Change File
            </Button>
          </div>
        </div>
      )}

      {/* Hidden native file input for Change File */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={handleFileChange}
      />
    </Panel>
  );
}
