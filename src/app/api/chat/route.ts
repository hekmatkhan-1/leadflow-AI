/**
 * Chat API endpoint — the core AI-powered lead qualification chatbot.
 *
 * Called from the embed widget (public, no auth required).
 * Tries Mistral AI first; automatically falls back to Google Gemini if Mistral
 * fails (e.g. rate limit). Extracts lead data, scores the lead, and persists
 * both the lead and the conversation in Supabase.
 *
 * Falls back to mock responses if neither AI provider is available.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { scoreLead } from "@/lib/scoring";

// ---------------------------------------------------------------------------
// Zod schema — validates the incoming request body
// ---------------------------------------------------------------------------
const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  timestamp: z.string(),
});

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1, "At least one message is required"),
  visitor_id: z.string().min(1, "visitor_id is required"),
  business_id: z.string().uuid().optional(),
});

// ---------------------------------------------------------------------------
// Extracted lead data shape