/**
 * Public settings API — returns business-specific widget configuration.
 *
 * Called from the embed widget at runtime (no auth required).
 * Uses the admin client to bypass RLS since embed scripts run on
 * third-party websites with no authenticated user context.
 *
 * GET /api/settings?bid=BUSINESS_ID
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------------
// Default settings returned when bid is missing or business not found
// ---------------------------------------------------------------------------
const DEFAULTS = {
  chatbot_name: "LeadFlow AI",
  welcome_message: "Hi! How can I help you today?",
  brand_color: "#3b82f6",
  logo_url: "",
  business_hours: "",
};

export interface PublicSettings {
  chatbot_name: string;
  welcome_message: string;
  brand_color: string;
  logo_url: string;
  business_hours: string;
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const bid = searchParams.get("bid");

  // No bid provided — return defaults
  if (!bid) {
    return NextResponse.json(DEFAULTS);
  }

  try {
    const adminClient = createAdminClient();

    const { data } = await adminClient
      .from("businesses")
      .select("company_name, settings")
      .eq("id", bid)
      .maybeSingle();

    if (!data) {
      return NextResponse.json(DEFAULTS);
    }

    const s = (data.settings ?? {}) as Record<string, unknown>;

    return NextResponse.json({
      chatbot_name:
        (data.company_name as string) || DEFAULTS.chatbot_name,
      welcome_message:
        (s.welcome_message as string) || DEFAULTS.welcome_message,
      brand_color:
        (s.brand_color as string) || DEFAULTS.brand_color,
      logo_url:
        (s.logo_url as string) || DEFAULTS.logo_url,
      business_hours:
        (s.business_hours as string) || DEFAULTS.business_hours,
    } satisfies PublicSettings);
  } catch (error) {
    console.error("Settings API error:", error);
    // On any error, fall back to defaults so the widget still works
    return NextResponse.json(DEFAULTS);
  }
}
