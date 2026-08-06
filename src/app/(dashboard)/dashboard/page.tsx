import {
  Users,
  Flame,
  Thermometer,
  Snowflake,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { redirect } from "next/navigation";
import { StatsCard } from "@/components/dashboard/stats-card";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Dashboard home — stats overview & recent conversations (live data)
// ---------------------------------------------------------------------------
export default async function DashboardHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch all leads for this business to compute stats
  const { data: leads } = await supabase
    .from("leads")
    .select("lead_score")
    .eq("business_id", user.id);

  const allLeads = leads ?? [];
  const total = allLeads.length;
  const hot = allLeads.filter((l) => l.lead_score >= 80).length;
  const warm = allLeads.filter((l) => l.lead_score >= 50 && l.lead_score < 80).length;
  const cold = allLeads.filter((l) => l.lead_score < 50).length;
  const conversionRate = total > 0 ? ((hot / total) * 100).toFixed(1) : "0.0";

  // Fetch recent conversations
  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, visitor_id, messages, updated_at")
    .eq("business_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(5);

  const recentConversations = conversations ?? [];

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Your lead qualification overview at a glance.
        </p>
      </div>

      {/* Stats cards grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Leads"
          value={total}
          accent="indigo"
          trend="neutral"
          trendLabel="All time"
          icon={<Users className="h-5 w-5" />}
        />
        <StatsCard
          title="Hot Leads"
          value={hot}
          accent="red"
          trend="neutral"
          trendLabel="Score 80+"
          icon={<Flame className="h-5 w-5" />}
        />
        <StatsCard
          title="Warm Leads"
          value={warm}
          accent="amber"
          trend="neutral"
          trendLabel="Score 50-79"
          icon={<Thermometer className="h-5 w-5" />}
        />
        <StatsCard
          title="Cold Leads"
          value={cold}
          accent="blue"
          trend="neutral"
          trendLabel="Score below 50"
          icon={<Snowflake className="h-5 w-5" />}
        />
      </div>

      {/* Second row: conversion rate */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          accent="green"
          trend="neutral"
          trendLabel="Hot leads / total"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Recent conversations */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Conversations
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Latest interactions with your leads.
            </p>
          </div>
        </div>

        {recentConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 dark:border-gray-700 dark:bg-gray-800/50">
            <MessageSquare className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              No conversations yet
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Once your chatbot engages visitors, conversations will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentConversations.map((conv) => {
              const msgs = Array.isArray(conv.messages) ? conv.messages : [];
              const lastMsg = msgs[msgs.length - 1];
              const preview =
                typeof lastMsg?.content === "string"
                  ? lastMsg.content.slice(0, 100)
                  : "No messages yet";

              return (
                <div
                  key={conv.id}
                  className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Visitor {conv.visitor_id?.slice(0, 12) ?? "Anonymous"}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {preview}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                    {conv.updated_at
                      ? new Date(conv.updated_at).toLocaleDateString()
                      : ""}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
