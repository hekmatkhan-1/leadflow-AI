"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  Bot,
  Palette,
  Code,
  Clock,
  Mail,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyEmbedButton } from "@/components/copy-embed-button";
import { saveSettingsAction } from "@/app/(dashboard)/dashboard/settings/actions";

interface SettingsFormProps {
  initialSettings: {
    chatbot_greeting: string;
    welcome_message: string;
    brand_color: string;
    business_hours: string;
    contact_email: string;
  };
  embedSnippet: string;
}

export function SettingsForm({ initialSettings, embedSnippet }: SettingsFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [brandColor, setBrandColor] = useState(initialSettings.brand_color);

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    const result = await saveSettingsAction(formData);
    setIsSaving(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Settings saved!");
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Chatbot Configuration
            </h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            name="chatbot_greeting"
            label="Greeting message"
            defaultValue={initialSettings.chatbot_greeting}
            placeholder="Enter greeting message..."
          />
          <Input
            name="welcome_message"
            label="Welcome message"
            defaultValue={initialSettings.welcome_message}
            placeholder="Enter welcome message..."
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Business hours
            </label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <Input
                name="business_hours"
                defaultValue={initialSettings.business_hours}
                placeholder="9:00 AM - 5:00 PM EST"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Branding
            </h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Brand color
            </label>
            <input
              type="color"
              name="brand_color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="h-9 w-16 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {brandColor}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Contact Information
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          <Input
            name="contact_email"
            label="Contact email"
            type="email"
            defaultValue={initialSettings.contact_email}
            placeholder="you@company.com"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Embed Code
            </h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Add this script to your website&apos;s{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono dark:bg-gray-800">
              &lt;head&gt;
            </code>{" "}
            to activate the LeadFlow AI chatbot. No other setup required.
          </p>
          <div className="relative">
            <textarea
              readOnly
              rows={8}
              value={embedSnippet}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 font-mono text-xs text-gray-700 p-4 resize-none focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            />
            <CopyEmbedButton text={embedSnippet} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </form>
  );
        }
