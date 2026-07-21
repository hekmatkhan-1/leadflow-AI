"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building,
  Calendar,
  Target,
  Briefcase,
  Clock,
  FileText,
  Hash,
  Globe,
  Save,
  X,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

import { cn } from "@/lib/utils";
import { Badge, scoreToBadgeVariant, scoreLabel, statusToBadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

import type { Lead, LeadStatus } from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const SCORE_COLOR: Record<string, string> = {
  hot: "text-green-600 dark:text-green-400",
  warm: "text-amber-600 dark:text-amber-400",
  cold: "text-gray-500 dark:text-gray-400",
};

const SCORE_BG: Record<string, string> = {
  hot: "bg-green-50 dark:bg-green-900/20",
  warm: "bg-amber-50 dark:bg-amber-900/20",
  cold: "bg-gray-100 dark:bg-gray-800",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LeadDetailProps {
  lead: Lead;
}

// ---------------------------------------------------------------------------
// Field definition for rendering
// ---------------------------------------------------------------------------

interface FieldDef {
  label: string;
  key: keyof Lead;
  icon: React.ReactNode;
  span?: "full";
}

const FIELDS: FieldDef[] = [
  { label: "Full Name", key: "full_name", icon: <User className="h-4 w-4" /> },
  { label: "Email", key: "email", icon: <Mail className="h-4 w-4" /> },
  { label: "Phone", key: "phone", icon: <Phone className="h-4 w-4" /> },
  { label: "Company", key: "company", icon: <Building className="h-4 w-4" /> },
  { label: "Industry", key: "industry", icon: <Briefcase className="h-4 w-4" /> },
  { label: "Budget", key: "budget", icon: <Target className="h-4 w-4" /> },
  { label: "Timeline", key: "timeline", icon: <Clock className="h-4 w-4" /> },
  { label: "Requirements", key: "requirements", icon: <FileText className="h-4 w-4" />, span: "full" },
];

// Editable single-line fields (excludes requirements + system fields)
const EDITABLE_FIELDS = FIELDS.filter(
  (f) => f.key !== "requirements" && f.key !== "id" && f.key !== "business_id" && f.key !== "created_at" && f.key !== "updated_at"
);

const STATUS_OPTIONS: { label: string; value: LeadStatus }[] = [
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Qualified", value: "qualified" },
  { label: "Converted", value: "converted" },
  { label: "Closed", value: "closed" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LeadDetail({ lead }: LeadDetailProps) {
  const router = useRouter();

  // Local edit state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Lead>>({});

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Score tier
  const tier = scoreLabel(lead.lead_score).toLowerCase(); // "hot" | "warm" | "cold"

  // -------------------------------------------------------------------------
  // Edit mode helpers
  // -------------------------------------------------------------------------

  const enterEditMode = () => {
    setForm({
      full_name: lead.full_name ?? "",
      email: lead.email ?? "",
      phone: lead.phone ?? "",
      company: lead.company ?? "",
      industry: lead.industry ?? "",
      budget: lead.budget ?? "",
      timeline: lead.timeline ?? "",
      requirements: lead.requirements ?? "",
      lead_score: lead.lead_score,
      status: lead.status,
      source: lead.source,
    });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setForm({});
  };

  const handleFieldChange = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error ?? "Failed to update lead");
        return;
      }
      toast.success("Lead updated");
      setEditing(false);
      router.refresh();
    } catch {
      toast.error("Failed to update lead");
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------------------------
  // Delete handler
  // -------------------------------------------------------------------------

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error ?? "Failed to delete lead");
        return;
      }
      toast.success("Lead deleted");
      router.push("/dashboard/leads");
    } catch {
      toast.error("Failed to delete lead");
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => router.push("/dashboard/leads")}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Leads
      </button>

      {/* Header row: title + actions */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {lead.full_name || "Unnamed Lead"}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Created {formatDate(lead.created_at)}
          </p>
        </div>

        {!editing && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={enterEditMode}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Score hero card */}
      <Card>
        <CardContent className="flex flex-col items-center py-8 sm:flex-row sm:gap-8 sm:py-6">
          <div
            className={cn(
              "flex h-28 w-28 shrink-0 items-center justify-center rounded-full",
              SCORE_BG[tier]
            )}
          >
            <div className="text-center">
              <span
                className={cn(
                  "text-4xl font-extrabold",
                  SCORE_COLOR[tier]
                )}
              >
                {lead.lead_score}
              </span>
              <p
                className={cn(
                  "mt-0.5 text-xs font-semibold uppercase tracking-wider",
                  SCORE_COLOR[tier]
                )}
              >
                / 100
              </p>
            </div>
          </div>
          <div className="mt-4 text-center sm:mt-0 sm:text-left">
            <Badge variant={scoreToBadgeVariant(lead.lead_score)} className="px-3 py-1 text-sm">
              {scoreLabel(lead.lead_score)} Lead
            </Badge>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              A score of {scoreLabel(lead.lead_score).toLowerCase()} means this lead has{" "}
              {tier === "hot"
                ? "high intent and is likely ready to convert"
                : tier === "warm"
                  ? "moderate interest — follow up to qualify further"
                  : "low engagement — nurture with targeted content"}
              .
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Details grid */}
      {editing ? (
        /* ---- Edit mode ---- */
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Lead
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {EDITABLE_FIELDS.map((field) => (
                <div key={field.key} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {field.label}
                  </label>
                  <Input
                    value={
                      (form[field.key as keyof typeof form] as string | number) ?? ""
                    }
                    onChange={(e) =>
                      handleFieldChange(field.key, e.target.value)
                    }
                    placeholder={field.label}
                  />
                </div>
              ))}

              {/* Status */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  value={form.status ?? "new"}
                  onChange={(e) => handleFieldChange("status", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-50"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Source */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Source
                </label>
                <Input
                  value={(form.source as string) ?? ""}
                  onChange={(e) => handleFieldChange("source", e.target.value)}
                  placeholder="e.g. chatbot, website, referral"
                />
              </div>

              {/* Lead Score */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Score
                </label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.lead_score ?? 0}
                  onChange={(e) =>
                    handleFieldChange("lead_score", Number(e.target.value))
                  }
                  placeholder="0–100"
                />
              </div>

              {/* Requirements — full width */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Requirements
                </label>
                <textarea
                  value={(form.requirements as string) ?? ""}
                  onChange={(e) =>
                    handleFieldChange("requirements", e.target.value)
                  }
                  rows={4}
                  placeholder="Describe the lead's requirements..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-50 dark:placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Edit actions */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
              <Button variant="ghost" onClick={cancelEdit} disabled={saving}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} isLoading={saving}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* ---- View mode ---- */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main details card — spans 2 columns */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Lead Details
              </h2>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                {FIELDS.map((field) => {
                  const value = lead[field.key];
                  const displayValue =
                    value !== null && value !== undefined && value !== ""
                      ? String(value)
                      : null;

                  return (
                    <div
                      key={field.key}
                      className={cn(
                        "flex items-start gap-3",
                        field.span === "full" && "sm:col-span-2"
                      )}
                    >
                      <span className="mt-0.5 shrink-0 text-gray-400 dark:text-gray-500">
                        {field.icon}
                      </span>
                      <div className="min-w-0">
                        <dt className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                          {field.label}
                        </dt>
                        <dd className="mt-0.5 text-sm text-gray-900 dark:text-white break-words">
                          {displayValue ?? (
                            <span className="italic text-gray-400 dark:text-gray-500">
                              Not provided
                            </span>
                          )}
                        </dd>
                      </div>
                    </div>
                  );
                })}
              </dl>
            </CardContent>
          </Card>

          {/* Sidebar card — status, source, meta */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Status & Meta
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-center gap-3">
                <Hash className="h-4 w-4 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Status
                  </p>
                  <Badge variant={statusToBadgeVariant(lead.status)} className="mt-1">
                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Source */}
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Source
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white capitalize">
                    {lead.source || "Unknown"}
                  </p>
                </div>
              </div>

              {/* Created date */}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Created
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(lead.created_at)}
                  </p>
                </div>
              </div>

              {/* Updated date */}
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Last Updated
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(lead.updated_at)}
                  </p>
                </div>
              </div>

              {/* Lead ID — small, muted */}
              <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Lead ID
                </p>
                <p className="mt-0.5 font-mono text-xs text-gray-500 dark:text-gray-400 break-all">
                  {lead.id}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => {
          if (!deleting) setDeleteModalOpen(false);
        }}
        title="Delete Lead"
        description={`Are you sure you want to delete ${lead.full_name || "this lead"}? This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        variant="danger"
      />
    </div>
  );
}
