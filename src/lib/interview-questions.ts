/**
 * Interview Question Generator
 * =============================
 * Generates contextual mock interview questions from the stored resume
 * analysis. Questions adapt to:
 *   - The candidate's target role
 *   - Their detected skills (to ask about depth / usage)
 *   - Their skill gaps / suggested keywords (to probe awareness)
 *   - Their experience history
 *   - The chosen company track (FAANG, Startup, Finance, Health)
 *
 * Each question carries a `keywords` array used by the local answer evaluator
 * for regex-based keyword matching (no external API).
 */

import type { ResumeAnalysisData } from "./resume-types";

export type QuestionCategory = "Behavioral" | "Technical" | "Mixed";

export interface InterviewQuestion {
  id: string;
  text: string;
  type: "behavioral" | "technical" | "situational";
  hint?: string;
  /** Keyword bank for local regex evaluation */
  keywords: string[];
}

// ---------------------------------------------------------------------------
// Track-specific framing prefixes
// ---------------------------------------------------------------------------

const TRACK_FRAMING: Record<string, string> = {
  FAANG:   "At a high-growth product company like Google or Meta,",
  Startup: "At a fast-moving startup with a small team,",
  Finance: "In a regulated financial services environment,",
  Health:  "In a healthcare or medical technology setting,",
};

// ---------------------------------------------------------------------------
// Behavioral templates + keywords
// ---------------------------------------------------------------------------

const BEHAVIORAL_BANK: { text: string; keywords: string[] }[] = [
  {
    text: "{{company_context}} tell me about a time you took ownership of a project end-to-end.",
    keywords: ["ownership", "led", "initiative", "responsible", "delivered", "outcome", "result"],
  },
  {
    text: "Describe a situation where you had to learn a new technology quickly to deliver a result.",
    keywords: ["learn", "quickly", "documentation", "prototype", "delivered", "challenge", "timeline"],
  },
  {
    text: "Tell me about a time you disagreed with a team decision. How did you handle it?",
    keywords: ["disagreed", "communicated", "convinced", "compromise", "perspective", "aligned", "outcome"],
  },
  {
    text: "Give an example of a project where things went wrong. What did you do?",
    keywords: ["failed", "mistake", "root cause", "learned", "fixed", "recovered", "prevented"],
  },
  {
    text: "{{company_context}} how do you prioritize when you have multiple competing deadlines?",
    keywords: ["prioritize", "urgent", "impact", "tradeoff", "stakeholder", "communicated", "deadline"],
  },
  {
    text: "Describe a time you received difficult feedback. How did you respond?",
    keywords: ["feedback", "constructive", "improved", "action", "changed", "reflected", "grateful"],
  },
  {
    text: "Tell me about your most impactful contribution in a team setting.",
    keywords: ["impact", "team", "contributed", "result", "metric", "shipped", "collaboration"],
  },
  {
    text: "How do you stay current with new developments in {{role}}?",
    keywords: ["read", "blog", "conference", "course", "practice", "community", "side project"],
  },
];

// ---------------------------------------------------------------------------
// Track-specific CS questions
// ---------------------------------------------------------------------------

const TRACK_CS_QUESTIONS: Record<string, { text: string; keywords: string[] }[]> = {
  FAANG: [
    {
      text: "How would you design a distributed system to handle billions of requests with high availability?",
      keywords: ["load balancer", "replication", "sharding", "consistency", "availability", "latency", "fault tolerance", "CAP theorem"],
    },
    {
      text: "Explain the space and time complexity tradeoffs between a Hash Table and a Binary Search Tree.",
      keywords: ["O(1)", "O(log n)", "hash", "collision", "balanced", "ordered", "space", "lookup"],
    },
    {
      text: "How do you approach scaling a monolithic application into microservices?",
      keywords: ["bounded context", "service", "API gateway", "decoupling", "database", "deployment", "communication"],
    },
  ],
  Startup: [
    {
      text: "How do you prioritize technical debt versus shipping new features in a fast-paced environment?",
      keywords: ["technical debt", "trade-off", "business value", "refactor", "sprint", "stakeholder", "ROI"],
    },
    {
      text: "Describe your approach to building a minimum viable product (MVP) when requirements are vague.",
      keywords: ["MVP", "iteration", "user feedback", "prototype", "assumption", "validate", "pivot"],
    },
    {
      text: "Walk me through a time you had to learn a completely new tech stack to deliver a critical feature.",
      keywords: ["documentation", "prototype", "experiment", "timeline", "delivered", "challenge", "learned"],
    },
  ],
  Finance: [
    {
      text: "How do you ensure data consistency and atomicity in a high-throughput transaction system?",
      keywords: ["ACID", "transaction", "rollback", "atomicity", "isolation", "consistency", "lock", "database"],
    },
    {
      text: "What strategies would you use to minimize latency in a real-time trading application?",
      keywords: ["latency", "cache", "in-memory", "queue", "batch", "async", "profiling", "network"],
    },
    {
      text: "Explain how you would secure sensitive financial data in compliance with regulatory standards.",
      keywords: ["encryption", "AES", "TLS", "compliance", "audit", "PCI DSS", "access control", "logging"],
    },
  ],
  Health: [
    {
      text: "How do you design systems to ensure strict data privacy and HIPAA compliance?",
      keywords: ["HIPAA", "PHI", "encryption", "access control", "audit log", "de-identification", "breach", "compliance"],
    },
    {
      text: "What is your approach to ensuring high reliability and fault tolerance in life-critical systems?",
      keywords: ["uptime", "redundancy", "failover", "recovery", "SLA", "monitoring", "testing", "circuit breaker"],
    },
    {
      text: "Walk me through how you would handle audit logging for accessing sensitive patient records.",
      keywords: ["audit", "log", "timestamp", "user ID", "access", "immutable", "SIEM", "retention"],
    },
  ],
};

