/**
 * Chat API endpoint — the core AI-powered lead qualification chatbot.
 *
 * Called from the embed widget (public, no auth required).
 * Accepts a conversation history, streams it through OpenAI (gpt-4o-mini),
 * extracts lead data, and persists the conversation in Supabase.
 *
 * Falls back to mock responses when OPENAI_API_KEY is not set.
 */
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

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
// ---------------------------------------------------------------------------
interface LeadData {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  industry: string | null;
  budget: string | null;
  timeline: string | null;
  requirements: string | null;
}

// ---------------------------------------------------------------------------
// System prompt — instructs the model how to qualify leads
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are a professional lead qualification assistant for a B2B company. Your job is to have a natural conversation with website visitors to qualify them as potential leads. Follow these rules:

- Greet the visitor warmly and introduce yourself as a helpful assistant
- Ask qualifying questions ONE at a time, naturally weaving them into the conversation
- You need to collect: name, email, phone, company, industry, budget range, timeline, and requirements
- NEVER ask all questions at once — ask one, wait for the answer, then move to the next
- Remember previous answers and reference them naturally in follow-up questions
- Handle objections politely ("I'm just browsing", "Not interested", "Too expensive")
- If the visitor seems uninterested, be gracious and let them go
- If they provide all required information, thank them and let them know someone will follow up
- Keep responses concise (2-4 sentences max)
- Maintain a professional, helpful, and warm tone`;

// ---------------------------------------------------------------------------
// Mock response pool — used when OPENAI_API_KEY is missing
// ---------------------------------------------------------------------------
const MOCK_RESPONSES: { trigger: string; reply: string }[] = [
  {
    trigger: "initial",
    reply: "Hi there! 👋 Thanks for stopping by. I'd love to learn more about what brings you here today. What's your name?",
  },
  {
    trigger: "name",
    reply: "Great to meet you! And what's the best email address to reach you at?",
  },
  {
    trigger: "email",
    reply: "Thanks! And do you have a phone number where we could follow up if needed?",
  },
  {
    trigger: "phone",
    reply: "What company are you with? And what industry do you operate in?",
  },
  {
    trigger: "company",
    reply: "Interesting space! Could you give me a rough sense of your budget range for a solution like this?",
  },
  {
    trigger: "budget",
    reply: "Got it — and what's your timeline? Are you looking to move forward immediately, or is this more of a longer-term exploration?",
  },
  {
    trigger: "timeline",
    reply: "Last question — could you briefly describe your requirements or what you're hoping to achieve?",
  },
  {
    trigger: "requirements",
    reply: "That's really helpful, thank you! I've captured all the key details. Someone from our team will follow up with you soon. Have a great day! 😊",
  },
  {
    trigger: "objection",
    reply: "Totally understand — no pressure at all! Feel free to take your time. I'm here whenever you have questions.",
  },
];

// ---------------------------------------------------------------------------
// Lead extraction helpers
// ---------------------------------------------------------------------------

/** Simple regex-based lead extraction from the full conversation text. */
function extractLeadDataRegex(conversationText: string): LeadData {
  const data: LeadData = {
    full_name: null,
    email: null,
    phone: null,
    company: null,
    industry: null,
    budget: null,
    timeline: null,
    requirements: null,
  };

  // Email pattern
  const emailMatch = conversationText.match(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
  );
  if (emailMatch) data.email = emailMatch[0];

  // Phone pattern (handles common formats)
  const phoneMatch = conversationText.match(
    /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
  );
  if (phoneMatch) data.phone = phoneMatch[0];

  // Name patterns — "my name is X", "I'm X", "this is X"
  const namePatterns = [
    /my name is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i,
    /i'm\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})(?:[,.]|\s+and|\s+from|\s+at|\s+with|\s+my|\s+i'|\s+i\b)/i,
    /this is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i,
    /call me\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i,
  ];
  for (const pattern of namePatterns) {
    const match = conversationText.match(pattern);
    if (match && !data.full_name) {
      data.full_name = match[1].trim();
      break;
    }
  }
  // Fallback: first user message that looks like a name (2 capital words, 4-20 chars each)
  if (!data.full_name) {
    const nameFallback = conversationText.match(
      /\b([A-Z][a-z]{2,15}\s+[A-Z][a-z]{2,15})\b/,
    );
    if (nameFallback) data.full_name = nameFallback[1];
  }

  // Company
  const companyPatterns = [
    /(?:company|work at|work for|from)\s+(?:is\s+)?([A-Z][A-Za-z0-9\s&.,]{2,40}?)(?:[,.]|\s+and|\s+in\s|\s+we\s|\s+my\s|\s+i'|\s+i\b|\s+as\s)/i,
    /(?:at|with)\s+([A-Z][A-Za-z0-9&]{2,30}?)(?:[,.]|\s+and|\s+in\s|\s+we\s|\s+my\s|\s+i'|\s+i\b|\s+as\s)/i,
  ];
  for (const pattern of companyPatterns) {
    const match = conversationText.match(pattern);
    if (match) {
      data.company = match[1].trim();
      break;
    }
  }

  // Industry
  const industryPatterns = [
    /(?:industry|sector|field)\s+(?:is\s+)?(?:in\s+)?(?:the\s+)?([A-Za-z\s]{3,30}?)(?:[,.]|\s+and|\s+we\s|\s+my\s|\s+i'|\s+i\b|\s+with\s)/i,
    /(?:in\s+the\s+)([A-Za-z\s]{3,30}?)\s+(?:industry|sector|field|space)/i,
  ];
  for (const pattern of industryPatterns) {
    const match = conversationText.match(pattern);
    if (match) {
      data.industry = match[1].trim();
      break;
    }
  }

  // Budget
  const budgetMatch = conversationText.match(
    /(?:budget|spend|invest(?:ing|ment)?|range|allocate|price)\s+(?:is\s+)?(?:around\s+)?(?:about\s+)?([^,.]+?(?:\d[^,.]*)?)/i,
  );
  if (budgetMatch) data.budget = budgetMatch[1].trim();

  // Timeline
  const timelineMatch = conversationText.match(
    /(?:timeline|timeframe|when|looking to|plan(?:ning)? to|hoping to|need(?: this| it)?)\s+(?:is\s+)?(?:in\s+)?(?:the\s+)?(?:next\s+)?([^,.]+?(?:month|week|day|year|quarter|asap|immediately|soon|now)[^,.]*)/i,
  );
  if (timelineMatch) data.timeline = timelineMatch[1].trim();

  // Requirements
  const requirementsPatterns = [
    /(?:requirements|looking for|need|want|hoping to|trying to)\s+(?:is\s+)?(?:a\s+)?([^,.]+?(?:solution|tool|platform|software|system|app|service|help|automate|manage|improve|increase|reduce|grow)[^,.]*)/i,
    /(?:requirements|looking for|need|want)\s+(?:is\s+)?(?:to\s+)?([^,.]{10,200}?)(?:[,.]|\s+that'?s\s|\s+my\s+email|\s+my\s+phone)/i,
  ];
  for (const pattern of requirementsPatterns) {
    const match = conversationText.match(pattern);
    if (match) {
      data.requirements = match[1].trim();
      break;
    }
  }

  return data;
}

/** Check whether enough lead data has been collected to mark the lead as complete. */
function isLeadComplete(data: LeadData): boolean {
  const nonNullFields = Object.values(data).filter((v) => v !== null).length;
  // Require name + email + at least 3 other fields
  return data.full_name !== null && data.email !== null && nonNullFields >= 5;
}

// ---------------------------------------------------------------------------
// OpenAI-based lead extraction (structured output)
// ---------------------------------------------------------------------------
async function extractLeadDataAI(
  openai: OpenAI,
  conversationText: string,
): Promise<LeadData> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 300,
    messages: [
      {
        role: "system",
        content: `Extract lead qualification data from this B2B sales conversation. Return ONLY a JSON object with these fields (use null if not found):
{
  "full_name": string | null,
  "email": string | null,
  "phone": string | null,
  "company": string | null,
  "industry": string | null,
  "budget": string | null,
  "timeline": string | null,
  "requirements": string | null
}

