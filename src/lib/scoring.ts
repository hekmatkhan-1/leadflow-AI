import type { Lead } from "@/types";

export type ScoreLabel = "Hot" | "Warm" | "Cold";

export interface ScoreResult {
  score: number;
  label: ScoreLabel;
  factors: {
    budget: number;
    timeline: number;
    company: number;
    industry: number;
    email: number;
    phone: number;
    requirements: number;
  };
}

// Budget scoring (max 25)
function scoreBudget(budget?: string | null): number {
  const b = budget?.toLowerCase() || "";
  if (b.includes("20k") || b.includes("20000") || b.includes("50k") || b.includes("100k")) return 25;
  if (b.includes("5k") || b.includes("5000") || b.includes("10k") || b.includes("10000") || b.includes("15k")) return 18;
  if (b.includes("1k") || b.includes("1000") || b.includes("3k") || b.includes("3000")) return 10;
  if (b.includes("<") || b.includes("500")) return 5;
  return 0; // unknown
}

// Timeline scoring (max 25)
function scoreTimeline(timeline?: string | null): number {
  const t = timeline?.toLowerCase() || "";
  if (t.includes("immediately") || t.includes("asap") || t.includes("urgent") || t.includes("now") || t.includes("today")) return 25;
  if (t.includes("1") || t.includes("month") && (t.includes("1") || t.includes("2") || t.includes("3"))) return 18;
  if (t.includes("3") || t.includes("4") || t.includes("5") || t.includes("6")) return 10;
  if (t.includes("6+") || t.includes("year") || t.includes("later") || t.includes("someday")) return 5;
  return 0;
}

export function scoreLead(lead: Partial<Lead>): ScoreResult {
  const factors = {
    budget: scoreBudget(lead.budget),
    timeline: scoreTimeline(lead.timeline),
    company: lead.company ? 15 : 5,
    industry: lead.industry ? 10 : 3,
    email: lead.email ? 10 : 0,
    phone: lead.phone ? 10 : 0,
    requirements: lead.requirements ? 5 : 0,
  };

  const score = Object.values(factors).reduce((sum, v) => sum + v, 0);
  const clamped = Math.min(100, Math.max(0, score));

  let label: ScoreLabel;
  if (clamped >= 80) label = "Hot";
  else if (clamped >= 50) label = "Warm";
  else label = "Cold";

  return { score: clamped, label, factors };
}

export function getScoreLabel(score: number): ScoreLabel {
  if (score >= 80) return "Hot";
  if (score >= 50) return "Warm";
  return "Cold";
}
