import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/types";

// ---------------------------------------------------------------
// Shared query params schema (same as list, minus pagination)
// ---------------------------------------------------------------

const exportParamsSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["new", "contacted", "qualified", "converted", "closed"]).optional(),
  score_min: z.coerce.number().int().min(0).max(100).optional(),
  score_max: z.coerce.number().int().min(0).max(100).optional(),
  sort: z.enum(["created_at", "full_name", "email", "company", "lead_score", "status"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

// Maximum rows to export
const MAX_EXPORT_ROWS = 10_000;

// CSV column headers
const CSV_HEADERS = [
  "Name",
  "Email",
  "Phone",
  "Company",
  "Industry",
  "Budget",
  "Timeline",
  "Requirements",
  "Score",
  "Status",
  "Source",
  "Date",
];

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

/** Escape a CSV field: wrap in quotes if it contains commas, quotes, or newlines */
function escapeCSV(value: string | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Convert a Lead row to a CSV line */
function leadToCSVLine(lead: Lead): string {
  return [
    escapeCSV(lead.full_name),
    escapeCSV(lead.email),
    escapeCSV(lead.phone),
    escapeCSV(lead.company),
    escapeCSV(lead.industry),
    escapeCSV(lead.budget),
    escapeCSV(lead.timeline),
    escapeCSV(lead.requirements),
    String(lead.lead_score),
    escapeCSV(lead.status),
    escapeCSV(lead.source),
    escapeCSV(lead.created_at),
  ].join(",");
}

/** Build a CSV string from an array of leads */
function buildCSV(leads: Lead[]): string {
  const lines = [CSV_HEADERS.join(","), ...leads.map(leadToCSVLine)];
  return lines.join("\n");
}

// ---------------------------------------------------------------
// Mock data for dev fallback
// ---------------------------------------------------------------

const MOCK_LEADS: Lead[] = [
  {
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
  {
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
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    business_id: "mock-business-id",
    full_name: "Carol Davis",
    email: "carol@example.com",
    phone: null,
    company: "GreenFields",
    industry: "Agriculture",
    budget: "<$1K",
    timeline: "6+ months",
    requirements: "Looking for basic chatbot",
    lead_score: 35,
    status: "closed",
    source: "website",
    created_at: "2026-07-10T08:00:00Z",
    updated_at: "2026-07-12T09:00:00Z",
  },
];

// ---------------------------------------------------------------
// GET /api/leads/export — export leads as CSV
// ---------------------------------------------------------------

export async function GET(request: NextRequest) {
  // Graceful fallback: return mock CSV when Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const { searchParams } = request.nextUrl;
    const rawParams = Object.fromEntries(searchParams.entries());
    const parsed = exportParamsSchema.safeParse(rawParams);
    const params = parsed.success ? parsed.data : {};

    let filtered = [...MOCK_LEADS];

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.full_name?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.company?.toLowerCase().includes(q)
      );
    }
    if (params.status) filtered = filtered.filter((l) => l.status === params.status);
    if (params.score_min !== undefined) filtered = filtered.filter((l) => l.lead_score >= params.score_min!);
    if (params.score_max !== undefined) filtered = filtered.filter((l) => l.lead_score <= params.score_max!);

    const sortField = params.sort ?? "created_at";
    const sortOrder = params.order ?? "desc";
    filtered.sort((a, b) => {
      const aVal = a[sortField as keyof Lead] ?? "";
      const bVal = b[sortField as keyof Lead] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortOrder === "desc" ? -cmp : cmp;
    });

    const csv = buildCSV(filtered);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="leads.csv"',
      },
    });
  }

  // Production path — Supabase
  try {
    const supabase = await createClient();

    // Ensure the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const rawParams = Object.fromEntries(searchParams.entries());
    const parsed = exportParamsSchema.safeParse(rawParams);
    const params = parsed.success ? parsed.data : {};

    // Build the query — no pagination, up to MAX_EXPORT_ROWS
    let query = supabase.from("leads").select("*").limit(MAX_EXPORT_ROWS);

    // Search across full_name, email, company
    if (params.search) {
      const escaped = params.search.replace(/[%_]/g, "\\$&");
      query = query.or(
        `full_name.ilike.%${escaped}%,email.ilike.%${escaped}%,company.ilike.%${escaped}%`
      );
    }

    // Status filter
    if (params.status) {
      query = query.eq("status", params.status);
    }

    // Score range
    if (params.score_min !== undefined) {
      query = query.gte("lead_score", params.score_min);
    }
    if (params.score_max !== undefined) {
      query = query.lte("lead_score", params.score_max);
    }

    // Sorting
    const sortField = params.sort ?? "created_at";
    const sortOrder = params.order ?? "desc";
    query = query.order(sortField, { ascending: sortOrder === "asc" });

    const { data: leads, error } = await query;

    if (error) {
      console.error("Error fetching leads for export:", error);
      return NextResponse.json({ error: "Failed to export leads" }, { status: 500 });
    }

    const csv = buildCSV((leads ?? []) as Lead[]);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="leads.csv"',
      },
    });
  } catch (err) {
    console.error("Unexpected error in GET /api/leads/export:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
