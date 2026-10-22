/**
 * answer-evaluator.test.ts
 * ========================
 * Comprehensive regression tests for the v2 interview answer evaluator.
 *
 * Test categories:
 *  A. Synonym and technical terminology recognition
 *  B. Answer depth detection
 *  C. Question-type routing (behavioral / technical / situational / hr)
 *  D. Negative and ambiguous cases
 *  E. Feedback content and score invariants
 *  F. Score mathematics (weights, bounds, reproducibility)
 *
 * Run: npx vitest src/lib/answer-evaluator.test.ts
 *      or as part of the full test suite.
 */

/// <reference types="vitest/globals" />
import { describe, it, expect } from "vitest";
import { evaluateAnswer } from "./answer-evaluator";
import type { InterviewQuestion } from "./interview-questions";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeQ(
  overrides: Partial<InterviewQuestion> & { type: InterviewQuestion["type"] },
): InterviewQuestion {
  const q: InterviewQuestion = {
    id: "test-q",
    text: "Test question",
    type: overrides.type,
    keywords: overrides.keywords ?? [],
  };
  if (overrides.id !== undefined) q.id = overrides.id;
  if (overrides.text !== undefined) q.text = overrides.text;
  if (overrides.hint !== undefined) q.hint = overrides.hint;
  return q;
}

const BEHAVIORAL_Q = makeQ({
  type: "behavioral",
  keywords: ["ownership", "led", "initiative", "delivered", "outcome"],
});

const TECHNICAL_Q = makeQ({
  type: "technical",
  keywords: ["index", "B-tree", "query", "performance"],
  text: "How does database indexing improve query performance?",
});

const SITUATIONAL_Q = makeQ({
  type: "situational",
  keywords: ["prioritize", "stakeholder", "communicate", "deadline"],
  text: "What would you do if a production service failed before a major release?",
});

const HR_Q = makeQ({
  type: "behavioral",  // HR questions reuse behavioral type in the bank
  keywords: ["strength", "weakness", "improve"],
  text: "What are your professional strengths?",
});

// ---------------------------------------------------------------------------
// A. Synonym and terminology recognition
// ---------------------------------------------------------------------------

describe("A. Synonym and terminology recognition", () => {
  it("A1: 'hashmap' satisfies the 'hash table' keyword", () => {
    const q = makeQ({ type: "technical", keywords: ["hash table"] });
    const r = evaluateAnswer(q, "I used a hashmap to store session data for O(1) lookup.");
    expect(r.matchedKeywords).toContain("hash table");
    expect(r.missedKeywords).not.toContain("hash table");
  });

  it("A2: 'k8s' satisfies the 'kubernetes' keyword", () => {
    const q = makeQ({ type: "technical", keywords: ["kubernetes"] });
    const r = evaluateAnswer(q, "We deployed the service on k8s with a rolling update strategy.");
    expect(r.matchedKeywords).toContain("kubernetes");
  });

  it("A3: 'xgboost' satisfies the 'gradient boosting' keyword", () => {
    const q = makeQ({ type: "technical", keywords: ["gradient boosting"] });
    const r = evaluateAnswer(q, "I trained an XGBoost classifier on the tabular dataset.");
    expect(r.matchedKeywords).toContain("gradient boosting");
  });

  it("A4: 'restful api' satisfies the 'rest api' keyword", () => {
    const q = makeQ({ type: "technical", keywords: ["rest api"] });
    const r = evaluateAnswer(q, "We exposed a RESTful API over HTTPS with JSON payloads.");
    expect(r.matchedKeywords).toContain("rest api");
  });

  it("A5: 'sensitivity' satisfies the 'recall' keyword", () => {
    const q = makeQ({ type: "technical", keywords: ["recall"] });
    const r = evaluateAnswer(q, "Sensitivity (true positive rate) was more important than precision here.");
    expect(r.matchedKeywords).toContain("recall");
  });

  it("A6: 'ssl' satisfies the 'tls' keyword", () => {
    const q = makeQ({ type: "technical", keywords: ["tls"] });
    const r = evaluateAnswer(q, "We enforced SSL/TLS on all endpoints using a certificate manager.");
    expect(r.matchedKeywords).toContain("tls");
  });

  it("A7: unrelated terms do NOT trigger a match", () => {
    const q = makeQ({ type: "technical", keywords: ["hash table"] });
    const r = evaluateAnswer(q, "I solved the problem by iterating over the list sequentially.");
    expect(r.matchedKeywords).not.toContain("hash table");
    expect(r.missedKeywords).toContain("hash table");
  });

  it("A8: partial substring does NOT generate false credit (substring-only match)", () => {
    // 'map' is NOT an alias for 'hash table', and should not match via substring
    const q = makeQ({ type: "technical", keywords: ["hash table"] });
    const r = evaluateAnswer(q, "I created a road map for the deployment.");
    expect(r.matchedKeywords).not.toContain("hash table");
  });

  it("A9: repeated synonyms count the keyword only once", () => {
    const q = makeQ({ type: "technical", keywords: ["kubernetes"] });
    const r = evaluateAnswer(q, "k8s is kubernetes and k8s again — we used k8s in production.");
    expect(r.matchedKeywords.filter((k) => k === "kubernetes").length).toBe(1);
  });

  it("A10: case-insensitive matching works", () => {
    const q = makeQ({ type: "technical", keywords: ["B-tree"] });
    const r = evaluateAnswer(q, "Database indexes use a B-TREE structure under the hood.");
    expect(r.matchedKeywords).toContain("B-tree");
  });
});