// ---------------------------------------------------------------------------
// Role-specific technical questions + keywords
// ---------------------------------------------------------------------------

const ROLE_QUESTION_BANK: Record<string, { text: string; keywords: string[] }[]> = {
  backend: [
    { text: "How would you design a URL shortener that handles 100 million requests per day?", keywords: ["hashing", "cache", "database", "load balancer", "rate limit", "unique", "collision", "redirect"] },
    { text: "Explain the difference between SQL and NoSQL. When would you choose each?", keywords: ["schema", "ACID", "scalability", "document", "relational", "consistency", "CAP", "query"] },
    { text: "What is the N+1 query problem and how do you solve it?", keywords: ["N+1", "lazy loading", "eager loading", "JOIN", "ORM", "batch", "query", "database"] },
    { text: "Walk me through how you'd handle authentication and authorization in a REST API.", keywords: ["JWT", "OAuth", "session", "token", "role", "middleware", "HTTPS", "refresh"] },
    { text: "How do you approach database indexing for slow queries?", keywords: ["index", "EXPLAIN", "query plan", "composite", "B-tree", "cardinality", "slow query log", "covering index"] },
  ],
  frontend: [
    { text: "What is the virtual DOM and how does React reconciliation work?", keywords: ["virtual DOM", "diffing", "fiber", "reconciliation", "rerender", "key", "component", "state"] },
    { text: "How do you optimize a slow-loading web page?", keywords: ["lazy loading", "code splitting", "CDN", "cache", "minify", "LCP", "CLS", "bundle size"] },
    { text: "Explain the difference between SSR, SSG, and CSR with trade-offs.", keywords: ["SSR", "SSG", "CSR", "hydration", "SEO", "TTFB", "build time", "dynamic"] },
    { text: "How would you ensure a UI component library is accessible?", keywords: ["ARIA", "semantic HTML", "keyboard", "focus", "contrast", "screen reader", "WCAG", "tab order"] },
    { text: "Describe your approach to state management in a large React application.", keywords: ["Context", "Redux", "Zustand", "prop drilling", "selector", "immutable", "global state", "side effect"] },
  ],
  data: [
    { text: "Walk me through how you clean a dataset before building a model.", keywords: ["null", "outlier", "normalization", "encoding", "imputation", "duplicate", "EDA", "dtype"] },
    { text: "What is the difference between precision and recall? When does each matter?", keywords: ["precision", "recall", "F1", "false positive", "false negative", "threshold", "imbalance", "confusion matrix"] },
    { text: "Explain how gradient boosting works in plain terms.", keywords: ["gradient", "boosting", "ensemble", "weak learner", "residual", "learning rate", "trees", "XGBoost"] },
    { text: "How do you handle class imbalance in a classification problem?", keywords: ["SMOTE", "oversample", "undersample", "class weight", "threshold", "ROC", "precision-recall", "balanced"] },
    { text: "Describe a situation where your model worked well in training but failed in production.", keywords: ["overfitting", "data drift", "leakage", "distribution", "monitoring", "retrain", "validation", "pipeline"] },
  ],
  ml: [
    { text: "What is the bias-variance tradeoff and how does it affect model selection?", keywords: ["bias", "variance", "overfitting", "underfitting", "regularization", "complexity", "generalization", "cross-validation"] },
    { text: "How would you deploy a machine learning model to production?", keywords: ["API", "Docker", "CI/CD", "monitoring", "latency", "versioning", "A/B test", "rollback"] },
    { text: "Explain attention mechanisms in transformers to a non-ML engineer.", keywords: ["attention", "query", "key", "value", "weight", "context", "self-attention", "transformer"] },
    { text: "How do you evaluate a recommendation system?", keywords: ["precision@k", "recall@k", "NDCG", "AUC", "click-through", "A/B test", "coverage", "diversity"] },
    { text: "Walk me through your approach to feature engineering for a tabular dataset.", keywords: ["feature", "encoding", "scaling", "interaction", "lag", "aggregation", "selection", "importance"] },
  ],
  devops: [
    { text: "How would you set up a zero-downtime deployment pipeline?", keywords: ["blue-green", "canary", "rolling", "health check", "rollback", "CI/CD", "load balancer", "smoke test"] },
    { text: "Explain the difference between horizontal and vertical scaling.", keywords: ["horizontal", "vertical", "stateless", "sharding", "load balancer", "autoscale", "bottleneck", "cost"] },
    { text: "What is a Kubernetes Pod and how does it differ from a container?", keywords: ["Pod", "container", "shared network", "sidecar", "namespace", "orchestration", "kubectl", "node"] },
    { text: "How do you monitor a production service? What metrics matter most?", keywords: ["latency", "throughput", "error rate", "saturation", "SLO", "SLA", "alert", "dashboard"] },
    { text: "Walk me through how you'd debug a memory leak in a containerized application.", keywords: ["memory", "heap dump", "profiler", "OOMKilled", "limits", "GC", "leak", "metrics"] },
  ],
  product: [
    { text: "How do you decide which features to build next?", keywords: ["prioritization", "RICE", "user research", "metric", "impact", "effort", "roadmap", "stakeholder"] },
    { text: "Tell me about a product decision you made with incomplete data.", keywords: ["assumption", "hypothesis", "proxy metric", "experiment", "risk", "iterate", "decision", "evidence"] },
    { text: "How do you define and measure success for a new feature?", keywords: ["KPI", "metric", "retention", "DAU", "conversion", "A/B test", "baseline", "goal"] },
    { text: "Describe how you work with engineering when requirements are unclear.", keywords: ["spec", "clarify", "trade-off", "prototype", "feedback", "iterate", "align", "technical feasibility"] },
    { text: "Walk me through a product you admire and what you'd improve.", keywords: ["user problem", "design", "friction", "retention", "engagement", "competitor", "improvement", "metric"] },
  ],
  default: [
    { text: "How do you approach problem-solving when requirements are ambiguous?", keywords: ["clarify", "assumptions", "iterate", "stakeholder", "scope", "tradeoff", "solution", "validate"] },
    { text: "Describe your experience working in cross-functional teams.", keywords: ["collaboration", "communication", "aligned", "stakeholder", "engineering", "design", "shared goal", "conflict"] },
    { text: "What tools do you use to measure the impact of your work?", keywords: ["metric", "analytics", "dashboard", "KPI", "logging", "A/B test", "baseline", "report"] },
    { text: "Tell me about a time you improved a process or system.", keywords: ["bottleneck", "automation", "reduced", "improved", "time saved", "efficiency", "before", "after"] },
    { text: "How do you ensure quality in your deliverables?", keywords: ["testing", "review", "checklist", "validation", "feedback", "documentation", "standards", "QA"] },
  ],
};

