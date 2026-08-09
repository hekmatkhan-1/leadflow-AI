import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Search,
  Filter,
  Plus,
  Users,
  ArrowUpDown,
} from "lucide-react";
import { Badge, scoreToBadgeVariant, statusToBadgeVariant } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { Lead } from "@/types";

// ---------------------------------------------------------------------------
// Mock data — used when Supabase env vars are not configured
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function LeadsPage() {
  let leads: Lead[] = [];

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) leads = data as Lead[];
    } catch {
      leads = MOCK_LEADS;
    }
  } else {
    leads = MOCK_LEADS;
  }

  const totalLeads = leads.length;
  const hotLeads = leads.filter((l) => l.lead_score >= 80).length;
  const qualifiedLeads = leads.filter((l) => l.status === "qualified" || l.status === "converted").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Leads
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and qualify your incoming leads.
          </p>
        </div>
        <Link href="/dashboard/leads/new">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalLeads}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Leads</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <ArrowUpDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{hotLeads}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Hot Leads</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <Filter className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{qualifiedLeads}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Qualified / Converted</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search bar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-50 dark:placeholder:text-gray-500"
            placeholder="Search by name, email, or company..."
            readOnly
          />
        </div>
      </div>

      {/* Leads table */}
      {leads.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Users}
              title="No leads yet"
              description="Leads captured by your chatbot will appear here as soon as a visitor shares their contact info."
              actionLabel="Copy your embed code"
              actionHref="/dashboard/settings"
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              All Leads ({leads.length})
            </h2>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-t border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Source</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-6 py-3">
                      <Link
                        href={`/dashboard/leads/${lead.id}`}
                        className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        {lead.full_name || "Unnamed"}
                      </Link>
                      {lead.email && (
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {lead.email}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-700 dark:text-gray-300">
                      {lead.company || "—"}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={scoreToBadgeVariant(lead.lead_score)}>
                        {lead.lead_score}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={statusToBadgeVariant(lead.status)}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-gray-500 dark:text-gray-400 capitalize">
                      {lead.source}
                    </td>
                    <td className="px-6 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
