/**
 * Answer Evaluator  v2.0.0
 * ========================
 * Evaluates interview answers using question-specific rubrics.
 *
 * Changes from v1:
 *  - Scoring is decomposed into five explicit, independently-weighted dimensions
 *    (relevance, coverage, reasoning, evidence, structure).
 *  - Keyword matching uses synonym-aware alias resolution so equivalent
 *    technical terms satisfy the same criterion.
 *  - Behavioral STAR detection recognises equivalent phrasing rather than
 *    requiring literal STAR keywords.
 *  - Situational questions use a decision/reasoning rubric, not a STAR rubric.
 *  - Answer depth is measured by causality, outcome, and example patterns
 *    rather than word count alone.
 *  - Feedback cites specific evidence from the answer, not just a keyword list.
 *  - Score is presented with an explicit "provisional coaching estimate" label.
 *  - Bug fix: v1 formula `keywordScore + (starBonus || depthBonus) + depthBonus`
 *    double-counted depthBonus when starBonus > 0. Replaced with explicit
 *    per-dimension component scoring.
 *
 * NO external AI APIs — all evaluation is local regex + heuristics.
 * Rubric version: 2.0.0
 */

import type { InterviewQuestion } from "./interview-questions";
import {
  getRubricForType,
  resolveKeywordAliases,
  DEPTH_PATTERNS,
  CAUSALITY_PATTERNS,
  EXAMPLE_PATTERNS,
  OUTCOME_PATTERNS,
  FILLER_PATTERNS,
  NEGATION_PREFIXES,
  type QuestionRubric,
  type RubricCriterion,
  type ScoringWeights,
} from "./interview-rubric";

// ---------------------------------------------------------------------------
// Public output type
// ---------------------------------------------------------------------------

/** Per-criterion evaluation result. */
export interface CriterionResult {
  id: string;
  label: string;
  met: boolean;
  /** Specific text snippet from the answer that satisfied this criterion, or null. */
  evidence: string | null;
  feedback: string;
}

/** Full evaluation result returned by evaluateAnswer(). */
export interface EvaluationResult {
  /** Rubric version that produced this result. */
  rubricVersion: string;
  /** 0–100 composite score. */
  score: number;
  /** Letter grade derived from score. */
  grade: "A" | "B" | "C" | "D" | "F";
  /** Per-dimension breakdown (each 0–100). */
  dimensions: {
    relevance: number;
    coverage: number;
    reasoning: number;
    evidence: number;
    structure: number;
  };
  /** Per-criterion results. */
  criteriaResults: CriterionResult[];
  /** Keywords from the question bank that were found (alias-aware). */
  matchedKeywords: string[];
  /** Keywords from the question bank that were NOT found. */
  missedKeywords: string[];
  /** Positive coaching observations. */
  strengths: string[];
  /** Actionable coaching suggestions. */
  improvements: string[];
  /** STAR component coverage (0–4). null for non-behavioral questions. */
  starScore: number | null;
  /** Total word count of the submitted answer. */
  wordCount: number;
  /**
   * Provisional disclaimer shown in UI.
   * The score is a heuristic coaching estimate, not a validated measure.
   */
  disclaimer: string;
  /** Optional note when evaluator confidence is low for this question type. */
  lowConfidenceNote?: string;
}

// ---------------------------------------------------------------------------
// Negation guard
// ---------------------------------------------------------------------------

/**
 * Returns true if the phrase occurs in the text preceded by a negation.
 * Conservative check — only flags clear syntactic negation within 5 tokens.
 */
function isNegated(phrase: string, text: string): boolean {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const negPattern = new RegExp(
    `\\b(no|not|never|without|lacking|didn't|don't|can't|couldn't|haven't|hasn't|wasn't|weren't|unable to|failed to|never had)\\b.{0,40}\\b${escaped}\\b`,
    "i",
  );
  return negPattern.test(text);
}

// ---------------------------------------------------------------------------
// Phrase matching — word-boundary aware, handles multi-word phrases
// ---------------------------------------------------------------------------

function phraseInText(phrase: string, normalizedText: string): boolean {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Allow word boundary or start/end of string for each edge
  const pattern = new RegExp(`(?:^|\\b|\\s)${escaped}(?:$|\\b|\\s)`, "i");
  return pattern.test(normalizedText);
}

/**
 * Finds the first short excerpt (~60 chars) of text where phrase appears.
 * Used to populate `evidence` in CriterionResult.
 */
function findExcerpt(phrase: string, originalText: string): string | null {
  const idx = originalText.toLowerCase().indexOf(phrase.toLowerCase());
  if (idx === -1) return null;
  const start = Math.max(0, idx - 20);
  const end = Math.min(originalText.length, idx + phrase.length + 40);
  const excerpt = originalText.slice(start, end).trim();
  return `"…${excerpt}…"`;
}

