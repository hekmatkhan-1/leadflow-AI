import {
  Users,
  Flame,
  Thermometer,
  Snowflake,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";

// ---------------------------------------------------------------------------
// Dashboard home — stats overview & recent conversations
// ---------------------------------------------------------------------------
export default function DashboardHomePage() {
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
          value={142}
          accent="indigo"
          trend="up"
          trendLabel="+12% this month"
          icon={<Users className="h-5 w-5" />}
        />
        <StatsCard
          title="Hot Leads"
          value={28}
          accent="red"
          trend="up"
          trendLabel="+8% this month"
          icon={<Flame className="h-5 w-5" />}
        />
        <StatsCard
          title="Warm Leads"
          value={47}
          accent="amber"
          trend="neutral"
          trendLabel="Same as last month"
          icon={<Thermometer className="h-5 w-5" />}
        />
        <StatsCard
          title="Cold Leads"
          value={67}
          accent="blue"
          trend="down"
          trendLabel="-5% this month"
          icon={<Snowflake className="h-5 w-5" />}
        />
      </div>

      {/* Second row: conversion rate */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Conversion Rate"
          value="19.7%"
          accent="green"
          trend="up"
          trendLabel="+2.1% this month"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Recent conversations placeholder */}
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

        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 dark:border-gray-700 dark:bg-gray-800/50">
          <MessageSquare className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            No conversations yet
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Once your chatbot engages visitors, conversations will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
