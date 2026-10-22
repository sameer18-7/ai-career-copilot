/**
 * Interview Rubric Registry
 * ==========================
 * Defines per-question-type evaluation criteria, synonym maps, and scoring
 * weights for the deterministic local interview answer evaluator.
 *
 * Design principles:
 *  - Every rubric is a stable, versioned, inspectable data structure.
 *  - Synonym groups prevent penalising a candidate for using equivalent wording.
 *  - Weights are declared explicitly per rubric type; they always sum to 1.0.
 *  - No LLM, Ollama, or external API dependency is introduced.
 *  - Negative / speculative patterns are checked at call-site to avoid false credit.
 *
 * Rubric version: 2.0.0
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** One concept that an evaluator can check for. */
export interface RubricCriterion {
  /** Unique key within the rubric. */
  id: string;
  /** Human-readable label shown in feedback. */
  label: string;
  /**
   * Synonym groups: matching ANY phrase in ANY group satisfies the criterion.
   * Each inner array is a group of equivalent phrases for ONE concept.
   * Multiple groups represent multiple distinct sub-concepts; at least one
   * group must match for the criterion to fire.
   */
  synonymGroups: string[][];
  /**
   * Additional regex patterns (case-insensitive, word-boundary aware) that
   * can satisfy the criterion in addition to synonymGroups.
   */
  extraPatterns?: RegExp[];
  /**
   * If true, the criterion contributes only a partial signal — a match raises
   * the sub-score but is not strictly required.
   */
  optional?: boolean;
  /** Feedback message when criterion is NOT met. */
  missingFeedback: string;
  /** Feedback message when criterion IS met. */
  metFeedback: string;
}

/** Weights that define how each scoring dimension contributes to the total. */
export interface ScoringWeights {
  /** 0–1 fraction. Fraction of answer that is on-topic to the question. */
  relevance: number;
  /** 0–1 fraction. Coverage of required concepts / criteria. */
  coverage: number;
  /** 0–1 fraction. Quality of reasoning, explanation or justification. */
  reasoning: number;
  /** 0–1 fraction. Supporting examples, evidence, or measurable outcomes. */
  evidence: number;
  /** 0–1 fraction. Question-type-specific completeness (STAR, hypothesis, etc). */
  structure: number;
}

/** A complete rubric for one question template family. */
export interface QuestionRubric {
  /** Stable version string. */
  version: string;
  /**
   * Question type this rubric applies to. A rubric can cover one or more types
   * but the weights should be tuned for the dominant type.
   */
  type: "behavioral" | "technical" | "situational" | "hr";
  /** Short description of what a good answer must demonstrate. */
  description: string;
  /** Ordered list of evaluation criteria. */
  criteria: RubricCriterion[];
  /** Explicit scoring weights for each dimension. Must sum to 1.0. */
  weights: ScoringWeights;
  /**
   * Optional: minimum word count below which the evaluator flags brevity.
   * Defaults to 40 if not specified.
   */
  minWords?: number;
  /**
   * Disclaimer appended to feedback when confidence in the score is low.
   * Shown when the evaluator cannot reliably distinguish a correct from an
   * incorrect answer using deterministic patterns alone.
   */
  lowConfidenceNote?: string;
}

// ---------------------------------------------------------------------------
// Shared depth-signal patterns (cross-type)
// ---------------------------------------------------------------------------

export const DEPTH_PATTERNS: RegExp[] = [
  /\b\d+\s*(%|percent|ms|milliseconds?|seconds?|minutes?|hours?|days?|weeks?|months?|users?|requests?|million|thousand|k\b)/i,
  /\b(trade-?off|however|on the other hand|alternatively|compared to|instead of|as opposed to|whereas)\b/i,
  /\b(because|therefore|which means|this allowed|as a result|so that|in order to|since|given that|this enabled)\b/i,
  /\b(specifically|for example|for instance|such as|in particular|in my case|in our case|at scale|concretely|to illustrate)\b/i,
  /\b(reduced?|improved?|increased?|sped up|accelerated|saved|cut|eliminated|prevented|avoided)\b.*\b(\d+|significantly|substantially|dramatically)\b/i,
];