// ---------------------------------------------------------------------------
// Synonym-aware keyword matching
// ---------------------------------------------------------------------------

interface KeywordMatchResult {
  matched: string[];   // original keywords from question bank that matched
  missed: string[];    // original keywords that did not match
}

function matchKeywordsWithAliases(
  keywords: string[],
  normalizedText: string,
): KeywordMatchResult {
  const matched: string[] = [];
  const missed: string[] = [];

  for (const kw of keywords) {
    const candidates = resolveKeywordAliases(kw);
    let found = false;
    for (const candidate of candidates) {
      if (phraseInText(candidate, normalizedText) && !isNegated(candidate, normalizedText)) {
        found = true;
        break;
      }
    }
    (found ? matched : missed).push(kw);
  }

  return { matched, missed };
}

// ---------------------------------------------------------------------------
// Rubric criterion evaluation
// ---------------------------------------------------------------------------

function evaluateCriterion(
  criterion: RubricCriterion,
  normalizedText: string,
  originalText: string,
): CriterionResult {
  // Check synonym groups: criterion is met if ANY group has a match
  let met = false;
  let evidence: string | null = null;

  for (const group of criterion.synonymGroups) {
    for (const phrase of group) {
      if (phraseInText(phrase, normalizedText) && !isNegated(phrase, normalizedText)) {
        met = true;
        evidence = findExcerpt(phrase, originalText);
        break;
      }
    }
    if (met) break;
  }

  // Extra patterns
  if (!met && criterion.extraPatterns) {
    for (const pattern of criterion.extraPatterns) {
      const m = originalText.match(pattern);
      if (m) {
        met = true;
        evidence = findExcerpt(m[0], originalText);
        break;
      }
    }
  }

  return {
    id: criterion.id,
    label: criterion.label,
    met,
    evidence,
    feedback: met ? criterion.metFeedback : criterion.missingFeedback,
  };
}

// ---------------------------------------------------------------------------
// Dimension scorers
// ---------------------------------------------------------------------------

/** Relevance: fraction of question keywords matched (alias-aware). */
function scoreRelevance(matchedKeywords: string[], totalKeywords: number): number {
  if (totalKeywords === 0) return 65; // neutral when no keywords defined
  return Math.round((matchedKeywords.length / totalKeywords) * 100);
}

/** Coverage: fraction of required criteria met. Optional criteria contribute half-weight. */
function scoreCoverage(criteriaResults: CriterionResult[], rubric: QuestionRubric): number {
  if (rubric.criteria.length === 0) return 50;

  const required = rubric.criteria.filter((c) => !c.optional);
  const optional = rubric.criteria.filter((c) => c.optional);

  const requiredScore = required.length === 0
    ? 100
    : (criteriaResults.filter((r) => !rubric.criteria.find((c) => c.id === r.id)?.optional && r.met).length / required.length) * 100;

  const optionalScore = optional.length === 0
    ? 100
    : (criteriaResults.filter((r) => rubric.criteria.find((c) => c.id === r.id)?.optional && r.met).length / optional.length) * 100;

  // Required criteria weighted 80%, optional 20%
  return Math.round(requiredScore * 0.8 + optionalScore * 0.2);
}

/** Reasoning: checks for causality patterns and trade-off language. */
function scoreReasoning(normalizedText: string): number {
  const causalityHits = CAUSALITY_PATTERNS.filter((p) => p.test(normalizedText)).length;
  const depthHits = DEPTH_PATTERNS.filter((p) => p.test(normalizedText)).length;

  // Causality is the primary signal; depth adds secondary evidence
  const base = Math.min(causalityHits * 30, 70);
  const bonus = Math.min(depthHits * 10, 30);
  return Math.min(100, base + bonus);
}

/** Evidence: checks for specific examples, quantified outcomes. */
function scoreEvidence(normalizedText: string): number {
  const exampleHits = EXAMPLE_PATTERNS.filter((p) => p.test(normalizedText)).length;
  const outcomeHits = OUTCOME_PATTERNS.filter((p) => p.test(normalizedText)).length;
  const metricMatch = /\b\d+\s*(%|percent|ms|x faster|times faster|users?|requests?|million|thousand)\b/i.test(normalizedText);

  let score = 0;
  if (exampleHits >= 1) score += 35;
  if (outcomeHits >= 1) score += 35;
  if (metricMatch) score += 30;
  return Math.min(100, score);
}

