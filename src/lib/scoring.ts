// TODO: Lead scoring algorithms and heuristics
import type { Lead } from "@/types";

export function calculateLeadScore(lead: Partial<Lead>): number {
  // TODO: Implement scoring logic based on qualification criteria
  return 0;
}

export function isHotLead(score: number): boolean {
  return score >= 80;
}