// ---------------------------------------------------------------------------
// B. Answer depth detection
// ---------------------------------------------------------------------------

describe("B. Answer depth and evidence detection", () => {
  it("B1: a concise but correct behavioral answer can score above 50", () => {
    const answer = [
      "In my last role I led the migration of our API to microservices.",
      "The main challenge was coordinating across teams.",
      "I implemented a feature-flag system so we could roll back safely.",
      "As a result we reduced deployment time by 40%.",
    ].join(" ");
    const r = evaluateAnswer(BEHAVIORAL_Q, answer);
    expect(r.score).toBeGreaterThan(50);
  });

  it("B2: a long but irrelevant answer does NOT automatically score highly", () => {
    // 100+ words but no keywords, no structure, no reasoning
    const filler = Array(110).fill("things and stuff basically like you know").join(" ");
    const r = evaluateAnswer(BEHAVIORAL_Q, filler);
    expect(r.score).toBeLessThan(55);
  });

  it("B3: quantified metric boosts evidence dimension", () => {
    const withMetric = "I reduced server latency by 35% by introducing Redis caching.";
    const withoutMetric = "I improved server performance by introducing caching.";
    const r1 = evaluateAnswer(TECHNICAL_Q, withMetric);
    const r2 = evaluateAnswer(TECHNICAL_Q, withoutMetric);
    expect(r1.dimensions.evidence).toBeGreaterThanOrEqual(r2.dimensions.evidence);
  });

  it("B4: causal language boosts reasoning dimension", () => {
    const withCause = "We chose Redis because it supports atomic operations and sub-millisecond reads.";
    const withoutCause = "We used Redis for our caching layer.";
    const r1 = evaluateAnswer(TECHNICAL_Q, withCause);
    const r2 = evaluateAnswer(TECHNICAL_Q, withoutCause);
    expect(r1.dimensions.reasoning).toBeGreaterThan(r2.dimensions.reasoning);
  });

  it("B5: a STAR-structured behavioral answer without the literal word STAR still gets recognized", () => {
    const answer = [
      "I was working on a payment integration project for a fintech client.",
      "The challenge was that our third-party processor had a 2s timeout.",
      "I redesigned the async job queue to batch requests, then I implemented a retry mechanism.",
      "The result was that transaction failures dropped by 60% over the following month.",
    ].join(" ");
    const r = evaluateAnswer(BEHAVIORAL_Q, answer);
    expect(r.starScore).toBeGreaterThanOrEqual(3);
  });

  it("B6: missing outcome detected in behavioral answer", () => {
    const answer = "I led a team of 3 engineers. I took ownership of the backend redesign and built a new API layer. I worked with the frontend team to integrate it.";
    const r = evaluateAnswer(BEHAVIORAL_Q, answer);
    const outcomeImprovement = r.improvements.some(
      (m) => /result|outcome|impact|close/.test(m.toLowerCase()),
    );
    // The evaluator should flag a missing result
    expect(r.criteriaResults.find((c) => c.id === "outcome")?.met ?? true).toBe(false);
  });

  it("B7: missing action detected in behavioral answer", () => {
    // Provides context and result but no personal action verb
    const answer = "The project was delayed due to requirements changing frequently. In the end things improved and we shipped.";
    const r = evaluateAnswer(BEHAVIORAL_Q, answer);
    const actionResult = r.criteriaResults.find((c) => c.id === "action");
    expect(actionResult?.met).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// C. Question-type routing
// ---------------------------------------------------------------------------

describe("C. Question-type routing", () => {
  it("C1: behavioral question computes a starScore", () => {
    const r = evaluateAnswer(BEHAVIORAL_Q, "When I was working on a critical project, I had to redesign the auth layer. I built a JWT flow and the outcome was a 10% reduction in login failures.");
    expect(r.starScore).not.toBeNull();
  });

  it("C2: technical question does NOT compute a starScore", () => {
    const r = evaluateAnswer(TECHNICAL_Q, "An index is a B-tree data structure that allows O(log n) lookups instead of O(n) full table scans.");
    expect(r.starScore).toBeNull();
  });

  it("C3: situational question computes a starScore (situational also gets STAR)", () => {
    const r = evaluateAnswer(SITUATIONAL_Q, "First I would assess the situation and check the monitoring dashboard. Then I would roll back the failing deployment and notify stakeholders.");
    expect(r.starScore).not.toBeNull();
  });

  it("C4: behavioral question uses behavioral rubric criteria (includes 'action' criterion)", () => {
    const r = evaluateAnswer(BEHAVIORAL_Q, "We delivered a great product.");
    const hasCriteria = r.criteriaResults.some((c) => c.id === "action");
    expect(hasCriteria).toBe(true);
  });

  it("C5: technical question uses technical rubric criteria (includes 'mechanism' criterion)", () => {
    const r = evaluateAnswer(TECHNICAL_Q, "Indexes help queries run faster.");
    const hasMechanism = r.criteriaResults.some((c) => c.id === "mechanism" || c.id === "core_concept");
    expect(hasMechanism).toBe(true);
  });

  it("C6: situational question uses situational criteria (includes 'proposed_action')", () => {
    const r = evaluateAnswer(SITUATIONAL_Q, "I would first assess the alerts and then escalate to the on-call team.");
    const hasAction = r.criteriaResults.some((c) => c.id === "proposed_action");
    expect(hasAction).toBe(true);
  });

  it("C7: different questions with different keywords score the same wording differently", () => {
    // 'delivered' is a keyword for BEHAVIORAL_Q but not for TECHNICAL_Q
    const answer = "I delivered the feature on time after careful planning.";
    const r1 = evaluateAnswer(BEHAVIORAL_Q, answer);
    const r2 = evaluateAnswer(TECHNICAL_Q, answer);
    // Behavioral should match 'delivered'; technical should not (not in technical_q keywords)
    expect(r1.matchedKeywords).toContain("delivered");
    expect(r2.matchedKeywords).not.toContain("delivered");
  });
});

// ---------------------------------------------------------------------------
// D. Negative and ambiguous cases
// ---------------------------------------------------------------------------

describe("D. Negative and ambiguous cases", () => {
  it("D1: negated keyword is NOT credited", () => {
    const q = makeQ({ type: "technical", keywords: ["cache"] });
    const r = evaluateAnswer(q, "We decided not to use a cache because the data changes too frequently.");
    // Should NOT match 'cache' since it's negated
    expect(r.matchedKeywords).not.toContain("cache");
  });

  it("D2: empty answer returns score 0", () => {
    const r = evaluateAnswer(BEHAVIORAL_Q, "");
    expect(r.score).toBe(0);
  });

  it("D3: whitespace-only answer returns score 0", () => {
    const r = evaluateAnswer(BEHAVIORAL_Q, "   \n\t  ");
    expect(r.score).toBe(0);
  });

  it("D4: extremely short answer is flagged for brevity", () => {
    const r = evaluateAnswer(BEHAVIORAL_Q, "I led a team.");
    const hasBrevityWarning = r.improvements.some((m) => /brief|words/.test(m.toLowerCase()));
    expect(hasBrevityWarning).toBe(true);
  });

  it("D5: score stays within 0–100 for any input", () => {
    const extremes = [
      "",
      " ",
      "x".repeat(5000),
      Array(200).fill("I achieved reduced improved delivered outcome result").join(" "),
      "uh um like basically kind of sort of things stuff etc",
    ];
    for (const answer of extremes) {
      const r = evaluateAnswer(BEHAVIORAL_Q, answer);
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(100);
    }
  });

  it("D6: unknown question type falls back gracefully without throwing", () => {
    const q = makeQ({ type: "situational", keywords: [] }); // empty keywords
    expect(() => evaluateAnswer(q, "I would handle it by communicating clearly.")).not.toThrow();
  });

  it("D7: high-filler, low-content answer scores lower than low-filler equivalent", () => {
    const fillerAnswer = "Like, basically, I kind of led the team, you know? Stuff happened and like, things improved, kind of.";
    const cleanAnswer = "I led the team through a difficult migration. We restructured the API layer, and as a result the response time improved.";
    const r1 = evaluateAnswer(BEHAVIORAL_Q, fillerAnswer);
    const r2 = evaluateAnswer(BEHAVIORAL_Q, cleanAnswer);
    expect(r2.score).toBeGreaterThan(r1.score);
  });

  it("D8: question with no keywords does not divide by zero", () => {
    const q = makeQ({ type: "behavioral", keywords: [] });
    const r = evaluateAnswer(q, "I took ownership and delivered a strong outcome.");
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
    expect(r.matchedKeywords).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// E. Feedback invariants
// ---------------------------------------------------------------------------

describe("E. Feedback content and score invariants", () => {
  it("E1: strengths list capped at 5 items", () => {
    const answer = "I led the team and built the system. We achieved a 50% reduction in latency. For example, I implemented Redis caching. The result was excellent. The situation was complex.";
    const r = evaluateAnswer(BEHAVIORAL_Q, answer);
    expect(r.strengths.length).toBeLessThanOrEqual(5);
  });

  it("E2: improvements list capped at 5 items", () => {
    const r = evaluateAnswer(BEHAVIORAL_Q, "");
    expect(r.improvements.length).toBeLessThanOrEqual(5);
  });

  it("E3: disclaimer is always present and non-empty", () => {
    const r = evaluateAnswer(BEHAVIORAL_Q, "Some answer.");
    expect(r.disclaimer.length).toBeGreaterThan(10);
  });

  it("E4: criteriaResults array is never empty for behavioral questions", () => {
    const r = evaluateAnswer(BEHAVIORAL_Q, "");
    expect(r.criteriaResults.length).toBeGreaterThan(0);
  });

  it("E5: grade A requires score >= 82", () => {
    // Construct an answer that should score high
    const answer = [
      "When I was working on the platform team at my last company,",
      "I was responsible for improving our deployment reliability.",
      "I implemented a blue-green deployment pipeline with automated smoke tests.",
      "I chose this approach because it allowed zero-downtime rollbacks.",
      "The result was that we reduced deployment failures by 80% over 3 months.",
    ].join(" ");
    const r = evaluateAnswer(BEHAVIORAL_Q, answer);
    if (r.grade === "A") expect(r.score).toBeGreaterThanOrEqual(82);
    if (r.grade === "F") expect(r.score).toBeLessThan(38);
  });

  it("E6: rubricVersion is present in result", () => {
    const r = evaluateAnswer(BEHAVIORAL_Q, "I led a project and delivered results.");
    expect(r.rubricVersion).toBe("2.0.0");
  });

  it("E7: duplicate improvements are not present (deduplication)", () => {
    const r = evaluateAnswer(BEHAVIORAL_Q, "");
    const unique = new Set(r.improvements);
    expect(unique.size).toBe(r.improvements.length);
  });

  it("E8: technical question includes low-confidence note", () => {
    const r = evaluateAnswer(TECHNICAL_Q, "Indexes use B-trees for fast lookup.");
    expect(r.lowConfidenceNote).toBeDefined();
    expect(r.lowConfidenceNote!.length).toBeGreaterThan(10);
  });
});

// ---------------------------------------------------------------------------
// F. Scoring mathematics
// ---------------------------------------------------------------------------

describe("F. Score mathematics", () => {
  it("F1: identical inputs produce identical scores (deterministic)", () => {
    const answer = "I led the team to deliver a 30% improvement in API latency.";
    const r1 = evaluateAnswer(BEHAVIORAL_Q, answer);
    const r2 = evaluateAnswer(BEHAVIORAL_Q, answer);
    expect(r1.score).toBe(r2.score);
    expect(r1.grade).toBe(r2.grade);
  });

  it("F2: all dimension scores are between 0 and 100", () => {
    const answers = [
      "I led the project.",
      "We used indexes. Indexes work by using a B-tree. This reduced query time by 40%.",
      "",
    ];
    for (const answer of answers) {
      const r = evaluateAnswer(BEHAVIORAL_Q, answer);
      for (const [dim, val] of Object.entries(r.dimensions)) {
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(100);
      }
    }
  });

  it("F3: wordCount matches actual word count", () => {
    const answer = "I led the team through a migration";
    const r = evaluateAnswer(BEHAVIORAL_Q, answer);
    expect(r.wordCount).toBe(7);
  });

  it("F4: score increases when a required criterion is added to an answer", () => {
    const base = "I was working on a project. I implemented a solution.";
    const withOutcome = base + " As a result the system became 30% faster and we shipped on time.";
    const r1 = evaluateAnswer(BEHAVIORAL_Q, base);
    const r2 = evaluateAnswer(BEHAVIORAL_Q, withOutcome);
    expect(r2.score).toBeGreaterThanOrEqual(r1.score);
  });

  it("F5: adding purely irrelevant content to a good answer does not significantly deflate the score", () => {
    const good = "I led the migration project. I implemented the new API layer using Node.js. The result was a 50% reduction in latency.";
    const goodPlusFiller = good + " Anyway, stuff happened.";
    const r1 = evaluateAnswer(BEHAVIORAL_Q, good);
    const r2 = evaluateAnswer(BEHAVIORAL_Q, goodPlusFiller);
    // Score should not drop by more than 5 points for minor filler
    expect(r1.score - r2.score).toBeLessThanOrEqual(5);
  });
});
