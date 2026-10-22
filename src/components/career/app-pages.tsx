import { Bar, BarChart, CartesianGrid, Line, LineChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, Bell, BookOpen, Bookmark, BriefcaseBusiness, Check, CirclePlay, Clock, Code2, FileCheck2, FileText, GraduationCap, Lock, MessageSquareText, Mic, Sparkles, Target, TrendingUp, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AppShell, IconBadge, MetricCard, Panel } from "./shared";
import { useResume } from "@/hooks/use-resume";
import { ResumeUpload, FileSourceSelector, ResumeProcessing, ResumeAnalysis } from "./resume";
import { loadResumeAnalysis } from "@/lib/resume-store";
import type { StoredResumeAnalysis } from "@/lib/resume-store";
import { Link } from "@tanstack/react-router";

// ---------------------------------------------------------------------------
// Static fallback data (used when resume analysis is not yet available)
// ---------------------------------------------------------------------------

const SAMPLE_LEARNING = [{m:"Jan",v:22},{m:"Feb",v:34},{m:"Mar",v:48},{m:"Apr",v:45},{m:"May",v:67},{m:"Jun",v:82}];
const SAMPLE_SKILL_GAPS = [["System Design",42],["AWS",55],["Docker",68],["Communication",79]] as const;
const SAMPLE_ACTIVITY: [any, string, string][] = [
  [FileText, "Resume score improved to 87%", "10 min ago"],
  [BookOpen, "Completed Docker fundamentals", "Yesterday"],
  [BriefcaseBusiness, "Applied to Product Engineer at Nova", "2 days ago"],
];

// ---------------------------------------------------------------------------
// Dashboard Page
// ---------------------------------------------------------------------------

