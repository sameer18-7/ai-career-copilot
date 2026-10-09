/**
 * Answer Evaluator
 * =================
 * Evaluates a candidate's answer using:
 *   1. Keyword regex matching against per-question keyword banks
 *   2. STAR structure detection (for behavioral questions)
 *   3. Depth signals (length, specificity markers)
 *   4. Filler/vague language penalty
 *
 * NO external AI APIs are used — all evaluation is local regex + heuristics.
 */

import type { InterviewQuestion } from "./interview-questions";

export interface EvaluationResult {
  score: number;              // 0–100
  grade: "A" | "B" | "C" | "D" | "F";
  matchedKeywords: string[];  // keywords found in the answer
  missedKeywords: string[];   // keywords NOT found
  strengths: string[];        // positive signals detected
  improvements: string[];     // areas to work on
  starScore: number | null;   // 0–4, null if not behavioral
  wordCount: number;
}

// ---------------------------------------------------------------------------
// STAR structure markers
// ---------------------------------------------------------------------------

const STAR_PATTERNS = {
  situation: /\b(situation|context|background|was working on|at the time|when i|there was|we had|the project|our team)\b/i,
  task:      /\b(task|responsibility|needed to|had to|was asked|my goal|the challenge|my job was|i was responsible)\b/i,
  action:    /\b(action|so i|then i|i decided|i chose|i implemented|i built|i wrote|i led|i fixed|i designed|i created|i worked with)\b/i,
  result:    /\b(result|outcome|impact|achieved|reduced|improved|increased|saved|delivered|shipped|as a result|the outcome|we managed to|ultimately)\b/i,
};

// ---------------------------------------------------------------------------
// Vague/filler language — penalise
// ---------------------------------------------------------------------------

const FILLER_PATTERNS = [
  /\b(um+|uh+|like|basically|literally|you know|kind of|sort of|stuff|things|etc\.?)\b/gi,
  /\b(i guess|i think maybe|not sure but|i believe roughly)\b/gi,
];

// ---------------------------------------------------------------------------
// Depth signals — reward
// ---------------------------------------------------------------------------

const DEPTH_PATTERNS = [
  /\d+\s*(%|percent|ms|seconds|hours|days|users|requests|million|thousand|k\b)/i, // quantified metric
  /\b(trade-off|trade off|tradeoff|however|on the other hand|alternatively|compared to|instead of)\b/i, // nuance
  /\b(because|therefore|which means|this allowed|as a result|so that|in order to)\b/i, // causality
  /\b(specifically|for example|such as|in particular|in our case|at scale)\b/i,   // specificity
];

// ---------------------------------------------------------------------------
// Core evaluator
// ---------------------------------------------------------------------------

export function evaluateAnswer(
  question: InterviewQuestion,
  answer: string,
): EvaluationResult {
  const normalized = answer.toLowerCase().trim();
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

  // 1. Keyword matching
  const keywords = question.keywords ?? [];
  const matchedKeywords: string[] = [];
  const missedKeywords: string[] = [];

  for (const kw of keywords) {
    const pattern = new RegExp(`\\b${kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (pattern.test(normalized)) {
      matchedKeywords.push(kw);
    } else {
      missedKeywords.push(kw);
    }
  }

  const keywordScore = keywords.length > 0
    ? Math.round((matchedKeywords.length / keywords.length) * 40)
    : 20; // neutral if no keywords defined

  // 2. STAR score (behavioral / situational only)
  let starScore: number | null = null;
  let starBonus = 0;
  if (question.type === "behavioral" || question.type === "situational") {
    starScore = Object.values(STAR_PATTERNS).filter((p) => p.test(normalized)).length;
    starBonus = Math.round((starScore / 4) * 25);
  }

  // 3. Depth signals
  const depthHits = DEPTH_PATTERNS.filter((p) => p.test(normalized)).length;
  const depthBonus = Math.min(25, depthHits * 7);

  // 4. Length bonus (min 80 words ideal for a real answer)
  const lengthBonus = wordCount < 30 ? -10 : wordCount < 80 ? 0 : wordCount >= 80 ? 10 : 0;

  // 5. Filler penalty
  let fillerPenalty = 0;
  for (const fp of FILLER_PATTERNS) {
    const hits = (normalized.match(fp) ?? []).length;
    fillerPenalty += hits * 2;
  }
  fillerPenalty = Math.min(fillerPenalty, 15);

  // Total score
  const raw = keywordScore + (starBonus || depthBonus) + depthBonus + lengthBonus - fillerPenalty;
  const score = Math.max(0, Math.min(100, raw));

  // Grade
  const grade: EvaluationResult["grade"] =
    score >= 85 ? "A" :
    score >= 70 ? "B" :
    score >= 55 ? "C" :
    score >= 40 ? "D" : "F";

  // Strengths
  const strengths: string[] = [];
  if (matchedKeywords.length > 0) strengths.push(`Covered key concepts: ${matchedKeywords.slice(0, 3).join(", ")}`);
  if (starScore !== null && starScore >= 3) strengths.push("Strong STAR structure detected");
  if (depthHits >= 2) strengths.push("Good use of specifics and quantified impact");
  if (wordCount >= 80) strengths.push("Sufficient answer depth and length");

  // Improvements
  const improvements: string[] = [];
  if (missedKeywords.length > 0) improvements.push(`Missing key concepts: ${missedKeywords.slice(0, 3).join(", ")}`);
  if (starScore !== null && starScore < 2) improvements.push("Structure your answer using STAR (Situation, Task, Action, Result)");
  if (depthHits === 0) improvements.push("Add quantified metrics (%, time saved, users impacted) to improve depth");
  if (wordCount < 80) improvements.push(`Answer is too brief (${wordCount} words). Aim for at least 80–120 words.`);
  if (fillerPenalty > 4) improvements.push("Reduce filler language (like, basically, kind of, etc.)");

  return { score, grade, matchedKeywords, missedKeywords, strengths, improvements, starScore, wordCount };
}