function getRoleKey(role: string): string {
  const lower = role.toLowerCase();
  if (lower.includes("backend") || lower.includes("api") || lower.includes("server")) return "backend";
  if (lower.includes("frontend") || lower.includes("ui") || lower.includes("react")) return "frontend";
  if (lower.includes("data scientist") || lower.includes("data analyst") || lower.includes("analytics")) return "data";
  if (lower.includes("machine learning") || lower.includes("ml") || lower.includes("ai engineer")) return "ml";
  if (lower.includes("devops") || lower.includes("cloud") || lower.includes("platform") || lower.includes("sre")) return "devops";
  if (lower.includes("product manager") || lower.includes("pm ") || lower.includes("product owner")) return "product";
  return "default";
}

// ---------------------------------------------------------------------------
// Skill deep-dive questions (dynamic — keywords derived from the skill name)
// ---------------------------------------------------------------------------

function buildSkillQuestions(
  skills: string[],
  gaps: string[],
  role: string,
  track: string,
  category: QuestionCategory,
): InterviewQuestion[] {
  const questions: InterviewQuestion[] = [];
  const ctx = TRACK_FRAMING[track] ?? "";

  for (const skill of skills.slice(0, 5)) {
    if (category === "Behavioral") break;
    questions.push({
      id: `tech-skill-${skill.toLowerCase().replace(/\s+/g, "-")}`,
      text: `${ctx} walk me through how you have used ${skill} in a real project. What challenges did you face?`,
      type: "technical",
      hint: "Explain the why, the trade-offs you considered, and the measurable outcome",
      keywords: [skill.toLowerCase(), "project", "challenge", "solution", "outcome", "trade-off", "implemented"],
    });
  }

  for (const gap of gaps.slice(0, 3)) {
    if (category === "Behavioral") break;
    questions.push({
      id: `tech-gap-${gap.toLowerCase().replace(/\s+/g, "-")}`,
      text: `${gap} is frequently expected for ${role} roles. How familiar are you with it, and how would you approach learning it?`,
      type: "technical",
      hint: "It is fine to admit a gap — show a concrete learning plan and intellectual curiosity",
      keywords: [gap.toLowerCase(), "learning", "plan", "course", "documentation", "project", "familiar"],
    });
  }

  return questions;
}