Rules:
- Only extract information that the visitor explicitly shared
- Do not hallucinate or guess values
- Email must match standard email format
- For budget, capture the range or figure mentioned
- Return valid JSON only, no markdown or commentary`,
      },
      { role: "user", content: conversationText },
    ],
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(raw) as LeadData;
  } catch {
    return {
      full_name: null,
      email: null,
      phone: null,
      company: null,
      industry: null,
      budget: null,
      timeline: null,
      requirements: null,
    };
  }
}

// ---------------------------------------------------------------------------
// Conversation persistence
// ---------------------------------------------------------------------------
async function upsertConversation(params: {
  business_id: string;
  visitor_id: string;
  newMessages: { role: string; content: string; timestamp: string }[];
}) {
  const { business_id, visitor_id, newMessages } = params;
  const adminClient = createAdminClient();

  // Look for an existing active conversation for this visitor + business
  const { data: existing } = await adminClient
    .from("conversations")
    .select("id, messages")
    .eq("business_id", business_id)
    .eq("visitor_id", visitor_id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    // Append new messages to the existing array
    const existingMessages = Array.isArray(existing.messages) ? existing.messages : [];
    await adminClient
      .from("conversations")
      .update({
        messages: [...existingMessages, ...newMessages],
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    // Validate business_id exists
    const { data: business } = await adminClient
      .from("businesses")
      .select("id")
      .eq("id", business_id)
      .maybeSingle();

    if (!business) {
      // Silently skip storage for invalid business IDs
      return;
    }

    // Create a new conversation
    await adminClient.from("conversations").insert({
      business_id,
      visitor_id,
      messages: newMessages,
      status: "active",
    });
  }
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  // 1. Parse and validate the request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { messages, visitor_id, business_id } = parsed.data;

  // Build conversation text for lead extraction
  const conversationText = messages
    .map((m) => `[${m.role}]: ${m.content}`)
    .join("\n");

  // 2. Initialize OpenAI client (if key is available)
  const apiKey = process.env.OPENAI_API_KEY;
  const hasOpenAI = !!apiKey && apiKey.startsWith("sk-");
  const openai = hasOpenAI ? new OpenAI({ apiKey }) : null;

  // 3. Generate the assistant reply
  let reply: string;

  if (openai) {
    // --- OpenAI path ---
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 300,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map((m) => ({
            role: m.role as "user" | "assistant" | "system",
            content: m.content,
          })),
        ],
      });

      reply =
        completion.choices[0]?.message?.content ??
        "I'm sorry, I'm having trouble responding right now. Could you try again?";
    } catch (error) {
      console.error("OpenAI chat error:", error);
      reply =
        "I apologize, but I'm experiencing a temporary issue. Please try again in a moment, or feel free to leave your email and we'll reach out directly.";
    }
  } else {
    // --- Mock fallback path ---
    // Progress through mock stages based on conversation length
    const userMessageCount = messages.filter((m) => m.role === "user").length;
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    const lastUserContent = lastUserMessage?.content?.toLowerCase() ?? "";

    // Detect objections
    const objectionKeywords = [
      "just browsing",
      "just looking",
      "not interested",
      "too expensive",
      "no thanks",
      "leave me alone",
    ];
    const isObjection = objectionKeywords.some((kw) => lastUserContent.includes(kw));

    if (isObjection && userMessageCount > 1) {
      reply = MOCK_RESPONSES.find((r) => r.trigger === "objection")!.reply;
    } else {
      const stages = MOCK_RESPONSES.filter((r) => r.trigger !== "objection");
      const stageIndex = Math.min(userMessageCount, stages.length - 1);
      reply = stages[stageIndex].reply;
    }
  }

  // 4. Extract lead data from the conversation
  let leadData: LeadData;
  if (openai) {
    try {
      // Combine existing conversation with the new reply for extraction
      const fullText = conversationText + `\n[assistant]: ${reply}`;
      leadData = await extractLeadDataAI(openai, fullText);
    } catch (error) {
      console.error("OpenAI extraction error:", error);
      leadData = extractLeadDataRegex(conversationText);
    }
  } else {
    leadData = extractLeadDataRegex(conversationText);
  }

  const complete = isLeadComplete(leadData);

  // 5. Persist conversation in Supabase (if business_id is provided)
  if (business_id) {
    const timestamp = new Date().toISOString();
    const lastUserMsg = messages[messages.length - 1];
    const newMessages: { role: string; content: string; timestamp: string }[] = [];

    // Only add the last user message + our reply to avoid duplicates
    if (lastUserMsg && lastUserMsg.role === "user") {
      newMessages.push(lastUserMsg);
    }
    newMessages.push({ role: "assistant", content: reply, timestamp });

    try {
      await upsertConversation({ business_id, visitor_id, newMessages });
    } catch (error) {
      console.error("Supabase conversation storage error:", error);
      // Non-fatal — response still succeeds even if storage fails
    }
  }

  // 6. Return the formatted response
  return NextResponse.json({
    reply,
    lead_data: Object.values(leadData).some((v) => v !== null) ? leadData : null,
    is_complete: complete,
  });
}