export const CAUSALITY_PATTERNS: RegExp[] = [
  /\b(because|since|therefore|thus|as a result|which meant|which caused|which allowed|this led to|consequently)\b/i,
];

export const EXAMPLE_PATTERNS: RegExp[] = [
  /\b(for example|for instance|such as|specifically|to illustrate|in one case|in a recent|in my last)\b/i,
];

export const OUTCOME_PATTERNS: RegExp[] = [
  /\b(result(?:ed)?|outcome|impact|effect|achieved?|led to|allowed|enabled|improved?|reduced?|increased?|saved?|delivered?|shipped?)\b/i,
  /\b\d+\s*(%|percent|x faster|times faster)\b/i,
];

// ---------------------------------------------------------------------------
// Shared filler/negation patterns
// ---------------------------------------------------------------------------

export const FILLER_PATTERNS: RegExp[] = [
  /\b(um+|uh+|basically|literally|you know|kind of|sort of|etc\.?)\b/gi,
  /\b(i guess|i think maybe|not sure but|i believe roughly)\b/gi,
];

export const NEGATION_PREFIXES = /\b(no|not|never|without|lacking|didn't|don't|can't|couldn't|haven't|hasn't|wasn't|weren't|unable to|failed to|never had)\b\s+/i;

// ---------------------------------------------------------------------------
// Rubric registry — behavioral templates
// ---------------------------------------------------------------------------

export const BEHAVIORAL_RUBRIC: QuestionRubric = {
  version: "2.0.0",
  type: "behavioral",
  description: "Assesses whether the candidate can narrate a specific past experience with context, personal action, reasoning, and a verifiable outcome.",
  minWords: 60,
  criteria: [
    {
      id: "context",
      label: "Situation / Context",
      synonymGroups: [
        ["situation", "context", "background", "at the time", "we were", "our team was", "when i was", "i was working", "the project", "there was a", "we had a"],
        ["i was asked", "was assigned", "was tasked", "took on", "was working on"],
      ],
      missingFeedback: "Open with the situation: briefly describe the context, team, or project so the interviewer understands the setting.",
      metFeedback: "Good — you established the context or setting.",
    },
    {
      id: "task",
      label: "Task / Responsibility",
      synonymGroups: [
        ["needed to", "had to", "was responsible for", "my goal was", "my job was", "my task was", "the challenge was", "i was responsible", "the objective was", "we needed to"],
        ["goal", "objective", "responsibility", "challenge", "problem", "issue", "requirement"],
      ],
      missingFeedback: "Clarify what specifically you were responsible for or what the challenge required of you.",
      metFeedback: "You clearly stated your responsibility or the challenge you faced.",
    },
    {
      id: "action",
      label: "Personal Actions",
      synonymGroups: [
        ["i decided", "i chose", "i implemented", "i built", "i wrote", "i led", "i fixed", "i designed", "i created", "i refactored", "i proposed", "i initiated", "i reached out"],
        ["so i", "then i", "i started", "i worked with", "i collaborated", "i drafted", "i set up", "i introduced", "i restructured"],
      ],
      extraPatterns: [/\bi (did|made|took|set|sent|ran|applied|reviewed|resolved|addressed|handled|coordinated)\b/i],
      missingFeedback: "Describe specifically what YOU did — use first-person actions rather than 'we' throughout.",
      metFeedback: "You described personal actions you took.",
    },
    {
      id: "reasoning",
      label: "Reasoning / Rationale",
      synonymGroups: [
        ["because", "since", "in order to", "so that", "which meant", "the reason", "i chose this because", "this approach because", "i decided to", "my rationale"],
        ["trade-off", "tradeoff", "trade off", "considered", "evaluated", "weighed", "instead of", "rather than", "alternative"],
      ],
      optional: true,
      missingFeedback: "Briefly explain why you made those choices — reasoning strengthens your answer.",
      metFeedback: "You explained the reasoning behind your actions.",
    },
    {
      id: "outcome",
      label: "Result / Outcome",
      synonymGroups: [
        ["result", "outcome", "impact", "as a result", "the outcome", "in the end", "ultimately", "we achieved", "we delivered", "i delivered"],
        ["reduced", "improved", "increased", "saved", "shipped", "launched", "deployed", "completed", "fixed", "resolved", "prevented"],
      ],
      extraPatterns: [...OUTCOME_PATTERNS],
      missingFeedback: "Always close with the result or measurable impact — even 'the team was unblocked' is a valid outcome.",
      metFeedback: "You described a clear outcome or result.",
    },
  ],
  weights: {
    relevance: 0.15,
    coverage: 0.35,
    reasoning: 0.20,
    evidence: 0.20,
    structure: 0.10,
  },
};

