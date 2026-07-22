import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Bot,
  User,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Conversation } from "@/types";

// ---------------------------------------------------------------------------
// Mock data — used when Supabase env vars are not configured
// ---------------------------------------------------------------------------

const MOCK_CONVERSATIONS: (Conversation & { lead_name?: string; lead_email?: string | null; lead_score?: number })[] = [
  {
    id: "conv-001",
    lead_id: "550e8400-e29b-41d4-a716-446655440000",
    business_id: "mock-business-id",
    visitor_id: "visitor-001",
    messages: [
      { role: "user", content: "Hi, I'm looking for a chatbot solution", timestamp: "2026-07-15T10:30:00Z" },
      { role: "assistant", content: "Hi there! 👋 Thanks for stopping by. I'd love to learn more about what brings you here today. What's your name?", timestamp: "2026-07-15T10:30:05Z" },
    ],
    status: "active",
    created_at: "2026-07-15T10:30:00Z",
    updated_at: "2026-07-15T10:35:00Z",
    lead_name: "Alice Johnson",
    lead_email: "alice@example.com",
    lead_score: 85,
  },
  {
    id: "conv-002",
    lead_id: "550e8400-e29b-41d4-a716-446655440001",
    business_id: "mock-business-id",
    visitor_id: "visitor-002",
    messages: [
      { role: "user", content: "I need enterprise lead qualification", timestamp: "2026-07-16T14:00:00Z" },
      { role: "assistant", content: "Great to meet you! And what's the best email address to reach you at?", timestamp: "2026-07-16T14:00:05Z" },
    ],
    status: "active",
    created_at: "2026-07-16T14:00:00Z",
    updated_at: "2026-07-16T14:05:00Z",
    lead_name: "Bob Smith",
    lead_email: "bob@example.com",
    lead_score: 92,
  },
  {
    id: "conv-003",
    lead_id: null,
    business_id: "mock-business-id",
    visitor_id: "visitor-003",
    messages: [
      { role: "user", content: "Just browsing", timestamp: "2026-07-17T09:00:00Z" },
      { role: "assistant", content: "Totally understand — no pressure at all! Feel free to take your time.", timestamp: "2026-07-17T09:00:05Z" },
    ],
    status: "closed",
    created_at: "2026-07-17T09:00:00Z",
    updated_at: "2026-07-17T09:01:00Z",
    lead_name: "Anonymous",
    lead_email: null,
    lead_score: 0,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function conversationExcerpt(messages: { content: string }[]): string {
  const last = messages[messages.length - 1];
  if (!last) return "No messages";
  const excerpt = last.content.slice(0, 100);
  return excerpt.length < last.content.length ? `${excerpt}...` : excerpt;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString();
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ConversationsPage() {
  let conversations: typeof MOCK_CONVERSATIONS = [];

  // Try Supabase first; fall back to mock data
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(50);
      if (data) conversations = data as typeof MOCK_CONVERSATIONS;
    } catch {
      conversations = MOCK_CONVERSATIONS;
    }
  } else {
    conversations = MOCK_CONVERSATIONS;
  }

  const activeCount = conversations.filter((c) => c.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Conversations
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Review chatbot interactions with your website visitors.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{conversations.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Conversations</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {conversations.filter((c) => c.lead_id).length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Linked to Leads</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search bar */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-50 dark:placeholder:text-gray-500"
          placeholder="Search conversations..."
          readOnly
        />
      </div>

      {/* Conversations list */}
      {conversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              No conversations yet
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Conversations from your chatbot will appear here once visitors start engaging.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {conversations.map((conv) => {
            const isActive = conv.status === "active";
            return (
              <Link
                key={conv.id}
                href={`/dashboard/conversations/${conv.id}`}
                className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-primary-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        isActive
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {conv.lead_id ? (
                        <User className="h-5 w-5" />
                      ) : (
                        <Bot className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {conv.lead_name || "Anonymous Visitor"}
                        </h3>
                        {(conv.lead_score ?? 0) > 0 && (
                          <Badge variant={conv.lead_score! >= 80 ? "hot" : conv.lead_score! >= 50 ? "warm" : "cold"}>
                            {conv.lead_score}
                          </Badge>
                        )}
                      </div>
                      {conv.lead_email && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {conv.lead_email}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                        {conversationExcerpt(conv.messages)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <Badge variant={isActive ? "info" : "default"}>
                      {conv.status}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                      <Clock className="h-3 w-3" />
                      {formatTime(conv.updated_at)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
