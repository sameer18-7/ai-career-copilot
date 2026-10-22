import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bookmark,
  Check,
  Eye,
  EyeOff,
  Filter,
  Mic,
  Play,
  Rocket,
  Search,
  Sparkles,
  Star,
  Timer,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AppShell, CtaBanner, Footer, IconBadge, MarketingNav, MetricCard, Panel, SectionHeading } from "./shared";
import { FeaturePageHeader, FeatureVisual, features } from "./marketing";
import { signIn, signInWithCredentials } from "@/lib/auth-client";
import { loadResumeAnalysis } from "@/lib/resume-store";
import { generateInterviewQuestions, type QuestionCategory } from "@/lib/interview-questions";
import type { ResumeAnalysisData } from "@/lib/resume-types";
import { evaluateAnswer, type EvaluationResult } from "@/lib/answer-evaluator";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { useRef } from "react";

/* ---------------------------------- Features ---------------------------------- */

const comparison: [string, boolean, boolean][] = [
  ["AI resume rewriting", true, false],
  ["Live skill-gap scoring", true, false],
  ["Adaptive learning roadmap", true, false],
  ["Mock interviews with feedback", true, false],
  ["Ranked job matching", true, true],
  ["Career analytics dashboard", true, false],
];

export function FeaturesPage() {
  return (
    <>
      <FeaturePageHeader />
      <div className="space-y-0">
        {features.map(([Icon, title, copy], i) => (
          <section key={title} className={cn("px-5 py-20", i % 2 === 1 && "bg-card")}>
            <div
              className={cn(
                "mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2",
                i % 2 === 1 && "lg:[&>*:first-child]:order-2",
              )}
            >
              <div>
                <IconBadge tone={(["primary", "warning", "success", "coral", "primary"] as const)[i]!}>
                  <Icon />
                </IconBadge>
                <h2 className="mt-5 text-3xl font-extrabold md:text-4xl">{title}</h2>
                <p className="mt-4 leading-7 text-muted-foreground">{copy}</p>
                <ul className="mt-6 space-y-3 text-sm">
                  {["Context shared across every module", "Recommendations update as you progress", "Built for student timelines"].map((x) => (
                    <li key={x} className="flex items-center gap-3">
                      <span className="grid size-6 place-items-center rounded-full bg-success/15 text-success">
                        <Check className="size-3.5" />
                      </span>
                      {x}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-8">
                  <Link to="/signup">
                    Try {title} <ArrowRight />
                  </Link>
                </Button>
              </div>
              <FeatureVisual kind={i} />
            </div>
          </section>
        ))}
      </div>
      <section className="px-5 py-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeading center eyebrow="Comparison" title="Why students switch to one platform" />
          <Panel className="mt-10 overflow-x-auto p-0">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4 font-bold">Capability</th>
                  <th className="p-4 font-bold text-primary">AI Career Copilot</th>
                  <th className="p-4 font-bold text-muted-foreground">Generic job boards</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map(([label, a, b]) => (
                  <tr key={label} className="border-b last:border-0">
                    <td className="p-4 font-semibold">{label}</td>
                    <td className="p-4">{a ? <Check className="size-5 text-success" /> : <X className="size-5 text-muted-foreground" />}</td>
                    <td className="p-4">{b ? <Check className="size-5 text-success" /> : <X className="size-5 text-muted-foreground" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
      </section>
      <CtaBanner />
      <Footer />
    </>
  );
}

/* ---------------------------------- Pricing ---------------------------------- */

const plans = [
  { name: "Student", monthly: 0, yearly: 0, blurb: "Everything to get started", perks: ["Resume analyzer (3/mo)", "Skill gap snapshot", "10 job matches", "Community support"] },
  { name: "Pro", monthly: 12, yearly: 108, blurb: "For active job seekers", perks: ["Unlimited resume analyses", "Adaptive learning path", "Unlimited mock interviews", "Priority job matching", "Career analytics"] },
  { name: "Campus", monthly: null, yearly: null, blurb: "For universities & bootcamps", perks: ["Cohort dashboards", "Placement reporting", "SSO & onboarding", "Dedicated success manager"] },
];

const faqs: [string, string][] = [
  ["Is there a free plan?", "Yes. The Student plan is free forever and includes the core resume and job matching tools."],
  ["Can I cancel anytime?", "Absolutely. Pro is month-to-month and you keep access until the end of your billing period."],
  ["Do you offer student discounts?", "Pro is already student-priced, and verified campus partners get additional volume pricing."],
  ["How does Campus billing work?", "Campus plans are quoted per cohort size with annual invoicing and onboarding included."],
];

const planMatrix: [string, string | boolean, string | boolean, string | boolean][] = [
  ["Resume analyzer", "3 / month", "Unlimited", "Unlimited"],
  ["ATS score & fixes", true, true, true],
  ["Skill gap analysis", "Snapshot", "Full radar", "Full radar"],
  ["Learning paths", "1", "Unlimited", "Unlimited"],
  ["Adaptive quizzes", false, true, true],
  ["AI tutor", false, true, true],
  ["Interview coach", "1 session", "Unlimited", "Unlimited"],
  ["Job matching", "10 matches", "Priority", "Priority"],
  ["Analytics dashboard", false, true, "Cohort-wide"],
  ["Support", "Community", "Email · 24h", "Dedicated manager"],
];

export function PricingPage() {
  const [yearly, setYearly] = useState(false);
  return (
    <>
      <MarketingNav />
      <section className="bg-secondary px-5 py-20 text-center">
        <p className="text-sm font-bold text-primary">Home / Pricing</p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold md:text-6xl">Pricing that grows with your ambition</h1>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border bg-card p-1 text-sm font-semibold">
          <button className={cn("rounded-full px-4 py-2", !yearly && "bg-primary text-primary-foreground")} onClick={() => setYearly(false)}>
            Monthly
          </button>
          <button className={cn("rounded-full px-4 py-2", yearly && "bg-primary text-primary-foreground")} onClick={() => setYearly(true)}>
            Yearly · save 25%
          </button>
        </div>
      </section>
      <section className="px-5 py-20">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {plans.map((p, i) => (
            <Panel key={p.name} className={cn("flex flex-col", i === 1 && "border-primary shadow-panel")}>
              {i === 1 && (
                <span className="mb-4 inline-flex w-fit items-center gap-1 rounded-full bg-primary/12 px-3 py-1 text-xs font-bold text-primary">
                  <Sparkles className="size-3.5" /> Most popular
                </span>
              )}
              <p className="text-sm font-bold text-primary">{p.name}</p>
              <p className="mt-3 text-4xl font-extrabold">
                {p.monthly === null ? "Custom" : `$${yearly ? Math.round((p.yearly ?? 0) / 12) : p.monthly}`}
                {p.monthly !== null && <span className="text-sm font-normal text-muted-foreground"> / month</span>}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{p.blurb}</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {p.perks.map((x) => (
                  <li key={x} className="flex items-start gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    {x}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-7 w-full" variant={i === 1 ? "default" : "outline"}>
                <Link to="/signup">{p.monthly === null ? "Talk to us" : `Choose ${p.name}`}</Link>
              </Button>
            </Panel>
          ))}
        </div>
      </section>
      <section className="px-5 pb-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading center title="Compare every plan" />
          <Panel className="mt-10 overflow-x-auto p-0">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b bg-muted/60 text-left">
                  <th className="p-4 font-bold">Feature</th>
                  <th className="p-4 font-bold">Student</th>
                  <th className="p-4 font-bold text-primary">Pro</th>
                  <th className="p-4 font-bold">Campus</th>
                </tr>
              </thead>
              <tbody>
                {planMatrix.map(([label, a, b, c]) => (
                  <tr key={label} className="border-b last:border-0">
                    <td className="p-4 font-semibold">{label}</td>
                    {[a, b, c].map((cell, i) => (
                      <td key={i} className="p-4 text-muted-foreground">
                        {cell === true ? <Check className="size-5 text-success" /> : cell === false ? <X className="size-5 text-muted-foreground/60" /> : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
      </section>
      <section className="bg-card px-5 py-20">
        <div className="mx-auto max-w-3xl">
          <SectionHeading center title="Frequently asked questions" />
          <Accordion type="single" collapsible className="mt-8">
            {faqs.map(([q, a]) => (
              <AccordionItem key={q} value={q}>
                <AccordionTrigger className="text-left font-bold">{q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
      <CtaBanner />
      <Footer />
    </>
  );
}

/* -------------------------------- Interviews -------------------------------- */


const feedbackChart = [
  { k: "Clarity", v: 8.4 },
  { k: "Structure", v: 7.6 },
  { k: "Depth", v: 8.9 },
  { k: "Confidence", v: 7.1 },
];

const TRACKS = ["FAANG", "Startup", "Finance", "Health"] as const;
const CATEGORIES = ["Behavioral", "Technical", "Mixed"] as const;

export function InterviewsPage() {
  const [recording, setRecording] = useState(false);
  const [track, setTrack] = useState<string>("FAANG");
  const [category, setCategory] = useState<QuestionCategory>("Mixed");
  const [currentQ, setCurrentQ] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [activeTab, setActiveTab] = useState("setup");
  const [analysis, setAnalysis] = useState<ResumeAnalysisData | null>(null);
  // Per-question answer state
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [evals, setEvals] = useState<Record<number, EvaluationResult>>({});
  const [evaluated, setEvaluated] = useState<Record<number, boolean>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load stored resume analysis on mount + listen for fresh saves
  useEffect(() => {
    const stored = loadResumeAnalysis();
    if (stored) setAnalysis(stored.data);

    const onSaved = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.data) setAnalysis(detail.data);
    };
    window.addEventListener("cc:resume-analysis-saved", onSaved);
    return () => window.removeEventListener("cc:resume-analysis-saved", onSaved);
  }, []);

  // Voice input hook — appends final transcripts to the current answer
  const { isListening, isSupported: voiceSupported, interimText, start: startVoice, stop: stopVoice } = useVoiceInput({
    onResult: (text) => {
      setAnswers((prev) => ({
        ...prev,
        [currentQ]: ((prev[currentQ] ?? "") + " " + text).trimStart(),
      }));
      // Auto-focus textarea so user sees the update
      textareaRef.current?.focus();
    },
  });

  const currentAnswer = answers[currentQ] ?? "";
  const currentEval = evals[currentQ] ?? null;
  const isEvaluated = evaluated[currentQ] ?? false;

  function submitAnswer() {
    if (!currentQuestion || !currentAnswer.trim()) return;
    const result = evaluateAnswer(currentQuestion, currentAnswer);
    setEvals((prev) => ({ ...prev, [currentQ]: result }));
    setEvaluated((prev) => ({ ...prev, [currentQ]: true }));
  }

  function clearAnswer() {
    setAnswers((prev) => ({ ...prev, [currentQ]: "" }));
    setEvals((prev) => { const n = { ...prev }; delete n[currentQ]; return n; });
    setEvaluated((prev) => ({ ...prev, [currentQ]: false }));
  }

  // Generate questions whenever analysis, track, or category changes
  let count = 8;
  if (analysis) {
    if (analysis.atsScore < 50) count = 12;
    else if (analysis.atsScore < 70) count = 10;
  }
  const questions = analysis
    ? generateInterviewQuestions(analysis, track, category, count)
    : [];

  const totalQ = questions.length;
  const currentQuestion = questions[currentQ] ?? null;

  function startSession() {
    setCurrentQ(0);
    setRecording(false);
    setSessionStarted(true);
    setAnswers({});
    setEvals({});
    setEvaluated({});
    setActiveTab("session");
  }

  return (
    <AppShell title="Interview Coach" subtitle="Practice real interviews and get instant AI feedback.">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-5">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="session">Live session</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* ---- Setup ---- */}
        <TabsContent value="setup">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <Panel>
              <h2 className="font-bold">Configure your mock interview</h2>

              {/* Resume context banner */}
              {analysis ? (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-primary">Resume context loaded</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      Target role: <span className="font-semibold text-foreground">{analysis.targetRole}</span>
                      {analysis.skills?.length > 0 && (
                        <> · {analysis.skills.slice(0, 4).join(", ")}{analysis.skills.length > 4 ? ` +${analysis.skills.length - 4} more` : ""}</>
                      )}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Questions will be generated from your resume analysis.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  <Rocket className="mt-0.5 size-4 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">No resume analysis yet</p>
                    <p className="mt-0.5 text-xs">
                      <Link to="/resume" className="text-primary underline underline-offset-2">Analyze your resume</Link>
                      {" "}to unlock personalized questions based on your skills, target role, and experience gaps.
                    </p>
                  </div>
                </div>
              )}

              {/* Company track */}
              <div className="mt-5">
                <Label className="text-xs font-bold">Company track</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TRACKS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setTrack(c)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                        track === c ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interview type */}
              <div className="mt-5">
                <Label className="text-xs font-bold">Interview type</Label>
                <div className="mt-2 grid gap-3 sm:grid-cols-3">
                  {CATEGORIES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setCategory(t)}
                      className={cn(
                        "rounded-xl border p-4 text-left text-sm font-semibold transition-colors",
                        category === t ? "border-primary bg-primary/5 text-primary" : "hover:bg-muted",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question preview */}
              {questions.length > 0 && (
                <div className="mt-5">
                  <Label className="text-xs font-bold">Preview — {questions.length} questions generated</Label>
                  <div className="mt-2 max-h-48 space-y-2 overflow-y-auto pr-1">
                    {questions.map((q, i) => (
                      <div key={q.id} className="rounded-lg border bg-muted/40 px-3 py-2">
                        <span className="mr-2 text-xs font-bold text-primary">Q{i + 1}</span>
                        <span className="text-xs text-muted-foreground">{q.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                className="mt-6"
                disabled={questions.length === 0}
                onClick={startSession}
              >
                <Play /> Start interview ({questions.length || "—"} questions)
              </Button>
            </Panel>

            <Panel>
              <h2 className="font-bold">Session tips</h2>
              <ul className="mt-4 space-y-4 text-sm text-muted-foreground">
                {[
                  "Use the STAR structure for behavioral answers.",
                  "Speak for 90–120 seconds per answer.",
                  "Quantify outcomes wherever possible.",
                  "Finish with what you would do differently.",
                ].map((x) => (
                  <li key={x} className="flex gap-3">
                    <Star className="mt-0.5 size-4 shrink-0 text-warning" />
                    {x}
                  </li>
                ))}
              </ul>

              {analysis?.suggestedKeywords && analysis.suggestedKeywords.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-bold">Your skill gaps to address</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {analysis.suggestedKeywords.slice(0, 6).map((kw) => (
                      <span key={kw} className="rounded-full border border-warning/40 bg-warning/10 px-2.5 py-1 text-[11px] font-semibold text-warning">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Panel>
          </div>
        </TabsContent>

        {/* ---- Live Session ---- */}
        <TabsContent value="session">
          <Panel>
            {!sessionStarted || totalQ === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p className="font-semibold">No session started yet.</p>
                <p className="mt-1 text-sm">Go to Setup, configure your interview, and click Start.</p>
                <Button className="mt-4" onClick={() => setActiveTab("setup")}>Go to Setup</Button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-bold text-primary">
                    Question {currentQ + 1} of {totalQ}
                  </p>
                  <div className="flex items-center gap-2">
                    {currentQuestion && (
                      <span className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-bold",
                        currentQuestion.type === "behavioral" ? "bg-primary/10 text-primary" :
                        currentQuestion.type === "technical" ? "bg-warning/10 text-warning" :
                        "bg-success/10 text-success",
                      )}>
                        {currentQuestion.type}
                      </span>
                    )}
                    {isEvaluated && currentEval && (
                      <span className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-bold",
                        currentEval.score >= 75 ? "bg-success/10 text-success" :
                        currentEval.score >= 50 ? "bg-warning/10 text-warning" :
                        "bg-destructive/10 text-destructive",
                      )}>
                        Score: {currentEval.score} / 100 · {currentEval.grade}
                      </span>
                    )}
                  </div>
                </div>

                {/* Question */}
                {currentQuestion && (
                  <h2 className="mt-4 text-xl font-extrabold leading-snug md:text-2xl">
                    {currentQuestion.text}
                  </h2>
                )}
                {currentQuestion?.hint && (
                  <p className="mt-1.5 text-xs text-muted-foreground">💡 {currentQuestion.hint}</p>
                )}

                {/* Keyword chips */}
                {currentQuestion?.keywords && currentQuestion.keywords.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {currentQuestion.keywords.map((kw) => {
                      const hit = isEvaluated && currentEval?.matchedKeywords.some(
                        (m) => m.toLowerCase() === kw.toLowerCase()
                      );
                      return (
                        <span
                          key={kw}
                          className={cn(
                            "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors",
                            isEvaluated
                              ? hit
                                ? "border-success/50 bg-success/10 text-success"
                                : "border-destructive/30 bg-destructive/5 text-destructive"
                              : "border-muted bg-muted/50 text-muted-foreground",
                          )}
                        >
                          {kw}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Answer area */}
                <div className="mt-5 space-y-3">
                  <label className="text-xs font-bold">Your answer</label>
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      rows={6}
                      value={currentAnswer + (isListening && interimText ? " " + interimText : "")}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [currentQ]: e.target.value }))}
                      placeholder="Type your answer here, or click the mic to speak…"
                      className="w-full resize-none rounded-xl border bg-card px-4 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary/40"
                      disabled={isListening}
                    />
                    {isListening && interimText && (
                      <p className="absolute bottom-2 right-3 text-[10px] italic text-muted-foreground">
                        {interimText}…
                      </p>
                    )}
                  </div>

                  {/* Mic + Submit controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    {voiceSupported ? (
                      <Button
                        variant={isListening ? "destructive" : "outline"}
                        onClick={isListening ? stopVoice : startVoice}
                        className="gap-2"
                        size="sm"
                      >
                        <Mic className="size-3.5" />
                        {isListening ? "Stop speaking" : "Speak answer"}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Voice input not supported in this browser
                      </span>
                    )}
                    <Button
                      size="sm"
                      onClick={submitAnswer}
                      disabled={!currentAnswer.trim() || isEvaluated}
                    >
                      <Check className="size-3.5" /> Evaluate answer
                    </Button>
                    {isEvaluated && (
                      <Button size="sm" variant="ghost" onClick={clearAnswer}>
                        <X className="size-3.5" /> Retry
                      </Button>
                    )}
                  </div>

                  {/* Evaluation result */}
                  {isEvaluated && currentEval && (
                    <div className="mt-4 space-y-3 rounded-2xl border bg-muted/30 p-4">
                      {/* Score bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>Score</span>
                          <span className={cn(
                            currentEval.score >= 75 ? "text-success" :
                            currentEval.score >= 50 ? "text-warning" : "text-destructive",
                          )}>
                            {currentEval.score} / 100 · Grade {currentEval.grade}
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              currentEval.score >= 75 ? "bg-success" :
                              currentEval.score >= 50 ? "bg-warning" : "bg-destructive",
                            )}
                            style={{ width: `${currentEval.score}%` }}
                          />
                        </div>
                        <p className="mt-1 text-right text-[11px] text-muted-foreground">
                          {currentEval.wordCount} words
                          {currentEval.starScore !== null && ` · STAR coverage: ${currentEval.starScore}/4`}
                        </p>
                      </div>

                      {/* Strengths */}
                      {currentEval.strengths.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-success">✓ Strengths</p>
                          <ul className="mt-1.5 space-y-1">
                            {currentEval.strengths.map((s) => (
                              <li key={s} className="text-xs text-muted-foreground">• {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Improvements */}
                      {currentEval.improvements.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-warning">⚠ Improve</p>
                          <ul className="mt-1.5 space-y-1">
                            {currentEval.improvements.map((s) => (
                              <li key={s} className="text-xs text-muted-foreground">• {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Navigation + Progress */}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentQ === 0}
                    onClick={() => { stopVoice(); setCurrentQ((q) => q - 1); }}
                  >
                    ← Prev
                  </Button>
                  <Button
                    size="sm"
                    disabled={currentQ >= totalQ - 1}
                    onClick={() => { stopVoice(); setCurrentQ((q) => q + 1); }}
                  >
                    Next →
                  </Button>
                  <div className="ml-auto flex min-w-[140px] flex-col gap-1">
                    <div className="h-1.5 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${((currentQ + 1) / totalQ) * 100}%` }}
                      />
                    </div>
                    <p className="text-right text-[11px] text-muted-foreground">
                      {currentQ + 1} / {totalQ} · {Object.keys(evals).length} answered
                    </p>
                  </div>
                </div>
              </>
            )}
          </Panel>
        </TabsContent>

        {/* ---- Feedback ---- */}
        <TabsContent value="feedback">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <Panel>
              <h2 className="font-bold">Overall score</h2>
              <p className="mt-3 text-5xl font-extrabold text-primary">8.6<span className="text-lg text-muted-foreground">/10</span></p>
              <div className="mt-5 h-56">
                <ResponsiveContainer>
                  <BarChart data={feedbackChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="k" tick={{ fontSize: 11 }} axisLine={false} />
                    <YAxis hide domain={[0, 10]} />
                    <Tooltip />
                    <Bar dataKey="v" radius={8} fill="var(--primary)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel>
              <h2 className="font-bold">Coach notes</h2>
              <div className="mt-4 space-y-4 text-sm">
                <div className="rounded-xl border-l-4 border-success bg-success/5 p-4">
                  <b className="text-success">Strength</b>
                  <p className="mt-1 text-muted-foreground">Excellent technical depth with concrete metrics.</p>
                </div>
                <div className="rounded-xl border-l-4 border-warning bg-warning/5 p-4">
                  <b className="text-warning">Improve</b>
                  <p className="mt-1 text-muted-foreground">Open with the situation before jumping into implementation details.</p>
                </div>
                <div className="rounded-xl border-l-4 border-primary bg-primary/5 p-4">
                  <b className="text-primary">Next step</b>
                  <p className="mt-1 text-muted-foreground">
                    {analysis?.suggestedKeywords?.[0]
                      ? `Practice questions around ${analysis.suggestedKeywords[0]} to strengthen your weakest gap.`
                      : "Run a system design set focused on caching strategies."}
                  </p>
                </div>
              </div>
            </Panel>
          </div>
        </TabsContent>

        {/* ---- History ---- */}
        <TabsContent value="history">
          <Panel className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="p-3">Date</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Score</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Aug 28", "Backend Engineer", "Mixed", "8.6"],
                  ["Aug 21", "Backend Engineer", "Technical", "7.9"],
                  ["Aug 14", "Data Analyst", "Behavioral", "7.4"],
                ].map((r) => (
                  <tr key={r[0]} className="border-b last:border-0">
                    {r.map((c, i) => (
                      <td key={i} className={cn("p-3", i === 3 && "font-bold text-primary")}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

/* ----------------------------------- Jobs ----------------------------------- */

const jobs = [
  ["N", "Product Engineer", "Nova Labs", "Bengaluru · Hybrid", "₹18–24 LPA", 94, ["React", "Node", "Postgres"]],
  ["A", "Backend Developer", "Astra Systems", "Remote", "₹14–20 LPA", 91, ["Python", "AWS", "Docker"]],
  ["V", "Data Analyst", "Vertex Retail", "Pune · Onsite", "₹9–13 LPA", 88, ["SQL", "Tableau", "Excel"]],
  ["L", "Platform Intern", "Lumen AI", "Remote", "₹60k / month", 84, ["Go", "Kubernetes"]],
  ["S", "Associate PM", "Solara", "Gurugram · Hybrid", "₹16–21 LPA", 79, ["Roadmaps", "SQL"]],
] as const;

export function JobsPage() {
  const [saved, setSaved] = useState<string[]>([]);
  return (
    <AppShell title="Job Matches" subtitle="Roles ranked by your skills, goals and readiness.">
      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <Panel className="h-fit">
          <p className="flex items-center gap-2 font-bold">
            <Filter className="size-4" /> Filters
          </p>
          <div className="mt-5 space-y-6 text-sm">
            {[["Work type", ["Remote", "Hybrid", "Onsite"]], ["Experience", ["Internship", "Entry level", "1–3 years"]], ["Match score", ["90%+", "80%+", "70%+"]]].map(([group, items]) => (
              <div key={group as string}>
                <p className="mb-3 text-xs font-bold uppercase text-muted-foreground">{group as string}</p>
                <div className="space-y-2">
                  {(items as string[]).map((x) => (
                    <label key={x} className="flex items-center gap-2">
                      <Checkbox /> {x}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div>
          <Panel className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="h-11 pl-10" placeholder="Search roles, companies, skills..." />
            </div>
            <select className="h-11 rounded-xl border bg-card px-3 text-sm">
              <option>Sort: Best match</option>
              <option>Sort: Newest</option>
              <option>Sort: Salary</option>
            </select>
          </Panel>

          <div className="mt-4 space-y-4">
            {jobs.map(([logo, role, company, place, pay, match, skills]) => (
              <Panel key={role}>
                <div className="flex flex-wrap items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary text-lg font-extrabold text-primary">{logo}</span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold">{role}</h2>
                    <p className="text-sm text-muted-foreground">
                      {company} · {place}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(skills as readonly string[]).map((s) => (
                        <span key={s} className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-success">{match}% match</p>
                    <p className="mt-1 text-xs text-muted-foreground">{pay}</p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label={`Save ${role}`}
                        onClick={() => setSaved((s) => (s.includes(role) ? s.filter((x) => x !== role) : [...s, role]))}
                      >
                        <Bookmark className={cn("size-4", saved.includes(role) && "fill-current text-primary")} />
                      </Button>
                      <Button>Apply</Button>
                    </div>
                  </div>
                </div>
              </Panel>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            {[1, 2, 3].map((p) => (
              <Button key={p} size="icon" variant={p === 1 ? "default" : "outline"}>
                {p}
              </Button>
            ))}
            <Button variant="outline">Next</Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/* ----------------------------------- Auth ----------------------------------- */

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [show, setShow] = useState(false);
  
  // Credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Profile details
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [pii, setPii] = useState("");

  const [authError, setAuthError] = useState<string | null>(null);
  const isSignup = mode === "signup";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const err = params.get("error");
      if (err === "CredentialsSignin") {
        setAuthError("Invalid email or password. Please try again.");
      } else if (err) {
        setAuthError(`Sign-in error: ${err}`);
      }
    }
  }, []);

  function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) {
      setStep(2); // Proceed to details step
    } else {
      // Trigger NextAuth flow with the profile payload
      signInWithCredentials(email, password, "/dashboard", { name, dob, address, pii });
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative overflow-hidden bg-primary px-6 py-10 text-primary-foreground lg:px-14 lg:py-16">
        <Link to="/" className="inline-flex items-center gap-2 font-display text-lg font-extrabold">
          <span className="grid size-9 place-items-center rounded-xl bg-primary-foreground text-primary">
            <Rocket className="size-5" />
          </span>
          AI Career Copilot
        </Link>
        <h1 className="mt-10 text-3xl font-extrabold leading-tight lg:mt-20 lg:text-5xl">
          {isSignup ? "Your AI career copilot is ready." : "Welcome back. Keep building your career."}
        </h1>
        <p className="mt-5 max-w-md text-primary-foreground/75">
          {isSignup
            ? "Create a free account to analyze your resume, close skill gaps and start matching with real roles."
            : "Pick up where you left off — your roadmap, interviews and matches are waiting."}
        </p>
        <ul className="mt-8 hidden space-y-4 text-sm lg:block">
          {["Instant ATS resume scoring", "Adaptive learning roadmap", "Unlimited mock interviews"].map((x) => (
            <li key={x} className="flex items-center gap-3">
              <span className="grid size-6 place-items-center rounded-full bg-primary-foreground/20">
                <Check className="size-3.5" />
              </span>
              {x}
            </li>
          ))}
        </ul>
        <div className="absolute -bottom-16 -right-10 size-56 dot-grid opacity-40" />
      </div>

      <div className="grid place-items-center bg-background px-5 py-12 lg:px-14">
        <div className="w-full max-w-md">
          {step === 1 ? (
            <>
              <h2 className="text-2xl font-extrabold">{isSignup ? "Create your free account" : "Log in to your account"}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {isSignup ? (
                  <>
                    Already have an account?{" "}
                    <Link to="/login" className="font-bold text-primary">
                      Log in
                    </Link>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{" "}
                    <Link to="/signup" className="font-bold text-primary">
                      Sign up
                    </Link>
                  </>
                )}
              </p>

              {authError && (
                <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                  {authError}
                </div>
              )}


              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => signIn("google")}
                >
                  Continue with Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => signIn("github")}
                >
                  Continue with GitHub
                </Button>
              </div>
              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> or {isSignup ? "sign up" : "log in"} with email <span className="h-px flex-1 bg-border" />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-extrabold">Just a few more details</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Please provide your basic information to complete your profile.
              </p>
            </>
          )}

          <form className={cn("space-y-4", step === 2 && "mt-6")} onSubmit={handleAuthSubmit}>
            {step === 1 && (
              <>
                <div>
                  <Label htmlFor="email" className="text-xs font-bold">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 h-11"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-xs font-bold">Password</Label>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      name="password"
                      type={show ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-2 h-11 pr-11"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      aria-label={show ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShow(!show)}
                    >
                      {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <Checkbox /> {isSignup ? "I agree to the Terms" : "Remember me"}
                  </label>
                  {!isSignup && <span className="font-semibold text-primary">Forgot password?</span>}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <Label htmlFor="name" className="text-xs font-bold">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 h-11"
                    placeholder="Maya Singh"
                  />
                </div>
                <div>
                  <Label htmlFor="dob" className="text-xs font-bold">Date of Birth</Label>
                  <Input
                    id="dob"
                    name="dob"
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="mt-2 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="address" className="text-xs font-bold">Home Address</Label>
                  <Input
                    id="address"
                    name="address"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-2 h-11"
                    placeholder="123 Career St, Tech City"
                  />
                </div>
                <div>
                  <Label htmlFor="pii" className="text-xs font-bold">Phone Number (or Govt. ID)</Label>
                  <Input
                    id="pii"
                    name="pii"
                    required
                    value={pii}
                    onChange={(e) => setPii(e.target.value)}
                    className="mt-2 h-11"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                
                <Button type="button" variant="ghost" onClick={() => setStep(1)} className="mt-2 text-xs">
                  ← Back
                </Button>
              </>
            )}

            <Button className="h-11 w-full" type="submit">
              {step === 1 ? "Continue" : (isSignup ? "Create free account" : "Log In")}
            </Button>
          </form>

          {isSignup && step === 1 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <MetricCard label="Students onboarded" value="42k+" trend="9.1%" icon={<Sparkles />} />
              <MetricCard label="Avg. ATS lift" value="+27 pts" trend="4.3%" icon={<Star />} tone="success" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