// ---------------------------------------------------------------------------
// Rubric registry — technical questions
// ---------------------------------------------------------------------------

export const TECHNICAL_RUBRIC: QuestionRubric = {
  version: "2.0.0",
  type: "technical",
  description: "Assesses correctness, concept coverage, explanation quality, and practical experience with the technical domain.",
  minWords: 40,
  lowConfidenceNote: "Technical correctness is assessed by keyword and concept coverage only. A confident, detailed-sounding answer may still contain factual errors that deterministic pattern matching cannot detect.",
  criteria: [
    {
      id: "core_concept",
      label: "Core Concept Addressed",
      synonymGroups: [],  // populated per question via question.keywords
      missingFeedback: "Address the core concept directly before going into examples or edge cases.",
      metFeedback: "You addressed the core technical concept.",
    },
    {
      id: "mechanism",
      label: "Mechanism / How It Works",
      synonymGroups: [
        ["works by", "how it works", "the way it", "underneath", "under the hood", "internally", "the process is", "the algorithm", "step by step", "the mechanism"],
        ["because", "which causes", "which enables", "this means", "so that", "in order to"],
      ],
      optional: true,
      missingFeedback: "Explain the underlying mechanism — how does it actually work, not just what it does.",
      metFeedback: "You explained how the technology or concept works.",
    },
    {
      id: "tradeoff",
      label: "Trade-offs / Limitations",
      synonymGroups: [
        ["trade-off", "tradeoff", "trade off", "however", "on the other hand", "downside", "limitation", "drawback", "cost", "overhead", "disadvantage"],
        ["compared to", "instead of", "as opposed to", "vs", "versus", "alternatively", "in contrast"],
      ],
      optional: true,
      missingFeedback: "Mention trade-offs or limitations — senior engineers always think about when NOT to use a solution.",
      metFeedback: "You acknowledged trade-offs or limitations.",
    },
    {
      id: "practical_experience",
      label: "Practical Experience / Example",
      synonymGroups: [
        ["in my experience", "i used", "i implemented", "i built", "i worked with", "in a project", "in production", "i've worked", "we used", "for example", "for instance", "i once"],
        ["in my last role", "in my previous", "at my last job", "in our system", "in our codebase"],
      ],
      optional: true,
      missingFeedback: "If you have hands-on experience with this, briefly mention it — interviewers value practical exposure.",
      metFeedback: "You referenced practical experience or a real example.",
    },
  ],
  weights: {
    relevance: 0.20,
    coverage: 0.40,
    reasoning: 0.20,
    evidence: 0.10,
    structure: 0.10,
  },
};

// ---------------------------------------------------------------------------
// Rubric registry — situational questions
// ---------------------------------------------------------------------------

