import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, FileQuestion } from "lucide-react";
import Link from "next/link";
import { LeadDetail } from "./lead-detail";
import type { Lead } from "@/types";

// ---------------------------------------------------------------------------
// Mock data — used when Supabase environment variables are not configured.
// Matches the mock data in the API route so IDs are consistent.
// ---------------------------------------------------------------------------

const MOCK_LEADS: Record<string, Lead> = {
  "550e8400-e29b-41d4-a716-446655440000": {
    id: "550e8400-e29b-41d4-a716-446655440000",
    business_id: "mock-business-id",
    full_name: "Alice Johnson",
    email: "alice@example.com",
    phone: "+1-555-0100",
    company: "Acme Corp",
    industry: "SaaS",
    budget: "$5K-$20K",
    timeline: "1-3 months",
    requirements: "Need AI chatbot for support",
    lead_score: 85,
    status: "qualified",
    source: "chatbot",
    created_at: "2026-07-15T10:30:00Z",
    updated_at: "2026-07-15T10:30:00Z",
  },
  "550e8400-e29b-41d4-a716-446655440001": {
    id: "550e8400-e29b-41d4-a716-446655440001",
    business_id: "mock-business-id",
    full_name: "Bob Smith",
    email: "bob@example.com",
    phone: "+1-555-0101",
    company: "TechNova",
    industry: "FinTech",
    budget: "$20K+",
    timeline: "immediately",
    requirements: "Enterprise lead qualification platform",
    lead_score: 92,
    status: "new",
    source: "chatbot",
    created_at: "2026-07-16T14:00:00Z",
    updated_at: "2026-07-16T14:00:00Z",
  },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let lead: Lead | null = null;
  let fetchError = false;

  // Try Supabase first; fall back to mock data when env vars are missing
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createClient();

      // Ensure the user is authenticated (RLS depends on it)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("leads")
          .select("*")
          .eq("id", id)
          .single();

        if (!error && data) {
          lead = data as Lead;
        }
        // PGRST116 = no rows returned; we treat as not found (lead stays null)
      }
    } catch {
      fetchError = true;
    }
  } else {
    // Dev fallback — no Supabase configured
    lead = MOCK_LEADS[id] ?? null;
  }

  // -------------------------------------------------------------------------
  // Not-found state
  // -------------------------------------------------------------------------

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <FileQuestion className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Lead not found
        </h2>
        <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          {fetchError
            ? "Something went wrong while loading this lead. Please try again."
            : "The lead you are looking for does not exist or you don't have access to it."}
        </p>
        <Link
          href="/dashboard/leads"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Leads
        </Link>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Happy path
  // -------------------------------------------------------------------------

  return <LeadDetail lead={lead} />;
}
