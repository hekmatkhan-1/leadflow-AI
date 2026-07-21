import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/types";

// ---------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------

const leadCreateSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  budget: z.string().optional().nullable(),
  timeline: z.string().optional().nullable(),
  requirements: z.string().optional().nullable(),
  lead_score: z.number().int().min(0).max(100).optional(),
  status: z.enum(["new", "contacted", "qualified", "converted", "closed"]).optional(),
  source: z.string().optional(),
});

const queryParamsSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["new", "contacted", "qualified", "converted", "closed"]).optional(),
  score_min: z.coerce.number().int().min(0).max(100).optional(),
  score_max: z.coerce.number().int().min(0).max(100).optional(),
  sort: z.enum(["created_at", "full_name", "email", "company", "lead_score", "status"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

// ---------------------------------------------------------------
// Mock data for dev (when Supabase env vars are missing)
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
// GET /api/leads — list leads with filtering, sorting, pagination
// ---------------------------------------------------------------

export async function GET(request: NextRequest) {
  // Graceful fallback: return mock data when Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const { searchParams } = request.nextUrl;
    const rawParams = Object.fromEntries(searchParams.entries());
    const parsed = queryParamsSchema.safeParse(rawParams);
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

    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const leads = filtered.slice(start, start + limit);

    return NextResponse.json({ leads, total, page, totalPages });
  }

  // Production path — Supabase
  try {
    const supabase = await createClient();
    const { searchParams } = request.nextUrl;
    const rawParams = Object.fromEntries(searchParams.entries());
    const parsed = queryParamsSchema.safeParse(rawParams);
    const params = parsed.success ? parsed.data : {};

    // Build the base query
    let query = supabase.from("leads").select("*", { count: "exact" });

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

    // Pagination
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    query = query.range(start, end);

    const { data: leads, count, error } = await query;

    if (error) {
      console.error("Error fetching leads:", error);
      return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ leads: leads as Lead[], total, page, totalPages });
  } catch (err) {
    console.error("Unexpected error in GET /api/leads:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ---------------------------------------------------------------
// POST /api/leads — create a new lead
// ---------------------------------------------------------------

export async function POST(request: NextRequest) {
  // Graceful fallback: return mock data when Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const parsed = leadCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const mockLead: Lead = {
      id: crypto.randomUUID(),
      business_id: "mock-business-id",
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone ?? null,
      company: parsed.data.company ?? null,
      industry: parsed.data.industry ?? null,
      budget: parsed.data.budget ?? null,
      timeline: parsed.data.timeline ?? null,
      requirements: parsed.data.requirements ?? null,
      lead_score: parsed.data.lead_score ?? 0,
      status: parsed.data.status ?? "new",
      source: parsed.data.source ?? "api",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(mockLead, { status: 201 });
  }

  // Production path — Supabase
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = leadCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        business_id: user.id,
        full_name: parsed.data.full_name,
        email: parsed.data.email,
        phone: parsed.data.phone ?? null,
        company: parsed.data.company ?? null,
        industry: parsed.data.industry ?? null,
        budget: parsed.data.budget ?? null,
        timeline: parsed.data.timeline ?? null,
        requirements: parsed.data.requirements ?? null,
        lead_score: parsed.data.lead_score ?? 0,
        status: parsed.data.status ?? "new",
        source: parsed.data.source ?? "api",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating lead:", error);
      return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
    }

    return NextResponse.json(lead as Lead, { status: 201 });
  } catch (err) {
    console.error("Unexpected error in POST /api/leads:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
