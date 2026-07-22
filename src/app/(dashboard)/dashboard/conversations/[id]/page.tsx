import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Bot } from "lucide-react";
import type { Conversation, Lead } from "@/types";

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch conversation
  const { data: conv, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", id)
    .eq("business_id", user.id)
    .single();

  if (error || !conv) return notFound();

  const conversation = conv as Conversation;
  const messages = conversation.messages || [];

  // Fetch lead if exists
  let lead: Lead | null = null;
  if (conversation.lead_id) {
    const { data: l } = await supabase
      .from("leads")
      .select("*")
      .eq("id", conversation.lead_id)
      .single();
    lead = l as Lead | null;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/conversations" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {lead?.full_name || "Anonymous Visitor"}
          </h1>
          {lead?.email && <p className="text-sm text-gray-500">{lead.email}</p>}
        </div>
        {lead && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            lead.lead_score >= 80 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
            lead.lead_score >= 50 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
            "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
          }`}>
            Score: {lead.lead_score}
          </span>
        )}
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          conversation.status === "active" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
          conversation.status === "closed" ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" :
          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
        }`}>
          {conversation.status}
        </span>
        {lead && (
          <Link href={`/dashboard/leads/${lead.id}`} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
            View Lead →
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="space-y-4 pb-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No messages in this conversation yet.</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={msg.timestamp || i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user" ? "bg-blue-100 dark:bg-blue-900/30" : "bg-gray-100 dark:bg-gray-800"
                }`}>
                  {msg.role === "user" ? <User className="w-4 h-4 text-blue-600" /> : <Bot className="w-4 h-4 text-gray-600" />}
                </div>
                <div>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-md"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-md"
                  }`}>
                    {msg.content}
                  </div>
                  <p className={`text-xs text-gray-400 mt-1 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ""}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