// ---------------------------------------------------------------------------
// Experience questions
// ---------------------------------------------------------------------------

function buildExperienceQuestions(
  experience: { title: string; company: string; description: string }[],
  track: string,
): InterviewQuestion[] {
  const ctx = TRACK_FRAMING[track] ?? "";
  const questions: InterviewQuestion[] = [];

  for (const exp of experience.slice(0, 2)) {
    if (exp.title) {
      questions.push({
        id: `exp-${(exp.company ?? questions.length.toString()).toLowerCase().replace(/\s+/g, "-")}`,
        text: `${ctx} in your role as ${exp.title}${exp.company ? ` at ${exp.company}` : ""}, what was the most technically challenging problem you solved?`,
        type: "situational",
        hint: "Go deep — describe your thought process, alternatives you considered, and the measurable outcome",
        keywords: ["challenge", "solution", "implemented", "result", "impact", "learned", "decision", "outcome"],
      });
    }
  }

  return questions;
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

export function generateInterviewQuestions(
  analysis: ResumeAnalysisData,
  track: string,
  category: QuestionCategory,
  count: number = 8,
): InterviewQuestion[] {
  const { targetRole, skills, suggestedKeywords, experience } = analysis;
  const roleKey = getRoleKey(targetRole);
  const ctx = TRACK_FRAMING[track] ?? "";
  const questions: InterviewQuestion[] = [];

  // 1. Behavioral
  if (category !== "Technical") {
    const shuffled = [...BEHAVIORAL_BANK].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, category === "Behavioral" ? 6 : 3);
    picked.forEach((q, i) => {
      questions.push({
        id: `beh-${i}`,
        text: q.text.replace("{{company_context}}", ctx).replace("{{role}}", targetRole),
        type: "behavioral",
        hint: "Use the STAR format: Situation → Task → Action → Result",
        keywords: q.keywords,
      });
    });
  }

  // 2. Experience
  if (experience?.length > 0) {
    questions.push(...buildExperienceQuestions(experience, track));
  }

  // 3. Role technical
  if (category !== "Behavioral") {
    const roleQs = ROLE_QUESTION_BANK[roleKey] ?? ROLE_QUESTION_BANK["default"];
    roleQs.slice(0, 3).forEach((q, i) => {
      questions.push({
        id: `role-${i}`,
        text: `${ctx} ${q.text}`,
        type: "technical",
        hint: "Be specific and use real examples if possible",
        keywords: q.keywords,
      });
    });

    // Track CS questions
    const trackQs = TRACK_CS_QUESTIONS[track] ?? [];
    trackQs.slice(0, 2).forEach((q, i) => {
      questions.push({
        id: `track-cs-${i}`,
        text: q.text,
        type: "technical",
        hint: "Connect your CS knowledge to the specific constraints of this industry",
        keywords: q.keywords,
      });
    });
  }

  // 4. Skill + gap questions
  questions.push(
    ...buildSkillQuestions(skills ?? [], suggestedKeywords ?? [], targetRole, track, category),
  );

  // Deduplicate and cap
  const seen = new Set<string>();
  return questions
    .filter((q) => {
      if (seen.has(q.id)) return false;
      seen.add(q.id);
      return true;
    })
    .slice(0, count);
}