export function DashboardPage() {
  const [stored, setStored] = useState<StoredResumeAnalysis | null>(null);

  useEffect(() => {
    const s = loadResumeAnalysis();
    if (s) setStored(s);

    const onSaved = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.data) setStored(detail);
    };
    window.addEventListener("cc:resume-analysis-saved", onSaved);
    return () => window.removeEventListener("cc:resume-analysis-saved", onSaved);
  }, []);

  const analysis = stored?.data ?? null;

  // -- Derived values from analysis (with fallbacks) --
  const candidateName = analysis?.candidate?.name || "Maya";
  const atsScore = analysis ? `${analysis.atsScore}%` : "87%";
  const atsTrend = analysis
    ? analysis.atsScore >= 75 ? "Strong match" : analysis.atsScore >= 55 ? "Moderate match" : "Needs work"
    : "8.5%";

  const skills = analysis?.skills ?? [];
  const gaps = analysis?.suggestedKeywords ?? [];
  const targetRole = analysis?.targetRole ?? "Backend Engineer";

  // Build skill-gap bar data: use ML gaps with a heuristic score, fallback to sample
  const skillGapBars: [string, number][] = gaps.length > 0
    ? gaps.slice(0, 4).map((g, i) => [g, Math.max(25, 65 - i * 12)] as [string, number])
    : Array.from(SAMPLE_SKILL_GAPS, (t) => [t[0], t[1]] as [string, number]);

  // Build radar data from resume skills + market baseline
  const radarData = skills.length > 0
    ? skills.slice(0, 6).map((s, i) => ({
        s,
        you: Math.min(95, 60 + (i % 3) * 10 + (s.length % 20)),
        market: 75 + (i % 3) * 5,
      }))
    : [
        {s:"Python",you:86,market:90},{s:"Docker",you:48,market:78},
        {s:"AWS",you:40,market:82},{s:"SQL",you:76,market:80},
        {s:"System Design",you:46,market:88},{s:"Git",you:84,market:72},
      ];

  // ATS sub-scores for chart if available
  const subScoreChart = analysis?.atsSubScores?.length
    ? analysis.atsSubScores.map((s) => ({ k: s.label, v: s.value }))
    : null;

  // Activity feed: personalise first item if we have analysis
  const activityFeed: [any, string, string][] = analysis
    ? [
        [FileCheck2, `Resume analyzed — ATS score ${analysis.atsScore}% for ${analysis.targetRole}`, stored?.savedAt ? new Date(stored.savedAt).toLocaleTimeString() : "Just now"],
        ...SAMPLE_ACTIVITY.slice(1),
      ]
    : SAMPLE_ACTIVITY;

  // Notifications: personalise from analysis
  const notifications = analysis
    ? [
        gaps.length > 0 ? `Add these skills to your resume: ${gaps.slice(0, 2).join(", ")}` : "3 new job matches",
        `Target role detected: ${targetRole}`,
        analysis.quickFixes?.[0] ?? "Resume keyword suggestion",
      ]
    : ["3 new job matches", "Quiz ready: AWS Basics", "Resume keyword suggestion"];

  return (
    <AppShell
      title={`Welcome back, ${candidateName.split(" ")[0]}`}
      subtitle={analysis
        ? `Targeting ${targetRole} · Resume analyzed ${stored?.savedAt ? new Date(stored.savedAt).toLocaleDateString() : "recently"}`
        : "Here's what is moving your career forward today."
      }
      action={
        <Button asChild>
          <Link to="/resume"><Upload className="size-4 mr-1.5" /> Upload Resume</Link>
        </Button>
      }
    >
      {/* Top metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="ATS Score" value={atsScore} trend={atsTrend} icon={<FileCheck2 />} />
        <MetricCard
          label="Skill Gaps"
          value={`${gaps.length || 4} found`}
          trend={gaps.length > 0 ? `${skills.length} skills detected` : "2 closed"}
          icon={<Target />}
          tone="warning"
        />
        <MetricCard label="Applications" value="24" trend="12.4%" icon={<BriefcaseBusiness />} tone="success" />
        <MetricCard label="Interview Score" value="8.6" trend="6.2%" icon={<MessageSquareText />} tone="coral" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_.8fr]">
        <div className="space-y-5">

          {/* Learning Progress */}
          <Panel>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-bold">Learning Progress</h2>
                <p className="text-xs text-muted-foreground">Skill mastery across the last 6 months</p>
              </div>
              <span className="rounded-lg bg-secondary px-3 py-1 text-xs font-bold text-primary">+60%</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={SAMPLE_LEARNING}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="m" axisLine={false} />
                  <YAxis axisLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={4} dot={{r:4,fill:"var(--primary)"}} activeDot={{r:7}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          {/* ATS Sub-scores from ML (if available) */}
          {subScoreChart && (
            <Panel>
              <h2 className="font-bold">Resume Quality Breakdown</h2>
              <p className="text-xs text-muted-foreground mt-1">From your last AI resume analysis</p>
              <div className="mt-5 h-52">
                <ResponsiveContainer>
                  <BarChart data={subScoreChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="k" tick={{ fontSize: 11 }} axisLine={false} />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="v" radius={8} fill="var(--primary)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          )}

          {/* Recent Activity */}
          <Panel>
            <h2 className="font-bold">Recent Activity</h2>
            <div className="mt-4 divide-y">
              {activityFeed.map(([I, t, d]) => (
                <div key={t} className="flex items-center gap-3 py-4">
                  <IconBadge><I /></IconBadge>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{t}</p>
                    <p className="text-xs text-muted-foreground">{d}</p>
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          {/* Skill Gap Breakdown */}
          <Panel>
            <h2 className="font-bold">Skill Gaps{analysis ? " · From Your Resume" : ""}</h2>
            <div className="mt-5 space-y-5">
              {skillGapBars.map(([s, n]) => (
                <div key={s}>
                  <div className="mb-2 flex justify-between text-xs">
                    <b>{s}</b>
                    <span>{n}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${n}%` }} />
                  </div>
                </div>
              ))}
              {gaps.length === 0 && !analysis && (
                <p className="text-xs text-muted-foreground mt-2">
                  <Link to="/resume" className="text-primary underline underline-offset-2">Analyze your resume</Link> to see real gaps.
                </p>
              )}
            </div>
          </Panel>

          {/* Skills detected from resume */}
          {skills.length > 0 && (
            <Panel>
              <h2 className="font-bold">Detected Skills</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.slice(0, 12).map((skill) => (
                  <span key={skill} className="rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 text-[11px] font-semibold text-primary">
                    {skill}
                  </span>
                ))}
              </div>
              {skills.length > 12 && (
                <p className="mt-2 text-xs text-muted-foreground">+{skills.length - 12} more skills detected</p>
              )}
            </Panel>
          )}

          {/* Mock Interview CTA */}
          <Panel className="bg-primary text-primary-foreground">
            <div className="flex items-center justify-between">
              <IconBadge tone="warning"><Mic /></IconBadge>
              <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs">
                {analysis ? targetRole : "Tomorrow"}
              </span>
            </div>
            <h2 className="mt-5 font-bold">Mock Interview</h2>
            <p className="mt-1 text-sm text-primary-foreground/70">
              {analysis
                ? `${analysis.suggestedKeywords?.length || 0} skill gaps to practice · Personalized questions ready`
                : "Backend Engineer · 4:00 PM"}
            </p>
            <Button variant="hero" className="mt-5 w-full" asChild>
              <Link to="/interviews">Prepare now</Link>
            </Button>
          </Panel>

          {/* Notifications */}
          <Panel>
            <h2 className="flex items-center gap-2 font-bold">
              <Bell className="size-4" /> Notifications
            </h2>
            <div className="mt-3 space-y-3">
              {notifications.map((x) => (
                <div key={x} className="rounded-xl bg-muted p-3 text-xs font-medium">{x}</div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <JobStrip targetRole={targetRole} />
    </AppShell>
  );
}

function JobStrip({ targetRole }: { targetRole: string }) {
  return (
    <Panel className="mt-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">Top Job Matches{targetRole ? ` for ${targetRole}` : ""}</h2>
        <Button variant="link" asChild><Link to="/jobs">View all</Link></Button>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {[
          ["N", "Product Engineer", "Nova Labs", "94%"],
          ["A", "Backend Developer", "Astra", "91%"],
          ["V", "Data Analyst", "Vertex", "88%"],
        ].map(([l, r, c, m]) => (
          <div key={c} className="rounded-xl border p-4">
            <div className="flex items-start gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-secondary font-bold text-primary">{l}</span>
              <div className="min-w-0">
                <b className="block truncate text-sm">{r}</b>
                <span className="text-xs text-muted-foreground">{c}</span>
              </div>
              <span className="ml-auto text-xs font-bold text-success">{m}</span>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">₹10–16 LPA · Remote</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function ResumePage() {
  const {
    state,
    selectFile,
    submitRole,
    startProcessing,
    reset,
    reanalyze,
    changeRole,
    dismissError,
    formatFileSize,
  } = useResume();
  const { status, file, targetRole, analysisData, error } = state;

  const isProcessing =
    status === "uploading" || status === "parsing" || status === "ml_analyzing";

  const subtitle =
    status === "ready"
      ? `Resume analyzed for: ${targetRole}`
      : status === "file_selected" || status === "role_submitted"
        ? "Tell us which role you're targeting for a tailored analysis."
        : "Upload your resume to get an instant AI-powered breakdown.";

  return (
    <AppShell title="Resume Analyzer" subtitle={subtitle}>
      {/* Error banner */}
      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="flex-1 text-sm font-medium text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={dismissError}>
            Dismiss
          </Button>
          {file && status === "error" && targetRole && (
            <Button size="sm" onClick={() => { dismissError(); startProcessing(); }}>
              Retry
            </Button>
          )}
        </div>
      )}

      {/* NO_RESUME — upload onboarding */}
      {status === "idle" && (
        <ResumeUpload onFileSelect={selectFile} />
      )}

      {/* RESUME_SELECTED (waiting for role) + ROLE_SUBMITTED (ready to analyze) */}
      {(status === "file_selected" || status === "role_submitted") && file && (
        <FileSourceSelector
          file={file}
          targetRole={targetRole}
          isWaitingForRole={status === "file_selected"}
          formatFileSize={formatFileSize}
          onSubmitRole={submitRole}
          onAnalyze={startProcessing}
          onChangeFile={selectFile}
          onReset={reset}
        />
      )}

      {/* UPLOADING / PARSING / ML_ANALYZING */}
      {isProcessing && file && (
        <ResumeProcessing
          status={status}
          fileName={file.fileName}
          targetRole={targetRole}
        />
      )}

      {/* ANALYSIS_COMPLETE */}
      {status === "ready" && analysisData && file && (
        <ResumeAnalysis
          data={analysisData}
          file={file}
          formatFileSize={formatFileSize}
          onReanalyze={reanalyze}
          onUploadNew={reset}
          onChangeRole={changeRole}
        />
      )}

      {/* ERROR with no message — fallback to upload */}
      {status === "error" && !error && (
        <ResumeUpload onFileSelect={selectFile} />
      )}
    </AppShell>
  );
}
export function LearningPage(){const skillData=[{s:"Python",you:86,market:90},{s:"Docker",you:48,market:78},{s:"AWS",you:40,market:82},{s:"SQL",you:76,market:80},{s:"System Design",you:46,market:88},{s:"Git",you:84,market:72}];const learning=[{v:22},{v:34},{v:48},{v:45},{v:67},{v:82}];return <AppShell title="Your Skill Gap & Learning Path" subtitle="A focused roadmap to become a job-ready Backend Engineer." action={<select className="h-10 rounded-xl border bg-card px-3 text-sm"><option>Backend Engineer</option></select>}><Panel><div className="grid gap-8 lg:grid-cols-[1fr_.7fr]"><div className="h-80"><ResponsiveContainer><RadarChart data={skillData}><PolarGrid/><PolarAngleAxis dataKey="s" tick={{fontSize:11}}/><Radar dataKey="market" stroke="var(--warning)" fill="var(--warning)" fillOpacity={.15}/><Radar dataKey="you" stroke="var(--primary)" fill="var(--primary)" fillOpacity={.3}/></RadarChart></ResponsiveContainer></div><div className="self-center"><h2 className="text-2xl font-extrabold">Close 4 high-impact gaps</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Your foundation is strong. Focus on cloud infrastructure and system design to match current hiring demand.</p><div className="mt-5 flex gap-4 text-xs"><span className="font-bold text-primary">● Your skills</span><span className="font-bold text-warning">● Market demand</span></div></div></div></Panel><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["AWS","Critical"],["System Design","Critical"],["Docker","Moderate"],["Testing","Minor"]].map(([s,t])=><Panel key={s}><IconBadge tone={t==="Critical"?"coral":"warning"}><Code2/></IconBadge><h3 className="mt-4 font-bold">{s}</h3><span className="mt-2 inline-block rounded-full bg-muted px-2 py-1 text-[10px] font-bold">{t}</span><Button size="sm" className="mt-4 w-full">Start Learning</Button></Panel>)}</div><div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_.6fr]"><Panel><h2 className="font-bold">Your Roadmap</h2><div className="mt-6 space-y-4">{[["Backend Foundations","Completed",100],["Docker & Containers","In Progress",68],["AWS Essentials","Not Started",0],["Scalable System Design","Locked",0]].map(([s,status,n],i)=><div key={s as string} className="grid grid-cols-[40px_1fr_auto] gap-3 rounded-xl border p-4"><span className={"grid size-9 place-items-center rounded-full font-bold "+(i===0?"bg-success text-primary-foreground":i===1?"bg-warning text-foreground":"bg-muted text-muted-foreground")}>{i<3?i+1:<Lock className="size-4"/>}</span><div><b className="text-sm">{s as string}</b><p className="text-xs text-muted-foreground">{status as string} · 3–5 hours</p><div className="mt-2 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{width:`${n}%`}}/></div></div><Button size="sm" variant={i<2?"default":"outline"} disabled={i===3}>{i===1?"Continue":"Open"}</Button></div>)}</div></Panel><Panel className="h-fit xl:sticky xl:top-24"><div className="flex items-center justify-between"><IconBadge tone="coral"><Sparkles/></IconBadge><span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-bold text-primary">MEDIUM</span></div><h2 className="mt-5 font-bold">Adaptive Quiz</h2><p className="mt-2 text-sm text-muted-foreground">Docker networking · 10 questions</p><div className="mt-5 h-20"><ResponsiveContainer><LineChart data={learning}><Line dataKey="v" stroke="var(--success)" strokeWidth={3} dot={false}/></LineChart></ResponsiveContainer></div><Button className="mt-3 w-full">Start Quiz</Button></Panel></div><Panel className="mt-5"><h2 className="font-bold">Recommended Resources</h2><div className="mt-4 grid gap-4 md:grid-cols-3">{([[CirclePlay,"Docker in 100 Minutes","Video · 1h 40m"],[BookOpen,"Designing Data-Intensive Apps","Article · 18m"],[GraduationCap,"AWS Cloud Foundations","Course · 6h"]] as const).map(([I,t,d])=><div key={t as string} className="rounded-xl bg-muted p-4"><div className="flex justify-between"><I className="text-primary"/><Bookmark className="size-4"/></div><b className="mt-6 block text-sm">{t as string}</b><p className="mt-1 text-xs text-muted-foreground">{d as string}</p></div>)}</div></Panel></AppShell>}