/**
 * Structure: question-type-specific completeness.
 * - Behavioral: STAR coverage (0–4 components detected)
 * - Technical: explanation + trade-off presence
 * - Situational: assessment + action + reasoning
 * - HR: specificity + alignment
 */

// Re-exported STAR pattern expanded with more synonyms
const STAR_PATTERNS = {
  situation: /\b(situation|context|background|was working on|at the time|when i|there was|we had|the project|our team|was assigned|was asked)\b/i,
  task:      /\b(task|responsibility|needed to|had to|was asked|my goal|the challenge|my job was|i was responsible|objective|the problem|we needed)\b/i,
  action:    /\b(so i|then i|i decided|i chose|i implemented|i built|i wrote|i led|i fixed|i designed|i created|i worked with|i proposed|i initiated|i refactored|i introduced)\b/i,
  result:    /\b(result|outcome|impact|achieved|reduced|improved|increased|saved|delivered|shipped|as a result|the outcome|we managed to|ultimately|this led to|we achieved)\b/i,
};

function computeStarScore(normalizedText: string): number {
  return Object.values(STAR_PATTERNS).filter((p) => p.test(normalizedText)).length;
}

function scoreStructure(
  type: string,
  normalizedText: string,
  starScore: number | null,
): number {
  if (type === "behavioral") {
    // 0–4 STAR components → 0–100
    return starScore !== null ? Math.round((starScore / 4) * 100) : 0;
  }
  if (type === "technical") {
    const hasExplanation = /\b(works by|the reason|because|this means|in order to|under the hood)\b/i.test(normalizedText);
    const hasTradeoff = /\b(trade-?off|however|downside|limitation|alternatively|compared to)\b/i.test(normalizedText);
    return (hasExplanation ? 50 : 0) + (hasTradeoff ? 50 : 0);
  }
  if (type === "situational") {
    const hasAssess = /\b(first i would|i'd start|i would first|i would assess|i would check|i would investigate|i would identify)\b/i.test(normalizedText);
    const hasAction = /\b(i would|i'd|my approach|i would then|next i would)\b/i.test(normalizedText);
    const hasRisk = /\b(risk|escalate|communicate|inform|notify|impact|stakeholder|priority)\b/i.test(normalizedText);
    return Math.round(((hasAssess ? 1 : 0) + (hasAction ? 1 : 0) + (hasRisk ? 1 : 0)) / 3 * 100);
  }
  // HR
  const hasSpecific = /\b(for example|specifically|such as|in particular|i've worked)\b/i.test(normalizedText);
  const hasRole = /\b(this role|this company|this opportunity|what excites me|why i'm interested)\b/i.test(normalizedText);
  return (hasSpecific ? 50 : 0) + (hasRole ? 50 : 0);
}

// ---------------------------------------------------------------------------
// Filler penalty (capped, lower weight than v1)
// ---------------------------------------------------------------------------

function computeFillerPenalty(normalizedText: string): number {
  let count = 0;
  for (const fp of FILLER_PATTERNS) {
    const hits = (normalizedText.match(fp) ?? []).length;
    count += hits;
  }
  // Each filler hit = -1 point, capped at 10
  return Math.min(count, 10);
}

// ---------------------------------------------------------------------------
// Grade boundaries
// ---------------------------------------------------------------------------

function computeGrade(score: number): EvaluationResult["grade"] {
  if (score >= 82) return "A";
  if (score >= 67) return "B";
  if (score >= 52) return "C";
  if (score >= 38) return "D";
  return "F";
}

// ---------------------------------------------------------------------------
// Feedback generation
// ---------------------------------------------------------------------------

function buildStrengths(
  criteriaResults: CriterionResult[],
  matchedKeywords: string[],
  starScore: number | null,
  depthHits: number,
  wordCount: number,
): string[] {
  const strengths: string[] = [];

  // Criteria met
  criteriaResults
    .filter((r) => r.met)
    .slice(0, 3)
    .forEach((r) => strengths.push(r.feedback));

  // Keywords
  if (matchedKeywords.length >= 3) {
    strengths.push(`Covered key concepts: ${matchedKeywords.slice(0, 3).join(", ")}.`);
  }

  // STAR (behavioral)
  if (starScore !== null && starScore >= 3) {
    strengths.push("Strong narrative structure — situation, actions, and outcome are all present.");
  }

  // Depth
  if (depthHits >= 2) {
    strengths.push("Good use of causal reasoning or quantified impact.");
  }

  return [...new Set(strengths)].slice(0, 5); // deduplicate, cap at 5
}

function buildImprovements(
  criteriaResults: CriterionResult[],
  missedKeywords: string[],
  starScore: number | null,
  type: string,
  wordCount: number,
  minWords: number,
  fillerPenalty: number,
): string[] {
  const improvements: string[] = [];

  // Required criteria not met
  criteriaResults
    .filter((r) => !r.met)
    .slice(0, 3)
    .forEach((r) => improvements.push(r.feedback));

  // Missed keywords (max 2 shown)
  if (missedKeywords.length > 0) {
    improvements.push(
      `Consider addressing: ${missedKeywords.slice(0, 2).join(", ")} — these are expected concepts for this question.`,
    );
  }

  // STAR for behavioral
  if ((type === "behavioral") && starScore !== null && starScore < 2) {
    improvements.push(
      "Structure your answer: describe the Situation → your Task → the Actions you personally took → the Result.",
    );
  }

  // Brevity (only flagged below minWords, not as a blanket length bonus)
  if (wordCount < minWords) {
    improvements.push(
      `Your answer is brief (${wordCount} words). Aim for at least ${minWords}–${minWords + 40} words to provide adequate detail.`,
    );
  }

  // Filler
  if (fillerPenalty >= 5) {
    improvements.push(
      'Reduce filler phrases ("basically", "kind of", "like", etc.) — they dilute the impact of your answer.',
    );
  }

  return [...new Set(improvements)].slice(0, 5); // deduplicate, cap at 5
}

// ---------------------------------------------------------------------------
// Main evaluator — public API
// ---------------------------------------------------------------------------

export function evaluateAnswer(
  question: InterviewQuestion,
  answer: string,
): EvaluationResult {
  const normalizedText = answer.toLowerCase().trim();
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

  const rubric = getRubricForType(question.type);
  const keywords = question.keywords ?? [];

  // ── 1. Keyword matching with alias resolution ────────────────────────────
  const { matched: matchedKeywords, missed: missedKeywords } =
    matchKeywordsWithAliases(keywords, normalizedText);

  // ── 2. Criteria evaluation ────────────────────────────────────────────────
  const criteriaResults: CriterionResult[] = rubric.criteria.map((c) =>
    evaluateCriterion(c, normalizedText, answer),
  );

  // ── 3. STAR score (behavioral questions only) ─────────────────────────────
  const starScore =
    question.type === "behavioral" || question.type === "situational"
      ? computeStarScore(normalizedText)
      : null;

  // ── 4. Depth signals ──────────────────────────────────────────────────────
  const depthHits = DEPTH_PATTERNS.filter((p) => p.test(normalizedText)).length;

  // ── 5. Filler penalty ─────────────────────────────────────────────────────
  const fillerPenalty = computeFillerPenalty(normalizedText);

  // ── 6. Per-dimension scores (each 0–100) ──────────────────────────────────
  const dimRelevance = scoreRelevance(matchedKeywords, keywords.length);
  const dimCoverage  = scoreCoverage(criteriaResults, rubric);
  const dimReasoning = scoreReasoning(normalizedText);
  const dimEvidence  = scoreEvidence(normalizedText);
  const dimStructure = scoreStructure(question.type, normalizedText, starScore);

  // ── 7. Weighted composite score ───────────────────────────────────────────
  const w: ScoringWeights = rubric.weights;
  const rawScore =
    dimRelevance * w.relevance +
    dimCoverage  * w.coverage +
    dimReasoning * w.reasoning +
    dimEvidence  * w.evidence +
    dimStructure * w.structure;

  const score = Math.max(0, Math.min(100, Math.round(rawScore - fillerPenalty)));
  const grade = computeGrade(score);

  // ── 8. Coaching feedback ──────────────────────────────────────────────────
  const minWords = rubric.minWords ?? 40;
  const strengths    = buildStrengths(criteriaResults, matchedKeywords, starScore, depthHits, wordCount);
  const improvements = buildImprovements(criteriaResults, missedKeywords, starScore, question.type, wordCount, minWords, fillerPenalty);

  const result: EvaluationResult = {
    rubricVersion: rubric.version,
    score,
    grade,
    dimensions: {
      relevance:  Math.round(dimRelevance),
      coverage:   Math.round(dimCoverage),
      reasoning:  Math.round(dimReasoning),
      evidence:   Math.round(dimEvidence),
      structure:  Math.round(dimStructure),
    },
    criteriaResults,
    matchedKeywords,
    missedKeywords,
    strengths,
    improvements,
    starScore,
    wordCount,
    disclaimer:
      "This score is a provisional coaching estimate from a local rule-based evaluator. " +
      "It reflects observable answer structure and keyword coverage — not a validated measure of interview ability. " +
      "Use the specific feedback below rather than the number alone.",
  };
  if (rubric.lowConfidenceNote !== undefined) {
    result.lowConfidenceNote = rubric.lowConfidenceNote;
  }
  return result;
}
