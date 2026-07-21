import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/types";

// ---------------------------------------------------------------
// Zod partial schema for PATCH
// ---------------------------------------------------------------

const leadUpdateSchema = z.object({
  full_name: z.string().min(1).optional(),
  email: z.string().email().optional(),
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

// ---------------------------------------------------------------
// Mock lead store (in-memory for dev fallback)
// ---------------------------------------------------------------

// Shared mock data — seeded with a few IDs to match the list mock
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

// ---------------------------------------------------------------
// GET /api/leads/[id] — fetch a single lead
// ---------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Graceful fallback: mock data when Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const lead = MOCK_LEADS[id];
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    return NextResponse.json(lead);
  }

  // Production path — Supabase
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: lead, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      // PGRST116 is "no rows returned" — treat as 404
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }
      console.error("Error fetching lead:", error);
      return NextResponse.json({ error: "Failed to fetch lead" }, { status: 500 });
    }

    // RLS ensures we can only see leads we own; if null, treat as not found
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json(lead as Lead);
  } catch (err) {
    console.error("Unexpected error in GET /api/leads/[id]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ---------------------------------------------------------------
// PATCH /api/leads/[id] — update a lead
// ---------------------------------------------------------------

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Graceful fallback: mock data when Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const existing = MOCK_LEADS[id];
    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = leadUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const updated: Lead = {
      ...existing,
      ...parsed.data,
      // Normalize optional-to-nullable fields
      phone: parsed.data.phone !== undefined ? parsed.data.phone : existing.phone,
      company: parsed.data.company !== undefined ? parsed.data.company : existing.company,
      industry: parsed.data.industry !== undefined ? parsed.data.industry : existing.industry,
      budget: parsed.data.budget !== undefined ? parsed.data.budget : existing.budget,
      timeline: parsed.data.timeline !== undefined ? parsed.data.timeline : existing.timeline,
      requirements: parsed.data.requirements !== undefined ? parsed.data.requirements : existing.requirements,
      updated_at: new Date().toISOString(),
    };

    MOCK_LEADS[id] = updated;
    return NextResponse.json(updated);
  }

  // Production path — Supabase
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First verify the lead exists and belongs to this business
    const { data: existing, error: fetchError } = await supabase
      .from("leads")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      // RLS may hide the row; return 404 to avoid leaking existence info
      if (fetchError?.code === "PGRST116" || !existing) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }
      console.error("Error verifying lead ownership:", fetchError);
      return NextResponse.json({ error: "Failed to verify lead" }, { status: 500 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = leadUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    // Only send fields that were actually provided (not undefined)
    // zod optional fields that are undefined won't appear in parsed.data
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data: updated, error: updateError } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating lead:", updateError);
      return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
    }

    return NextResponse.json(updated as Lead);
  } catch (err) {
    console.error("Unexpected error in PATCH /api/leads/[id]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ---------------------------------------------------------------
// DELETE /api/leads/[id] — delete a lead
// ---------------------------------------------------------------

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Graceful fallback: mock data when Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (!MOCK_LEADS[id]) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    delete MOCK_LEADS[id];
    return NextResponse.json({ success: true });
  }

  // Production path — Supabase
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First verify the lead exists (RLS ensures ownership)
    const { data: existing, error: fetchError } = await supabase
      .from("leads")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      if (fetchError?.code === "PGRST116" || !existing) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }
      console.error("Error verifying lead ownership:", fetchError);
      return NextResponse.json({ error: "Failed to verify lead" }, { status: 500 });
    }

    const { error: deleteError } = await supabase
      .from("leads")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting lead:", deleteError);
      return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected error in DELETE /api/leads/[id]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