export const SITUATIONAL_RUBRIC: QuestionRubric = {
  version: "2.0.0",
  type: "situational",
  description: "Assesses whether the candidate proposes a structured, reasoned response to a hypothetical scenario — not a STAR narrative of past events.",
  minWords: 50,
  criteria: [
    {
      id: "understand_scenario",
      label: "Scenario Understanding",
      synonymGroups: [
        ["first", "first i would", "i would start by", "i'd begin by", "my first step", "immediately", "initially", "right away"],
        ["understand", "assess", "diagnose", "identify", "investigate", "check", "verify", "determine", "clarify"],
      ],
      missingFeedback: "Start by acknowledging how you'd assess the situation — don't jump straight to a solution.",
      metFeedback: "You started with situational assessment before proposing a solution.",
    },
    {
      id: "proposed_action",
      label: "Concrete Proposed Actions",
      synonymGroups: [
        ["i would", "i'd", "my approach would be", "the first thing i'd do", "i would then", "next i would", "i'd then"],
        ["action", "step", "approach", "plan", "strategy", "process", "method"],
      ],
      missingFeedback: "Describe specific actions you would take, not just principles.",
      metFeedback: "You outlined concrete actions you would take.",
    },
    {
      id: "reasoning",
      label: "Reasoning Behind Decisions",
      synonymGroups: [
        ["because", "since", "the reason", "this would", "in order to", "which would", "this helps", "this ensures", "this prevents"],
        ["trade-off", "priority", "risk", "impact", "urgency", "stakeholder", "communicate"],
      ],
      missingFeedback: "Explain WHY you would take those steps — reasoning distinguishes a thoughtful answer from a list.",
      metFeedback: "You explained the rationale for your proposed approach.",
    },
    {
      id: "feasibility",
      label: "Practical Feasibility",
      synonymGroups: [
        ["feasible", "practical", "realistic", "given the constraints", "depending on", "it depends on", "in this case"],
        ["escalate", "communicate", "coordinate", "collaborate", "inform", "notify", "work with"],
      ],
      optional: true,
      missingFeedback: "Consider mentioning how you'd communicate or coordinate with others — situational answers often involve collaboration.",
      metFeedback: "You considered practical aspects like communication or coordination.",
    },
  ],
  weights: {
    relevance: 0.20,
    coverage: 0.30,
    reasoning: 0.25,
    evidence: 0.10,
    structure: 0.15,
  },
};

// ---------------------------------------------------------------------------
// Rubric registry — HR / general questions
// ---------------------------------------------------------------------------

export const HR_RUBRIC: QuestionRubric = {
  version: "2.0.0",
  type: "hr",
  description: "Assesses self-awareness, career narrative coherence, and role-specific alignment.",
  minWords: 40,
  criteria: [
    {
      id: "specificity",
      label: "Specific Details",
      synonymGroups: [
        ["for example", "specifically", "such as", "including", "in particular", "namely", "for instance"],
        ["my experience in", "i've worked on", "i built", "i led", "i'm passionate about", "i specialise in"],
      ],
      missingFeedback: "Be specific — replace general statements with concrete examples from your experience.",
      metFeedback: "You included specific details or examples.",
    },
    {
      id: "self_awareness",
      label: "Self-Awareness / Reflection",
      synonymGroups: [
        ["i've learned", "i've grown", "i realise", "i recognize", "looking back", "reflecting", "i've come to"],
        ["strength", "weakness", "improve", "developing", "working on", "growth area", "i tend to"],
      ],
      optional: true,
      missingFeedback: "Show self-awareness — briefly reflect on what you've learned or what you're working to improve.",
      metFeedback: "You demonstrated self-awareness or reflection.",
    },
    {
      id: "role_alignment",
      label: "Role / Company Alignment",
      synonymGroups: [
        ["this role", "this company", "this opportunity", "the position", "what excites me", "why i'm interested", "i'm drawn to"],
        ["aligns with", "fits", "matches", "connects to", "builds on", "allows me to"],
      ],
      optional: true,
      missingFeedback: "Connect your answer to this specific role or company — generic answers feel unprepared.",
      metFeedback: "You connected your answer to the role or company.",
    },
  ],
  weights: {
    relevance: 0.25,
    coverage: 0.25,
    reasoning: 0.20,
    evidence: 0.20,
    structure: 0.10,
  },
};

// ---------------------------------------------------------------------------
// Global synonym dictionary — cross-question technical aliases
// ---------------------------------------------------------------------------

/**
 * Maps canonical technical terms to their accepted aliases.
 * Used to normalize question.keywords before matching.
 * Keys are lower-case canonical forms; values are arrays of aliases.
 *
 * IMPORTANT: Only add an alias when the terms are genuinely equivalent
 * in the context of a technical interview. Do not add broad synonyms
 * that could generate false positives.
 */
export const TECH_SYNONYMS: Record<string, string[]> = {
  // Data structures
  "hash table":   ["hash map", "hashmap", "dictionary", "lookup table"],
  "binary search tree": ["bst", "binary tree", "balanced tree"],
  "linked list":  ["linked-list"],
  "priority queue": ["heap", "min-heap", "max-heap"],

  // Database
  "index":        ["b-tree index", "btree", "composite index", "covering index", "database index"],
  "transaction":  ["acid", "atomicity", "consistency", "isolation", "durability"],
  "n+1":          ["n+1 query", "n+1 problem", "n plus 1"],
  "sql":          ["relational database", "rdbms", "structured query language"],
  "nosql":        ["non-relational", "document store", "key-value store"],
  "cache":        ["caching", "in-memory cache", "redis cache", "memcached"],
  "eager loading": ["join fetch", "include", "preload"],
  "lazy loading": ["deferred loading", "on demand"],

  // Networking / APIs
  "rest api":     ["restful api", "rest", "http api", "web api", "restful"],
  "graphql":      ["graph ql"],
  "load balancer": ["load balancing", "reverse proxy"],
  "cdn":          ["content delivery network", "edge network"],
  "tls":          ["ssl", "https", "ssl/tls"],

  // Cloud / DevOps
  "kubernetes":   ["k8s", "container orchestration"],
  "docker":       ["containerization", "container"],
  "ci/cd":        ["continuous integration", "continuous deployment", "pipeline", "github actions", "jenkins"],
  "microservices": ["microservice", "service-oriented", "soa"],
  "blue-green":   ["blue green deployment", "zero-downtime deployment"],
  "canary":       ["canary deployment", "canary release"],

  // ML
  "overfitting":  ["high variance", "overfit"],
  "underfitting": ["high bias", "underfit"],
  "cross-validation": ["k-fold", "cross validation", "cv"],
  "gradient boosting": ["xgboost", "lightgbm", "gbm", "gradient boosted trees"],
  "precision":    ["positive predictive value"],
  "recall":       ["sensitivity", "true positive rate"],

  // Frontend
  "virtual dom":  ["vdom", "virtual document object model"],
  "reconciliation": ["diffing algorithm", "react reconciliation"],
  "ssr":          ["server-side rendering", "server side rendering"],
  "csr":          ["client-side rendering", "client side rendering"],
  "ssg":          ["static site generation", "static generation"],

  // General engineering
  "horizontal scaling": ["scale out", "horizontal scalability", "add more servers"],
  "vertical scaling":   ["scale up", "vertical scalability", "bigger server"],
  "sharding":     ["data partitioning", "horizontal partitioning"],
  "replication":  ["replica", "read replica", "data replication"],
  "circuit breaker": ["circuit-breaker pattern"],
  "api gateway":  ["api-gateway"],
  "cap theorem":  ["cap", "cap theory", "consistency availability partition"],
};

/**
 * Resolves a keyword and all its aliases into one Set for matching.
 */
export function resolveKeywordAliases(keyword: string): string[] {
  const key = keyword.toLowerCase().trim();
  const aliases = TECH_SYNONYMS[key] ?? [];
  return [key, ...aliases];
}

// ---------------------------------------------------------------------------
// Rubric selector
// ---------------------------------------------------------------------------

export function getRubricForType(type: "behavioral" | "technical" | "situational" | string): QuestionRubric {
  switch (type) {
    case "behavioral":  return BEHAVIORAL_RUBRIC;
    case "technical":   return TECHNICAL_RUBRIC;
    case "situational": return SITUATIONAL_RUBRIC;
    default:            return HR_RUBRIC;
  }
}
